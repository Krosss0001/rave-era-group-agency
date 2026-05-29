import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import paymentRouter from "./payment.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(paymentRouter);

export default router;
