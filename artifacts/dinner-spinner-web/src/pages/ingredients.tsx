import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Sparkles, CheckCircle, AlertCircle } from "lucide-react";
import { useIngredients } from "@/context/IngredientsContext";
import { useLocation } from "wouter";

export default function IngredientsPage() {
  const { ingredients, addIngredient, removeIngredient, clearIngredients } = useIngredients();
  const [input, setInput] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [location] = useLocation();

  const paymentStatus = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
  ).get("payment");

  const handleAdd = () => {
    if (input.trim()) {
      addIngredient(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleAdd();
  };

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    setCheckoutError(null);
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Could not start checkout");
      }
      window.location.href = data.url;
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : "Something went wrong");
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: "#FAF8F5" }}>
      <div className="mx-auto max-w-[480px] px-5 pt-12 pb-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em]" style={{ color: "#9E9790" }}>
          Your fridge
        </p>
        <h1 className="mt-2 text-[28px] font-bold leading-[1.3] tracking-[-0.015em]" style={{ color: "#332F2B" }}>
          Ingredients
        </h1>
        <p className="text-sm mt-2" style={{ color: "#9E9790" }}>
          {ingredients.length === 0
            ? "Add what you have and we'll do the rest."
            : `${ingredients.length} ingredient${ingredients.length !== 1 ? "s" : ""} ready to use`}
        </p>
      </div>

      <div className="mx-auto max-w-[480px] px-5">

        {paymentStatus === "success" && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 flex items-start gap-3 rounded-2xl p-4"
            style={{ background: "#EEF6F1" }}
          >
            <CheckCircle size={20} color="hsl(145 30% 42%)" className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold" style={{ color: "#332F2B" }}>
                Payment successful — welcome to Pro!
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#9E9790" }}>
                Your test payment went through. Use card <strong>4242 4242 4242 4242</strong> in sandbox.
              </p>
            </div>
          </motion.div>
        )}

        {paymentStatus === "canceled" && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 flex items-start gap-3 rounded-2xl p-4"
            style={{ background: "#FAEEE8" }}
          >
            <AlertCircle size={20} color="#CC7A55" className="flex-shrink-0 mt-0.5" />
            <p className="text-sm" style={{ color: "#CC7A55" }}>
              Checkout was canceled. No charge was made.
            </p>
          </motion.div>
        )}

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
                    className="h-9 flex items-center gap-1.5 px-3 rounded-full text-sm font-medium"
                    style={{ background: "#EEF6F1", color: "hsl(145 30% 42%)" }}
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
              className="mt-4 h-10 w-full rounded-xl border text-sm font-medium transition-colors hover:bg-stone-50"
              style={{ color: "#9E9790", borderColor: "#EDEBE8" }}
            >
              Clear all ingredients
            </button>
          </>
        )}

        <div
          className="mt-8 rounded-2xl p-5 flex flex-col gap-4"
          style={{ background: "linear-gradient(135deg, hsl(145 30% 42%) 0%, hsl(145 35% 35%) 100%)" }}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <Sparkles size={20} color="white" />
            </div>
            <div>
              <p className="text-white font-semibold text-[15px] leading-[1.4]">
                Upgrade to FridgeFresh Pro
              </p>
              <p className="text-white/75 text-[13px] mt-0.5 leading-[1.5]">
                Unlimited AI scans, smarter suggestions, and ad-free cooking — just $4.99.
              </p>
            </div>
          </div>

          <ul className="space-y-1.5">
            {[
              "Unlimited fridge scans with AI vision",
              "Smart add-on ingredient suggestions",
              "Priority recipe matching",
              "Ad-free experience",
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-[13px] text-white/90">
                <CheckCircle size={14} color="white" className="flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>

          <button
            onClick={handleCheckout}
            disabled={checkoutLoading}
            className="h-12 w-full rounded-xl font-semibold text-sm transition-transform duration-150 ease-out active:scale-[0.97] disabled:opacity-60"
            style={{ background: "white", color: "hsl(145 30% 38%)" }}
          >
            {checkoutLoading ? "Opening checkout…" : "Get Pro — $4.99"}
          </button>

          {checkoutError && (
            <p className="text-white/90 text-[13px] text-center">
              {checkoutError}
            </p>
          )}

          <p className="text-white/50 text-[11px] text-center">
            Sandbox mode — use card 4242 4242 4242 4242 · Any future date · Any CVC
          </p>
        </div>

      </div>
    </div>
  );
}
