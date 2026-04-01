import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  hashPassword,
  verifyPassword,
  createToken,
  requireAuth,
} from "../lib/auth";
import { detectApiType } from "../lib/heroku";

const router = Router();

function formatUser(user: any) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    country: user.country,
    currency: user.currency,
    gruCredits: user.gruCredits,
    freeDeploymentUsed: user.freeDeploymentUsed,
    herokuApiType: user.herokuApiType,
    isAdmin: user.isAdmin,
    createdAt: user.createdAt.toISOString(),
  };
}

router.post("/register", async (req, res) => {
  try {
    const { email, password, name, country, currency } = req.body;
    if (!email || !password || !name || !country) {
      res.status(400).json({ error: "Name, email, password and country are required" });
      return;
    }

    const existing = await db.query.usersTable.findFirst({ where: eq(usersTable.email, email) });
    if (existing) {
      res.status(400).json({ error: "Email already registered" });
      return;
    }

    const hashed = await hashPassword(password);

    const [user] = await db.insert(usersTable).values({
      email,
      password: hashed,
      name,
      country,
      currency: currency || "USD",
      herokuApiKey: null,
      herokuTeam: null,
      herokuApiType: null,
      gruCredits: 0,
      freeDeploymentUsed: false,
      isAdmin: false,
    }).returning();

    const token = createToken(user.id, false);
    res.json({ user: formatUser(user), token });
  } catch (e: any) {
    req.log.error({ err: e }, "Register error");
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email and password required" });
      return;
    }
    const user = await db.query.usersTable.findFirst({ where: eq(usersTable.email, email) });
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const token = createToken(user.id, user.isAdmin);
    res.json({ user: formatUser(user), token });
  } catch (e: any) {
    req.log.error({ err: e }, "Login error");
    res.status(500).json({ error: "Login failed" });
  }
});

router.post("/logout", (req, res) => {
  res.json({ success: true, message: "Logged out" });
});

router.get("/me", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const user = await db.query.usersTable.findFirst({ where: eq(usersTable.id, userId) });
    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }
    res.json(formatUser(user));
  } catch (e: any) {
    req.log.error({ err: e }, "Get me error");
    res.status(500).json({ error: "Failed to get user" });
  }
});

export default router;
