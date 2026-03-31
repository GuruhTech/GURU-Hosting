import { Router } from "express";
import { db, botsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../lib/auth";

const router = Router();

function formatBot(bot: any) {
  return {
    id: bot.id,
    name: bot.name,
    description: bot.description,
    repoUrl: bot.repoUrl,
    imageUrl: bot.imageUrl || null,
    features: bot.features || [],
    isActive: bot.isActive,
    createdAt: bot.createdAt.toISOString(),
  };
}

router.get("/", requireAuth, async (req, res) => {
  try {
    const bots = await db.query.botsTable.findMany({
      where: eq(botsTable.isActive, true),
      orderBy: (bots, { asc }) => [asc(bots.createdAt)],
    });
    res.json(bots.map(formatBot));
  } catch (e: any) {
    req.log.error({ err: e }, "Get bots error");
    res.status(500).json({ error: "Failed to get bots" });
  }
});

export default router;
