import { Router } from "express";
import { db, deploymentsTable, usersTable, botsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import {
  createHerokuApp,
  setHerokuEnvVars,
  getHerokuEnvVars,
  getHerokuLogs,
  restartHerokuApp,
  scaleHerokuDynos,
  deleteHerokuApp,
  getHerokuAppStatus,
  buildFromGitHub,
} from "../lib/heroku";
import { randomUUID } from "crypto";

const router = Router();

const DEPLOYMENT_COST_GRU = 50;

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

router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const deps = await db.query.deploymentsTable.findMany({
      where: eq(deploymentsTable.userId, userId),
      with: { bot: true },
      orderBy: (d, { desc }) => [desc(d.createdAt)],
    });
    res.json(deps.map((d: any) => formatDeployment(d, d.bot)));
  } catch (e: any) {
    req.log.error({ err: e }, "Get deployments error");
    res.status(500).json({ error: "Failed to get deployments" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { botId, repoUrl, sessionId, envVars = [] } = req.body;

    if (!botId || !repoUrl || !sessionId) {
      res.status(400).json({ error: "botId, repoUrl, and sessionId are required" });
      return;
    }

    const user = await db.query.usersTable.findFirst({ where: eq(usersTable.id, userId) });
    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    if (!user.freeDeploymentUsed) {
      await db.update(usersTable).set({ freeDeploymentUsed: true }).where(eq(usersTable.id, userId));
    } else {
      if (user.gruCredits < DEPLOYMENT_COST_GRU) {
        res.status(402).json({ error: `Insufficient GRU credits. You need ${DEPLOYMENT_COST_GRU} GRU to deploy. Current balance: ${user.gruCredits} GRU` });
        return;
      }
      await db.update(usersTable)
        .set({ gruCredits: user.gruCredits - DEPLOYMENT_COST_GRU })
        .where(eq(usersTable.id, userId));
    }

    const bot = await db.query.botsTable.findFirst({ where: eq(botsTable.id, botId) });
    if (!bot) {
      res.status(404).json({ error: "Bot not found" });
      return;
    }

    const depId = randomUUID();
    const appName = `guru-bot-${depId.substring(0, 8)}`;

    const [deployment] = await db.insert(deploymentsTable).values({
      id: depId,
      userId,
      botId,
      appName,
      repoUrl,
      sessionId,
      status: "building",
      herokuAppId: null,
    }).returning();

    setImmediate(async () => {
      try {
        const herokuApp = await createHerokuApp(user.herokuApiKey, appName, user.herokuTeam || undefined);
        if (!herokuApp) {
          await db.update(deploymentsTable).set({ status: "crashed", updatedAt: new Date() }).where(eq(deploymentsTable.id, depId));
          return;
        }

        const vars: Record<string, string> = {
          SESSION_ID: sessionId,
          BOT_REPO: repoUrl,
          GURU_HOST: "true",
        };
        for (const v of envVars) {
          if (v.key && v.value) vars[v.key] = v.value;
        }

        await setHerokuEnvVars(user.herokuApiKey, appName, vars);
        await buildFromGitHub(user.herokuApiKey, appName, repoUrl);

        await db.update(deploymentsTable)
          .set({ herokuAppId: herokuApp.id, status: "running", updatedAt: new Date() })
          .where(eq(deploymentsTable.id, depId));
      } catch (e) {
        await db.update(deploymentsTable).set({ status: "crashed", updatedAt: new Date() }).where(eq(deploymentsTable.id, depId));
      }
    });

    res.json(formatDeployment(deployment, bot));
  } catch (e: any) {
    req.log.error({ err: e }, "Create deployment error");
    res.status(500).json({ error: "Failed to create deployment" });
  }
});

router.get("/:id", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const dep = await db.query.deploymentsTable.findFirst({
      where: and(eq(deploymentsTable.id, req.params.id), eq(deploymentsTable.userId, userId)),
      with: { bot: true },
    });
    if (!dep) {
      res.status(404).json({ error: "Deployment not found" });
      return;
    }
    res.json(formatDeployment(dep, (dep as any).bot));
  } catch (e: any) {
    req.log.error({ err: e }, "Get deployment error");
    res.status(500).json({ error: "Failed to get deployment" });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const dep = await db.query.deploymentsTable.findFirst({
      where: and(eq(deploymentsTable.id, req.params.id), eq(deploymentsTable.userId, userId)),
    });
    if (!dep) {
      res.status(404).json({ error: "Deployment not found" });
      return;
    }
    const user = await db.query.usersTable.findFirst({ where: eq(usersTable.id, userId) });
    if (user && dep.appName) {
      await deleteHerokuApp(user.herokuApiKey, dep.appName);
    }
    await db.update(deploymentsTable).set({ status: "deleted", updatedAt: new Date() }).where(eq(deploymentsTable.id, req.params.id));
    res.json({ success: true, message: "Deployment deleted" });
  } catch (e: any) {
    req.log.error({ err: e }, "Delete deployment error");
    res.status(500).json({ error: "Failed to delete deployment" });
  }
});

