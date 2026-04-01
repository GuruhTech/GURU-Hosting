import { Router } from "express";
import { db, usersTable, paymentsTable, deploymentsTable, botsTable } from "@workspace/db";
import { eq, count, and } from "drizzle-orm";
import { verifyPassword, hashPassword, createToken, requireAdmin } from "../lib/auth";
import { validateHerokuKey, detectApiType } from "../lib/heroku";

const router = Router();

const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || "akidarajab462@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "@Akidah";

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

function formatPayment(p: any) {
  return {
    id: p.id,
    userId: p.userId,
    amount: p.amount,
    status: p.status,
    screenshotUrl: p.screenshotUrl,
    phoneNumber: p.phoneNumber || null,
    notes: p.notes || null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    user: p.user ? formatUser(p.user) : undefined,
  };
}

function formatDeployment(dep: any, bot?: any) {
  return {
    id: dep.id,
    userId: dep.userId,
    botId: dep.botId,
    appName: dep.appName,
    repoUrl: dep.repoUrl,
    sessionId: dep.sessionId,
    status: dep.status,
    herokuAppId: dep.herokuAppId || null,
    createdAt: dep.createdAt.toISOString(),
    updatedAt: dep.updatedAt.toISOString(),
    bot: bot ? {
      id: bot.id,
      name: bot.name,
      description: bot.description,
      repoUrl: bot.repoUrl,
      imageUrl: bot.imageUrl || null,
      features: bot.features || [],
      isActive: bot.isActive,
      createdAt: bot.createdAt.toISOString(),
    } : undefined,
  };
}

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

router.post("/login", async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const identifier = email || username;
    if (identifier !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      res.status(401).json({ error: "Invalid admin credentials" });
      return;
    }
    const token = createToken(-1, true);
    res.json({
      user: {
        id: 0,
        email: "admin@guruhost.com",
        name: "Admin",
        country: "KE",
        currency: "KES",
        gruCredits: 0,
        freeDeploymentUsed: false,
        herokuApiType: "personal",
        isAdmin: true,
        createdAt: new Date().toISOString(),
      },
      token,
    });
  } catch (e: any) {
    req.log.error({ err: e }, "Admin login error");
    res.status(500).json({ error: "Admin login failed" });
  }
});

router.get("/users", requireAdmin, async (req, res) => {
  try {
    const users = await db.query.usersTable.findMany({
      orderBy: (u, { desc }) => [desc(u.createdAt)],
    });
    res.json(users.map(formatUser));
  } catch (e: any) {
    req.log.error({ err: e }, "Admin get users error");
    res.status(500).json({ error: "Failed to get users" });
  }
});

router.post("/users/:id/fund", requireAdmin, async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      res.status(400).json({ error: "Valid amount required" });
      return;
    }
    const user = await db.query.usersTable.findFirst({ where: eq(usersTable.id, userId) });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    const newCredits = user.gruCredits + Number(amount);
    const [updated] = await db.update(usersTable)
      .set({ gruCredits: newCredits })
      .where(eq(usersTable.id, userId))
      .returning();
    res.json(formatUser(updated));
  } catch (e: any) {
    req.log.error({ err: e }, "Admin fund user error");
    res.status(500).json({ error: "Failed to fund user" });
  }
});

router.get("/payments", requireAdmin, async (req, res) => {
  try {
    const payments = await db.query.paymentsTable.findMany({
      with: { user: true },
      orderBy: (p, { desc }) => [desc(p.createdAt)],
    });
    res.json(payments.map((p: any) => formatPayment(p)));
  } catch (e: any) {
    req.log.error({ err: e }, "Admin get payments error");
    res.status(500).json({ error: "Failed to get payments" });
  }
});

router.post("/payments/:id/approve", requireAdmin, async (req, res) => {
  try {
    const paymentId = Number(req.params.id);
    const payment = await db.query.paymentsTable.findFirst({ where: eq(paymentsTable.id, paymentId) });
    if (!payment) {
      res.status(404).json({ error: "Payment not found" });
      return;
    }
    const [updated] = await db.update(paymentsTable)
      .set({ status: "approved", updatedAt: new Date() })
      .where(eq(paymentsTable.id, paymentId))
      .returning();
    const user = await db.query.usersTable.findFirst({ where: eq(usersTable.id, payment.userId) });
    if (user) {
      const gruAmount = payment.amount;
      await db.update(usersTable)
        .set({ gruCredits: user.gruCredits + gruAmount })
        .where(eq(usersTable.id, payment.userId));
    }
    res.json(formatPayment({ ...updated, user: user || undefined }));
  } catch (e: any) {
    req.log.error({ err: e }, "Admin approve payment error");
    res.status(500).json({ error: "Failed to approve payment" });
  }
});

