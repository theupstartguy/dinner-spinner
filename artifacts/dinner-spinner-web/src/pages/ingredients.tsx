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
    <div className="min-h-screen pb-24" style={{ background: "#FAF8F5" }}>
      <div className="mx-auto max-w-[480px] px-5 pt-12 pb-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em]" style={{ color: "#9E9790" }}>
          Your fridge
        </p>
        <h1 className="mt-2 text-[28px] font-bold leading-[1.3] tracking-[-0.015em]" style={{ color: "#332F2B" }}>Ingredients</h1>
        <p className="text-sm mt-2" style={{ color: "#9E9790" }}>
          {ingredients.length === 0
            ? "Add what you have and we’ll do the rest."
            : `${ingredients.length} ingredient${ingredients.length !== 1 ? "s" : ""} ready to use`}
        </p>
      </div>

      <div className="mx-auto max-w-[480px] px-5">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What's in your fridge?"
            className="flex-1 h-12 border border-stone-200 rounded-xl px-4 text-base bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(145_30%_42%)]/20"
          />
          <button
            onClick={handleAdd}
            disabled={!input.trim()}
            className="h-12 px-4 rounded-xl text-white font-semibold disabled:opacity-40 transition-transform duration-150 ease-out active:scale-[0.97]"
            style={{ background: "hsl(145 30% 42%)" }}
          >
            <Plus size={20} />
          </button>
        </div>

        {ingredients.length === 0 ? (
          <div className="mt-16 flex flex-col items-center gap-3 text-center">
            <span className="text-6xl">🥬</span>
            <p className="font-medium" style={{ color: "#9E9790" }}>Your fridge is empty</p>
            <p className="text-sm max-w-xs" style={{ color: "#9E9790" }}>
              Add ingredients to start getting fresh dinner ideas.
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
                    className="h-9 flex items-center gap-1.5 px-3 rounded-full text-sm font-medium bg-[hsl(145_30%_95%)]"
                    style={{ color: "hsl(145 30% 42%)" }}
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
              className="mt-6 h-10 w-full rounded-xl border border-stone-200 text-sm font-medium transition-colors hover:bg-stone-50"
              style={{ color: "#9E9790" }}
            >
              Clear all ingredients
            </button>
          </>
        )}
      </div>
    </div>
  );
}