router.post("/:id/restart", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const dep = await db.query.deploymentsTable.findFirst({
      where: and(eq(deploymentsTable.id, req.params.id), eq(deploymentsTable.userId, userId)),
      with: { bot: true },
    });
    if (!dep) {
      res.status(404).json({ error: "Deployment not found" });
      return;
    }
    const user = await db.query.usersTable.findFirst({ where: eq(usersTable.id, userId) });
    if (user && dep.appName) {
      await restartHerokuApp(user.herokuApiKey, dep.appName);
    }
    await db.update(deploymentsTable).set({ status: "running", updatedAt: new Date() }).where(eq(deploymentsTable.id, req.params.id));
    const updated = await db.query.deploymentsTable.findFirst({ where: eq(deploymentsTable.id, req.params.id), with: { bot: true } });
    res.json(formatDeployment(updated!, (updated as any)?.bot));
  } catch (e: any) {
    req.log.error({ err: e }, "Restart deployment error");
    res.status(500).json({ error: "Failed to restart deployment" });
  }
});

router.post("/:id/pause", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const dep = await db.query.deploymentsTable.findFirst({
      where: and(eq(deploymentsTable.id, req.params.id), eq(deploymentsTable.userId, userId)),
      with: { bot: true },
    });
    if (!dep) {
      res.status(404).json({ error: "Deployment not found" });
      return;
    }
    const user = await db.query.usersTable.findFirst({ where: eq(usersTable.id, userId) });
    if (user && dep.appName) {
      await scaleHerokuDynos(user.herokuApiKey, dep.appName, 0);
    }
    await db.update(deploymentsTable).set({ status: "paused", updatedAt: new Date() }).where(eq(deploymentsTable.id, req.params.id));
    const updated = await db.query.deploymentsTable.findFirst({ where: eq(deploymentsTable.id, req.params.id), with: { bot: true } });
    res.json(formatDeployment(updated!, (updated as any)?.bot));
  } catch (e: any) {
    req.log.error({ err: e }, "Pause deployment error");
    res.status(500).json({ error: "Failed to pause deployment" });
  }
});

router.post("/:id/resume", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const dep = await db.query.deploymentsTable.findFirst({
      where: and(eq(deploymentsTable.id, req.params.id), eq(deploymentsTable.userId, userId)),
      with: { bot: true },
    });
    if (!dep) {
      res.status(404).json({ error: "Deployment not found" });
      return;
    }
    const user = await db.query.usersTable.findFirst({ where: eq(usersTable.id, userId) });
    if (user && dep.appName) {
      await scaleHerokuDynos(user.herokuApiKey, dep.appName, 1);
    }
    await db.update(deploymentsTable).set({ status: "running", updatedAt: new Date() }).where(eq(deploymentsTable.id, req.params.id));
    const updated = await db.query.deploymentsTable.findFirst({ where: eq(deploymentsTable.id, req.params.id), with: { bot: true } });
    res.json(formatDeployment(updated!, (updated as any)?.bot));
  } catch (e: any) {
    req.log.error({ err: e }, "Resume deployment error");
    res.status(500).json({ error: "Failed to resume deployment" });
  }
});

router.get("/:id/logs", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const dep = await db.query.deploymentsTable.findFirst({
      where: and(eq(deploymentsTable.id, req.params.id), eq(deploymentsTable.userId, userId)),
    });
    if (!dep) {
      res.status(404).json({ error: "Deployment not found" });
      return;
    }
    const user = await db.query.usersTable.findFirst({ where: eq(usersTable.id, userId) });
    const lines = req.query.lines ? Number(req.query.lines) : 200;
    let logsText = "No logs available yet.";
    if (user && dep.appName) {
      logsText = await getHerokuLogs(user.herokuApiKey, dep.appName, lines);
    }
    const logLines = logsText.split("\n").filter(Boolean);
    res.json({ logs: logsText, lines: logLines });
  } catch (e: any) {
    req.log.error({ err: e }, "Get logs error");
    res.status(500).json({ error: "Failed to get logs" });
  }
});

router.get("/:id/env", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const dep = await db.query.deploymentsTable.findFirst({
      where: and(eq(deploymentsTable.id, req.params.id), eq(deploymentsTable.userId, userId)),
    });
    if (!dep) {
      res.status(404).json({ error: "Deployment not found" });
      return;
    }
    const user = await db.query.usersTable.findFirst({ where: eq(usersTable.id, userId) });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    const envVars = await getHerokuEnvVars(user.herokuApiKey, dep.appName);
    const result = Object.entries(envVars).map(([key, value]) => ({ key, value }));
    res.json(result);
  } catch (e: any) {
    req.log.error({ err: e }, "Get env error");
    res.status(500).json({ error: "Failed to get env vars" });
  }
});

router.post("/:id/env", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const dep = await db.query.deploymentsTable.findFirst({
      where: and(eq(deploymentsTable.id, req.params.id), eq(deploymentsTable.userId, userId)),
    });
    if (!dep) {
      res.status(404).json({ error: "Deployment not found" });
      return;
    }
    const user = await db.query.usersTable.findFirst({ where: eq(usersTable.id, userId) });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    const { vars } = req.body;
    const record: Record<string, string> = {};
    for (const v of vars) {
      if (v.key && v.value) record[v.key] = v.value;
    }
    await setHerokuEnvVars(user.herokuApiKey, dep.appName, record);
    res.json({ success: true, message: "Env vars updated" });
  } catch (e: any) {
    req.log.error({ err: e }, "Set env error");
    res.status(500).json({ error: "Failed to set env vars" });
  }
});

export default router;
