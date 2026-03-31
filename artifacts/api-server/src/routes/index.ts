import { Router, type IRouter } from "express";
import { createReadStream } from "fs";
import { join } from "path";
import healthRouter from "./health";
import authRouter from "./auth";
import botsRouter from "./bots";
import deploymentsRouter from "./deployments";
import paymentsRouter from "./payments";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/bots", botsRouter);
router.use("/deployments", deploymentsRouter);
router.use("/payments", paymentsRouter);
router.use("/admin", adminRouter);

router.get("/uploads/:filename", (req, res) => {
  const filename = req.params.filename;
  if (!filename || filename.includes("..")) {
    res.status(400).json({ error: "Invalid filename" });
    return;
  }
  const filepath = join(process.cwd(), "uploads", filename);
  const ext = filename.split(".").pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
  };
  res.setHeader("Content-Type", mimeTypes[ext || "jpg"] || "image/jpeg");
  const stream = createReadStream(filepath);
  stream.on("error", () => res.status(404).json({ error: "File not found" }));
  stream.pipe(res);
});

export default router;
