import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import jwt from "jsonwebtoken";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || "development_secret";
const scryptAsync = promisify(scrypt);

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

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    req.user = { id: decoded.id } as Express.User;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export function setupAuth(app: Express) {
  passport.use(
    new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password'
    }, async (email, password, done) => {
      try {
        // Try to find user by email first, then by username if email fails
        let user = await storage.getUserByEmail(email);
        if (!user) {
          user = await storage.getUserByUsername(email); // Allow username login as fallback
        }

        if (!user) {
          return done(null, false, { message: "Invalid credentials" });
        }

        if (!(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Invalid credentials" });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }),
  );

  app.post("/api/register", async (req, res) => {
    try {
      const { email, username } = req.body;

      // Check for existing email or username
      const existingUser = await storage.getUserByEmail(email) || 
                          await storage.getUserByUsername(username);

      if (existingUser) {
        return res.status(400).json({ 
          message: "User already exists with this email or username" 
        });
      }

      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
      });

      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "24h" });
      res.status(201).json({ user, token });
    } catch (err) {
      console.error('Registration error:', err);
      res.status(500).json({ message: "Server error during registration" });
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: Error, user: SelectUser, info: any) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }

      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "24h" });
      res.json({ user, token });
    })(req, res, next);
  });

  app.get("/api/user", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (err) {
      console.error('Get user error:', err);
      res.status(500).json({ message: "Server error while fetching user" });
    }
  });
}