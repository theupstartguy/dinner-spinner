import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import SpinnerWheel from "@/components/SpinnerWheel";
import { useIngredients } from "@/context/IngredientsContext";
import { getMealSuggestions, MealSummary } from "@/services/mealdb";
import { Clock3, Heart, Leaf, Plus } from "lucide-react";

export default function SpinPage() {
  const { ingredients } = useIngredients();
  const [, navigate] = useLocation();
  const [meals, setMeals] = useState<MealSummary[]>([]);
  const [suggestedIngredients, setSuggestedIngredients] = useState<string[]>([]);
  const [vegetarianOnly, setVegetarianOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MealSummary | null>(null);
  const [mealsLoaded, setMealsLoaded] = useState(false);

  const loadMeals = async (force = false) => {
    if (mealsLoaded && !force) return meals;
    setLoading(true);
    try {
      const fetched = await getMealSuggestions(ingredients);
      setMeals(fetched.meals);
      setSuggestedIngredients(fetched.suggestedIngredients);
      setVegetarianOnly(fetched.isVegetarianOnly);
      setMealsLoaded(true);
      return fetched.meals;
    } finally {
      setLoading(false);
    }
  };

  const handleBeforeSpin = async () => {
    await loadMeals();
  };

  const handleResult = (mealName: string) => {
    const found = meals.find((m) => m.strMeal === mealName);
    if (found) setResult(found);
  };

  const wheelItems = meals.map((m) => m.strMeal);

  return (
    <div className="min-h-screen pb-24" style={{ background: "#FAF8F5" }}>
      <div className="mx-auto max-w-[480px] px-5 pt-12 pb-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em]" style={{ color: "#9E9790" }}>
          Fresh picks
        </p>
        <h1 className="mt-2 text-[28px] font-bold leading-[1.3] tracking-[-0.015em]" style={{ color: "#332F2B" }}>
          Let’s see what we can make
        </h1>
        <p className="text-sm mt-2" style={{ color: "#9E9790" }}>
          {ingredients.length > 0
            ? `${ingredients.length} ingredient${ingredients.length !== 1 ? "s" : ""} from your fridge`
            : "Add a few ingredients for smarter suggestions."}
        </p>
        {suggestedIngredients.length > 0 && (
          <div className="mt-4 rounded-2xl bg-white shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <Plus size={16} color="hsl(145 30% 42%)" />
              <p className="text-[13px] font-semibold tracking-[-0.01em]" style={{ color: "#332F2B" }}>
                Add one of these for more options
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestedIngredients.map((ingredient) => (
                <span
                  key={ingredient}
                  className="h-8 px-3 rounded-full text-[13px] font-medium flex items-center"
                  style={{ background: "#EEF6F1", color: "hsl(145 30% 42%)" }}
                >
                  {ingredient}
                </span>
              ))}
            </div>
          </div>
        )}
        {vegetarianOnly && (
          <p className="mt-3 text-[13px]" style={{ color: "#9E9790" }}>
            Meat-free ingredients detected — only vegetarian meal options are shown.
          </p>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center pt-20 gap-4">
          <div className="w-14 h-14 rounded-full border-4 animate-spin" style={{ borderColor: "#EEF6F1", borderTopColor: "hsl(145 30% 42%)" }} />
          <p className="text-sm font-medium" style={{ color: "#9E9790" }}>Finding fresh ideas…</p>
        </div>
      ) : (
        <div className="mx-auto flex max-w-[480px] flex-col items-center px-5">
          {mealsLoaded || meals.length > 0 ? (
            <>
              <SpinnerWheel items={wheelItems} onResult={handleResult} />
              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 30 }}
                    className="mt-8 w-full rounded-2xl overflow-hidden bg-white shadow-sm"
                  >
                    <img
                      src={result.strMealThumb}
                      alt={result.strMeal}
                      className="w-full h-44 object-cover"
                    />
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <h2 className="text-[18px] font-semibold leading-[1.4] tracking-[-0.01em]" style={{ color: "#332F2B" }}>{result.strMeal}</h2>
                        <Heart size={18} style={{ color: "#9E9790" }} />
                      </div>
                      <div className="mt-3 flex items-center gap-4 text-sm" style={{ color: "#9E9790" }}>
                        <span className="inline-flex items-center gap-1"><Clock3 size={14} /> Quick pick</span>
                        <span className="inline-flex items-center gap-1"><Leaf size={14} /> Fresh match</span>
                      </div>
                      <button
                        onClick={() => navigate(`/recipe/${result.idMeal}`)}
                        className="mt-4 h-12 w-full rounded-xl text-white font-semibold text-sm transition-transform duration-150 ease-out active:scale-[0.97]"
                        style={{ background: "hsl(145 30% 42%)" }}
                      >
                        View Recipe
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <button
                onClick={() => { setResult(null); loadMeals(true); }}
                className="mt-4 text-sm font-medium underline"
                style={{ color: "hsl(145 30% 42%)" }}
              >
                Spin again
              </button>
            </>
          ) : (
            <div className="mt-8 flex flex-col items-center gap-5">
              <div className="w-56 h-56 rounded-full flex items-center justify-center text-7xl shadow-sm"
                style={{ background: "linear-gradient(135deg, #EEF6F1 0%, #FAEEE8 100%)" }}>
                🥗
              </div>
              <p className="text-center max-w-xs text-sm leading-6" style={{ color: "#9E9790" }}>
                No pressure — tap below and we’ll find a fresh dinner idea.
              </p>
              <button
                onClick={loadMeals}
                className="h-12 px-6 rounded-xl text-white font-semibold text-base shadow-md transition-transform duration-150 ease-out active:scale-[0.97]"
                style={{ background: "hsl(145 30% 42%)" }}
              >
                Show me what I can make
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
