import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

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

export default router;
