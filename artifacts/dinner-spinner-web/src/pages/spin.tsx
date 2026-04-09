import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import SpinnerWheel from "@/components/SpinnerWheel";
import { useIngredients } from "@/context/IngredientsContext";
import { getMealsByIngredients, MealSummary } from "@/services/mealdb";

export default function SpinPage() {
  const { ingredients } = useIngredients();
  const [, navigate] = useLocation();
  const [meals, setMeals] = useState<MealSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MealSummary | null>(null);
  const [mealsLoaded, setMealsLoaded] = useState(false);

  const loadMeals = async () => {
    if (mealsLoaded) return meals;
    setLoading(true);
    try {
      const fetched = await getMealsByIngredients(ingredients);
      setMeals(fetched);
      setMealsLoaded(true);
      return fetched;
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
    <div className="min-h-screen pb-20" style={{ background: "#FAFAF8" }}>
      <div className="px-5 pt-12 pb-4">
        <h1 className="text-3xl font-extrabold" style={{ color: "#1a1a1a" }}>
          🍽️ Dinner Spinner
        </h1>
        <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
          {ingredients.length > 0
            ? `Using ${ingredients.length} ingredient${ingredients.length !== 1 ? "s" : ""}`
            : "Spinning random meals — add ingredients for better matches!"}
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center pt-20 gap-4">
          <div className="w-16 h-16 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin" />
          <p className="text-gray-500 font-medium">Finding meals…</p>
        </div>
      ) : (
        <div className="flex flex-col items-center px-4">
          {mealsLoaded || meals.length > 0 ? (
            <>
              <SpinnerWheel items={wheelItems} onResult={handleResult} />
              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 30 }}
                    className="mt-8 w-full max-w-sm rounded-2xl overflow-hidden shadow-lg bg-white"
                  >
                    <img
                      src={result.strMealThumb}
                      alt={result.strMeal}
                      className="w-full h-44 object-cover"
                    />
                    <div className="p-4">
                      <h2 className="text-xl font-bold text-gray-900">{result.strMeal}</h2>
                      <button
                        onClick={() => navigate(`/recipe/${result.idMeal}`)}
                        className="mt-3 w-full py-2.5 rounded-xl text-white font-semibold text-sm transition-all active:scale-95"
                        style={{ background: "linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)" }}
                      >
                        View Recipe →
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <button
                onClick={() => { setMealsLoaded(false); setResult(null); loadMeals(); }}
                className="mt-4 text-sm font-medium underline"
                style={{ color: "#FF6B35" }}
              >
                Refresh meals
              </button>
            </>
          ) : (
            <div className="mt-8 flex flex-col items-center gap-5">
              <div className="w-56 h-56 rounded-full flex items-center justify-center text-7xl"
                style={{ background: "linear-gradient(135deg, #FF6B35 15%, #FF8C42 100%)" }}>
                🍳
              </div>
              <p className="text-center text-gray-500 max-w-xs">
                Tap the button below to load meal suggestions, then spin the wheel!
              </p>
              <button
                onClick={loadMeals}
                className="px-8 py-3 rounded-full text-white font-bold text-base shadow-md transition-all active:scale-95"
                style={{ background: "linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)" }}
              >
                Load Meals
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
