import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus } from "lucide-react";
import { useIngredients } from "@/context/IngredientsContext";

export default function IngredientsPage() {
  const { ingredients, addIngredient, removeIngredient, clearIngredients } = useIngredients();
  const [input, setInput] = useState("");

  const handleAdd = () => {
    if (input.trim()) {
      addIngredient(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleAdd();
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: "#FAFAF8" }}>
      <div className="px-5 pt-12 pb-4">
        <h1 className="text-3xl font-extrabold" style={{ color: "#1a1a1a" }}>My Ingredients</h1>
        <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
          {ingredients.length === 0
            ? "Add what's in your fridge to get personalised meals"
            : `${ingredients.length} ingredient${ingredients.length !== 1 ? "s" : ""} ready to spin`}
        </p>
      </div>

      <div className="px-5">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. chicken, pasta, garlic…"
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-base bg-white focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
          <button
            onClick={handleAdd}
            disabled={!input.trim()}
            className="px-4 py-3 rounded-xl text-white font-semibold disabled:opacity-40 transition-all active:scale-95"
            style={{ background: "linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)" }}
          >
            <Plus size={20} />
          </button>
        </div>

        {ingredients.length === 0 ? (
          <div className="mt-16 flex flex-col items-center gap-3 text-center">
            <span className="text-6xl">🧅</span>
            <p className="text-gray-400 font-medium">No ingredients yet</p>
            <p className="text-gray-400 text-sm max-w-xs">
              Type above to add them one by one, or use the Scan tab to detect them from a photo.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-4 flex flex-wrap gap-2">
              <AnimatePresence>
                {ingredients.map((ingredient) => (
                  <motion.div
                    key={ingredient}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-orange-50 border border-orange-200"
                    style={{ color: "#FF6B35" }}
                  >
                    {ingredient}
                    <button
                      onClick={() => removeIngredient(ingredient)}
                      className="hover:opacity-70 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <button
              onClick={clearIngredients}
              className="mt-6 w-full py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Clear all ingredients
            </button>
          </>
        )}
      </div>
    </div>
  );
}
