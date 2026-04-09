import { Router } from "express";

const router = Router();

router.post("/create-checkout-session", (_req, res) => {
  const appUrl = process.env["APP_URL"] ?? "http://localhost:80";
  const checkoutUrl =
    process.env["STRIPE_CHECKOUT_URL"] ??
    `${appUrl}/ingredients?payment=success`;
  console.info("[stripe-checkout] redirecting", {
    hasCheckoutUrl: Boolean(process.env["STRIPE_CHECKOUT_URL"]),
    checkoutUrl,
  });
  res.json({ url: checkoutUrl });
});

export default router;
