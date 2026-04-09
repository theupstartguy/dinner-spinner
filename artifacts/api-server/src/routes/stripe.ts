import { Router } from "express";
import Stripe from "stripe";

const router = Router();
const secretKey = process.env["STRIPE_SECRET_KEY"];
const publishableKey = process.env["STRIPE_PUBLISHABLE_KEY"];

if (!secretKey) {
  throw new Error("STRIPE_SECRET_KEY is required");
}

const stripe = new Stripe(secretKey, {
  apiVersion: "2025-08-27.basil",
});

router.post("/create-checkout-session", async (_req, res) => {
  try {
    const appUrl = process.env["APP_URL"] ?? "http://localhost:80";
    console.info("[stripe-checkout] request received", {
      hasPublishableKey: Boolean(publishableKey),
      hasSecretKey: Boolean(secretKey),
      appUrl,
    });
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: "Dinner Spinner Premium" },
            unit_amount: 499,
          },
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/ingredients?payment=success`,
      cancel_url: `${appUrl}/ingredients?payment=cancel`,
    });
    console.info("[stripe-checkout] session created", {
      id: session.id,
      url: Boolean(session.url),
    });
    res.json({ url: session.url });
  } catch {
    console.error("[stripe-checkout] failed to create session");
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

export default router;
