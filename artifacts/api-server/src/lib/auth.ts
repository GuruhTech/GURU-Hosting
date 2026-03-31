import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db, sessionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import type { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.SESSION_SECRET || "guru-host-secret-2024";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function createToken(userId: number, isAdmin: boolean = false): string {
  return jwt.sign({ userId, isAdmin }, JWT_SECRET, { expiresIn: "30d" });
}

export function verifyToken(token: string): { userId: number; isAdmin: boolean } | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number; isAdmin: boolean };
    return payload;
  } catch {
    return null;
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const token = authHeader.substring(7);
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }
  (req as any).userId = payload.userId;
  (req as any).isAdmin = payload.isAdmin;
  next();
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  await requireAuth(req, res, () => {
    if (!(req as any).isAdmin) {
      res.status(403).json({ error: "Admin access required" });
      return;
    }
    next();
  });
}
