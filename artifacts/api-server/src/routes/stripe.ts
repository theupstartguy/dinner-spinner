import { Router } from "express";

const router = Router();

router.post("/create-checkout-session", (_req, res) => {
  const baseUrl = process.env["APP_URL"] ?? "http://localhost:80";
  res.json({ url: `${baseUrl}/ingredients?payment=success` });
});

export default router;