router.post("/payments/:id/reject", requireAdmin, async (req, res) => {
  try {
    const paymentId = Number(req.params.id);
    const [updated] = await db.update(paymentsTable)
      .set({ status: "rejected", updatedAt: new Date() })
      .where(eq(paymentsTable.id, paymentId))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Payment not found" });
      return;
    }
    const user = await db.query.usersTable.findFirst({ where: eq(usersTable.id, updated.userId) });
    res.json(formatPayment({ ...updated, user: user || undefined }));
  } catch (e: any) {
    req.log.error({ err: e }, "Admin reject payment error");
    res.status(500).json({ error: "Failed to reject payment" });
  }
});

router.get("/deployments", requireAdmin, async (req, res) => {
  try {
    const deps = await db.query.deploymentsTable.findMany({
      with: { bot: true },
      orderBy: (d, { desc }) => [desc(d.createdAt)],
    });
    res.json(deps.map((d: any) => formatDeployment(d, d.bot)));
  } catch (e: any) {
    req.log.error({ err: e }, "Admin get deployments error");
    res.status(500).json({ error: "Failed to get deployments" });
  }
});

router.post("/bots", requireAdmin, async (req, res) => {
  try {
    const { name, description, repoUrl, imageUrl, features } = req.body;
    if (!name || !description || !repoUrl) {
      res.status(400).json({ error: "name, description, repoUrl are required" });
      return;
    }
    const [bot] = await db.insert(botsTable).values({
      name,
      description,
      repoUrl,
      imageUrl: imageUrl || null,
      features: features || [],
      isActive: true,
    }).returning();
    res.json(formatBot(bot));
  } catch (e: any) {
    req.log.error({ err: e }, "Admin create bot error");
    res.status(500).json({ error: "Failed to create bot" });
  }
});

router.delete("/bots/:id", requireAdmin, async (req, res) => {
  try {
    const botId = Number(req.params.id);
    await db.update(botsTable).set({ isActive: false }).where(eq(botsTable.id, botId));
    res.json({ success: true, message: "Bot removed from catalog" });
  } catch (e: any) {
    req.log.error({ err: e }, "Admin delete bot error");
    res.status(500).json({ error: "Failed to delete bot" });
  }
});

router.get("/stats", requireAdmin, async (req, res) => {
  try {
    const [usersCount] = await db.select({ count: count() }).from(usersTable);
    const [deploymentsCount] = await db.select({ count: count() }).from(deploymentsTable);
    const [activeCount] = await db.select({ count: count() }).from(deploymentsTable).where(eq(deploymentsTable.status, "running"));
    const [pendingCount] = await db.select({ count: count() }).from(paymentsTable).where(eq(paymentsTable.status, "pending"));
    const [botsCount] = await db.select({ count: count() }).from(botsTable).where(eq(botsTable.isActive, true));

    const approvedPayments = await db.query.paymentsTable.findMany({ where: eq(paymentsTable.status, "approved") });
    const totalRevenue = approvedPayments.reduce((sum, p) => sum + p.amount, 0);

    res.json({
      totalUsers: Number(usersCount.count),
      totalDeployments: Number(deploymentsCount.count),
      activeDeployments: Number(activeCount.count),
      pendingPayments: Number(pendingCount.count),
      totalRevenue,
      botsInCatalog: Number(botsCount.count),
    });
  } catch (e: any) {
    req.log.error({ err: e }, "Admin stats error");
    res.status(500).json({ error: "Failed to get stats" });
  }
});

router.post("/users/:id/heroku-key", requireAdmin, async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { herokuApiKey, herokuTeam } = req.body;

    if (!herokuApiKey) {
      res.status(400).json({ error: "herokuApiKey is required" });
      return;
    }

    const validation = await validateHerokuKey(herokuApiKey);
    if (!validation.valid) {
      res.status(400).json({ error: "Invalid Heroku API key — could not authenticate with Heroku" });
      return;
    }

    const user = await db.query.usersTable.findFirst({ where: eq(usersTable.id, userId) });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const [updated] = await db
      .update(usersTable)
      .set({
        herokuApiKey,
        herokuTeam: herokuTeam || null,
        herokuApiType: validation.type,
      })
      .where(eq(usersTable.id, userId))
      .returning();

    res.json({
      user: formatUser(updated),
      validation: {
        type: validation.type,
        teams: validation.teams,
      },
    });
  } catch (e: any) {
    req.log.error({ err: e }, "Admin set heroku key error");
    res.status(500).json({ error: "Failed to update Heroku key" });
  }
});

router.post("/heroku-key/validate", requireAdmin, async (req, res) => {
  try {
    const { herokuApiKey } = req.body;
    if (!herokuApiKey) {
      res.status(400).json({ error: "herokuApiKey is required" });
      return;
    }
    const result = await validateHerokuKey(herokuApiKey);
    res.json(result);
  } catch (e: any) {
    req.log.error({ err: e }, "Validate heroku key error");
    res.status(500).json({ error: "Failed to validate key" });
  }
});

export default router;
