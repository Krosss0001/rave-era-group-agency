import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  res.json({ ok: true, service: "raveera-api" });
});

router.get("/health", (_req, res) => {
  res.json({ ok: true, service: "raveera-api" });
});

export default router;
