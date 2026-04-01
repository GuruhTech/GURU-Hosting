import { Router, type IRouter } from "express";
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

export default router;
