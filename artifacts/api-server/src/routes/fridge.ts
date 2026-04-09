import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import Stripe from "stripe";

const router: IRouter = Router();
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

router.post("/analyze-fridge", async (req, res) => {
  const { imageBase64, mimeType } = req.body;

  if (!imageBase64 || !mimeType) {
    res.status(400).json({ error: "imageBase64 and mimeType are required" });
    return;
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${imageBase64}`,
                detail: "low",
              },
            },
            {
              type: "text",
              text: `Look at this image of a fridge or pantry. List all the food ingredients and items you can see. Return ONLY a JSON array of ingredient names as strings, nothing else. Keep names short and simple (e.g. "Chicken", "Milk", "Eggs", "Tomato"). Return at most 20 items. Example: ["Chicken", "Milk", "Eggs", "Carrot", "Butter"]`,
            },
          ],
        },
      ],
    });

    const content = response.choices[0]?.message?.content?.trim() || "[]";

    let ingredients: string[] = [];
    try {
      const match = content.match(/\[[\s\S]*\]/);
      if (match) {
        ingredients = JSON.parse(match[0]);
      }
    } catch {
      ingredients = [];
    }

    ingredients = ingredients
      .filter((i) => typeof i === "string" && i.trim().length > 0)
      .map((i) => i.trim())
      .slice(0, 20);

    res.json({ ingredients });
  } catch (err) {
    req.log.error({ err }, "Failed to analyze fridge image");
    res.status(500).json({ error: "Failed to analyze image" });
  }
});

router.post("/create-checkout-session", async (req, res) => {
  if (!stripe) {
    res.status(500).json({ error: "Stripe is not configured" });
    return;
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Dinner Spinner Test Meal Plan",
            },
            unit_amount: 199,
          },
          quantity: 1,
        },
      ],
      success_url: `${req.protocol}://${req.get("host")}/?paid=1`,
      cancel_url: `${req.protocol}://${req.get("host")}/ingredients?canceled=1`,
    });

    res.json({ url: session.url });
  } catch (err) {
    req.log.error({ err }, "Failed to create checkout session");
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

export default router;
