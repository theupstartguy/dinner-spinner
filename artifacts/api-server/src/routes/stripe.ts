import { Router } from "express";

const router = Router();

router.post("/create-checkout-session", (_req, res) => {
  const appUrl = process.env["APP_URL"] ?? "http://localhost:80";
  res.json({ url: `${appUrl}/ingredients?payment=success` });
});

export default router;
