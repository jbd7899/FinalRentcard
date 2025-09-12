import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import jwt from "jsonwebtoken";
import { storage } from "./storage";
import { User as SelectUser, insertUserSchema } from "@shared/schema";
import session from "express-session";
import MemoryStore from "memorystore";

// Safe user mapper to exclude sensitive fields from API responses
export function createSafeUserResponse(user: SelectUser): Omit<SelectUser, 'password'> {
  const { password, ...safeUser } = user;
  return safeUser;
}

// Type for sanitized user without password
export type SafeUser = Omit<SelectUser, 'password'>;

// Fix the type error by declaring the User interface
declare global {
  namespace Express {
    interface User extends SafeUser {}
  }
}

const JWT_SECRET = process.env.JWT_SECRET || "development_secret";
const SESSION_SECRET = process.env.SESSION_SECRET || "session_secret";
const scryptAsync = promisify(scrypt);

// Configure session store based on environment
const MemoryStoreSession = MemoryStore(session);
const sessionStore = process.env.NODE_ENV === 'production' 
  ? storage.sessionStore 
  : new MemoryStoreSession({
      checkPeriod: 86400000 // prune expired entries every 24h
    });

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // Configure session middleware
  app.use(session({
    store: sessionStore,
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    name: 'sid', // Change cookie name from connect.sid
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax'
    }
  }));

  // Initialize passport and restore authentication state from session
  app.use(passport.initialize());
  app.use(passport.session());

  // Set up passport serialization
  passport.serializeUser((user: Express.User, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (user) {
        done(null, createSafeUserResponse(user));
      } else {
        done(null, false);
      }
    } catch (err) {
      done(err);
    }
  });

  passport.use(
    new LocalStrategy(
      { usernameField: 'email' },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user || !(await comparePasswords(password, user.password))) {
            return done(null, false, { message: 'Invalid credentials' });
          }
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  app.post("/api/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);

      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const hashedPassword = await hashPassword(validatedData.password);
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
      });

      // Create the appropriate profile based on user type
      if (validatedData.userType === 'tenant') {
        await storage.createTenantProfile({
          userId: user.id,
          moveInDate: null,
          maxRent: null,
          employmentInfo: null,
          creditScore: null,
          rentalHistory: null,
        });
      } else if (validatedData.userType === 'landlord') {
        await storage.createLandlordProfile({
          userId: user.id,
          companyName: null,
          screeningCriteria: null,
        });
      }

      // Generate JWT token
      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "24h" });
      
      // Log the user in (create session) with sanitized user
      const safeUser = createSafeUserResponse(user);
      req.login(safeUser, (err) => {
        if (err) {
          return res.status(500).json({ message: "Error logging in after registration" });
        }
        res.status(201).json({ user: safeUser, token });
      });
    } catch (err) {
      console.error('Registration error:', err);
      res.status(400).json({ 
        message: "Invalid registration data",
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: Error | null, user: SelectUser | false, info: any) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }

      // Generate JWT token
      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "24h" });

      // Log the user in (create session) with sanitized user
      const safeUser = createSafeUserResponse(user);
      req.login(safeUser, (err) => {
        if (err) {
          return res.status(500).json({ message: "Error creating session" });
        }
        res.json({ user: safeUser, token });
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res) => {
    req.logout(() => {
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/user", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(createSafeUserResponse(user));
    } catch (err) {
      console.error('Get user error:', err);
      res.status(500).json({ message: "Server error" });
    }
  });
}

// Middleware to verify authentication using both session and JWT
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  // First check session authentication
  if (req.isAuthenticated()) {
    return next();
  }

  // If no session, check JWT
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "No authentication provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    const user = await storage.getUser(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    req.user = createSafeUserResponse(user);
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};