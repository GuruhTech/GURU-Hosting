import { Router } from "express";
import { db, paymentsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

const router = Router();

const UPLOADS_DIR = join(process.cwd(), "uploads");

async function ensureUploadsDir() {
  try {
    await mkdir(UPLOADS_DIR, { recursive: true });
  } catch {}
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
    user: p.user ? {
      id: p.user.id,
      email: p.user.email,
      name: p.user.name,
      country: p.user.country,
      currency: p.user.currency,
      gruCredits: p.user.gruCredits,
      freeDeploymentUsed: p.user.freeDeploymentUsed,
      herokuApiType: p.user.herokuApiType,
      isAdmin: p.user.isAdmin,
      createdAt: p.user.createdAt.toISOString(),
    } : undefined,
  };
}

router.post("/submit", requireAuth, async (req, res) => {
  try {
    await ensureUploadsDir();
    const userId = (req as any).userId;
    const { screenshotBase64, screenshotMimeType, amount, phoneNumber, notes } = req.body;

    if (!screenshotBase64 || !amount) {
      res.status(400).json({ error: "Screenshot and amount are required" });
      return;
    }

    const base64Data = screenshotBase64.replace(/^data:[^;]+;base64,/, "");
    const ext = screenshotMimeType?.includes("png") ? "png" : "jpg";
    const filename = `payment_${userId}_${Date.now()}.${ext}`;
    const filepath = join(UPLOADS_DIR, filename);

    await writeFile(filepath, Buffer.from(base64Data, "base64"));

    const screenshotUrl = `/api/uploads/${filename}`;

    const [payment] = await db.insert(paymentsTable).values({
      userId,
      amount: Number(amount),
      status: "pending",
      screenshotUrl,
      phoneNumber: phoneNumber || null,
      notes: notes || null,
    }).returning();

    res.json(formatPayment(payment));
  } catch (e: any) {
    req.log.error({ err: e }, "Submit payment error");
    res.status(500).json({ error: "Failed to submit payment" });
  }
});

router.get("/history", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const payments = await db.query.paymentsTable.findMany({
      where: eq(paymentsTable.userId, userId),
      orderBy: (p, { desc }) => [desc(p.createdAt)],
    });
    res.json(payments.map((p: any) => formatPayment(p)));
  } catch (e: any) {
    req.log.error({ err: e }, "Get payment history error");
    res.status(500).json({ error: "Failed to get payment history" });
  }
});

export default router;
