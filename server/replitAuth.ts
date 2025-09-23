import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

const hasReplitConfig = Boolean(process.env.REPLIT_DOMAINS && process.env.REPL_ID);

// TypeScript type definitions for Replit Auth
declare global {
  namespace Express {
    interface User {
      claims: {
        sub: string;
        email?: string;
        first_name?: string;
        last_name?: string;
        profile_image_url?: string;
        exp?: number;
        [key: string]: any;
      };
      access_token?: string;
      refresh_token?: string;
      expires_at?: number;
      isTestUser?: boolean;
      id?: string;
    }
  }
}

const getOidcConfig = memoize(
  async () => {
    if (!hasReplitConfig) {
      throw new Error("Replit Auth configuration is not available");
    }

    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!,
    );
  },
  { maxAge: 3600 * 1000 },
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(claims: any) {
  // Check if user already exists by email (not by OAuth sub)
  const existingUser = await storage.getUserByEmail(claims["email"]);

  if (existingUser) {
    // Update existing user
    const user = await storage.updateUser(existingUser.id, {
      firstName: claims["first_name"],
      lastName: claims["last_name"],
      profileImageUrl: claims["profile_image_url"],
      // Preserve existing userType, don't overwrite
      // Only set requiresSetup if they don't have a role
      requiresSetup: !existingUser.userType,
      availableRoles: {
        tenant: true,
        landlord: true,
      },
    });
    return user;
  } else {
    // Create new user (ID will be auto-generated)
    const user = await storage.createUser({
      email: claims["email"],
      firstName: claims["first_name"],
      lastName: claims["last_name"],
      profileImageUrl: claims["profile_image_url"],
      userType: null,
      requiresSetup: true,
      availableRoles: {
        tenant: true,
        landlord: true,
      },
    });
    return user;
  }
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const enableTestLogin =
    process.env.ENABLE_DEV_LOGIN === "true" || process.env.NODE_ENV !== "production";

  if (!hasReplitConfig) {
    console.warn("⚠️  Replit Auth configuration not detected. Skipping OAuth setup.");
  }

  let config: Awaited<ReturnType<typeof getOidcConfig>> | null = null;

  if (hasReplitConfig) {
    config = await getOidcConfig();

    const verify: VerifyFunction = async (
      tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
      verified: passport.AuthenticateCallback,
    ) => {
      const user = {} as Express.User;
      updateUserSession(user, tokens);
      const dbUser = await upsertUser(tokens.claims());
      // Store the actual database user ID in the session
      user.claims.dbUserId = dbUser.id;
      user.id = dbUser.id;
      verified(null, user);
    };

    for (const domain of process.env.REPLIT_DOMAINS!.split(",")) {
      const strategy = new Strategy(
        {
          name: `replitauth:${domain}`,
          config,
          scope: "openid email profile offline_access",
          callbackURL: `https://${domain}/api/callback`,
        },
        verify,
      );
      passport.use(strategy);
    }

    passport.serializeUser((user: Express.User, cb) => cb(null, user));
    passport.deserializeUser((user: Express.User, cb) => cb(null, user));

    app.get("/api/login", (req, res, next) => {
      const { selectedRole } = req.query as { selectedRole?: string };
      if (
        typeof selectedRole === 'string' &&
        (selectedRole === 'tenant' || selectedRole === 'landlord') &&
        req.session
      ) {
        req.session.selectedRole = selectedRole;
      }

      passport.authenticate(`replitauth:${req.hostname}`, {
        prompt: "login consent",
        scope: ["openid", "email", "profile", "offline_access"],
      })(req, res, next);
    });

    app.get("/api/callback", (req, res, next) => {
      passport.authenticate(`replitauth:${req.hostname}`, {
        successReturnToOrRedirect: "/",
        failureRedirect: "/auth?mode=login",
      })(req, res, next);
    });
  } else {
    app.get("/api/login", (_req, res) => {
      res.status(503).json({
        message: "Replit Auth is not configured. Enable it or use the development login.",
      });
    });

    app.get("/api/callback", (_req, res) => {
      res.status(503).json({
        message: "Replit Auth callback is unavailable without configuration.",
      });
    });
  }

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      if (config) {
        res.redirect(
          client.buildEndSessionUrl(config, {
            client_id: process.env.REPL_ID!,
            post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
          }).href,
        );
      } else {
        res.redirect("/");
      }
    });
  });

  if (enableTestLogin) {
    console.log("⚠️  Development mode: Test login endpoint enabled at /api/dev/test-login");
    const crypto = await import("crypto");

    app.post("/api/dev/test-login", async (req, res) => {
      try {
        const { email, password } = req.body;

        if (!email || !password) {
          return res.status(400).json({ message: "Email and password required" });
        }

        // Only allow test accounts
        if (!email.includes("@myrentcard.com") || !email.includes("test-")) {
          return res.status(403).json({ message: "Only test accounts allowed" });
        }

        const user = await storage.getUserByEmail(email);
        if (!user) {
          return res.status(401).json({ message: "Invalid credentials" });
        }

        // Verify password using same method as seed script
        const hashPassword = (pwd: string): Promise<string> => {
          return new Promise((resolve, reject) => {
            crypto.scrypt(pwd, "salt", 64, (err: Error, derivedKey: Buffer) => {
              if (err) reject(err);
              resolve(derivedKey.toString("hex"));
            });
          });
        };

        const hashedInput = await hashPassword(password);
        if (user.password !== hashedInput) {
          return res.status(401).json({ message: "Invalid credentials" });
        }

        // Create session mimicking OAuth structure
        const testUser: Express.User = {
          isTestUser: true, // Mark as test user for middleware
          claims: {
            sub: user.id,
            email: user.email || "",
            dbUserId: user.id, // Critical: Set the database user ID
            userType: user.userType,
          },
          id: user.id,
          expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
        };

        // Save session
        req.login(testUser, (err) => {
          if (err) {
            console.error("Session creation error:", err);
            return res.status(500).json({ message: "Session creation failed" });
          }

          res.json({
            success: true,
            user: {
              id: user.id,
              email: user.email,
              userType: user.userType,
              fullName: user.fullName,
            },
          });
        });
      } catch (error) {
        console.error("Test login error:", error);
        res.status(500).json({ message: "Login failed" });
      }
    });
  } else {
    console.log("ℹ️  Development login endpoint disabled. Set ENABLE_DEV_LOGIN=true to enable.");
  }
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  // Check if authenticated (both OAuth and test sessions)
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // For test sessions without expires_at, allow access
  if (!user.expires_at) {
    if (user.isTestUser) {
      return next(); // Test users bypass expiry check
    }
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  if (!hasReplitConfig) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};
