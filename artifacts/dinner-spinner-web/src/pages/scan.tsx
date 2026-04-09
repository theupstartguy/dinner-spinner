import { useState, useRef } from "react";
import { Camera, Check, X, Shuffle, Leaf, ChefHat } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useIngredients } from "@/context/IngredientsContext";

interface ScanResult {
  ingredients: string[];
}

const HOW_STEPS = [
  { icon: Camera, text: "Take or upload a photo of your fridge or pantry" },
  { icon: Leaf, text: "AI vision detects the ingredients automatically" },
  { icon: Check, text: "Select which ingredients to add to your list" },
  { icon: Shuffle, text: "Head to Spin and let the wheel decide dinner" },
];

export default function ScanPage() {
  const { addIngredient } = useIngredients();
  const [preview, setPreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<string[] | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setResults(null);
    setAdded(false);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      setPreview(dataUrl);
      const base64 = dataUrl.split(",")[1];
      const mimeType = file.type;
      await analyzeImage(base64, mimeType);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (imageBase64: string, mimeType: string) => {
    setScanning(true);
    try {
      const res = await fetch("/api/analyze-fridge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, mimeType }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(err.error ?? "Failed to analyze image");
      }
      const data: ScanResult = await res.json();
      setResults(data.ingredients);
      setSelected(new Set(data.ingredients));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setScanning(false);
    }
  };

  const toggleIngredient = (ing: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(ing)) next.delete(ing);
      else next.add(ing);
      return next;
    });
  };

  const handleAdd = () => {
    selected.forEach((ing) => addIngredient(ing));
    setAdded(true);
  };

  const handleReset = () => {
    setPreview(null);
    setResults(null);
    setSelected(new Set());
    setError(null);
    setAdded(false);
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: "#FAF8F5" }}>
      <div className="mx-auto max-w-[480px] px-5 pt-12 pb-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em]" style={{ color: "#9E9790" }}>
          AI vision
        </p>
        <h1 className="mt-2 text-[28px] font-bold leading-[1.3] tracking-[-0.015em]" style={{ color: "#332F2B" }}>
          Scan your fridge
        </h1>
        <p className="text-sm mt-2 leading-6" style={{ color: "#9E9790" }}>
          Take a photo of your fridge or pantry to auto-detect ingredients.
        </p>
      </div>

      <div className="mx-auto max-w-[480px] px-5">
        {!preview ? (
          <div className="flex flex-col gap-4">
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full py-10 rounded-2xl border-2 border-dashed flex flex-col items-center gap-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(145_30%_42%)] focus-visible:ring-offset-2"
              style={{ borderColor: "hsl(145 30% 42% / 0.25)", background: "#EEF6F1" }}
            >
              <Camera size={40} color="hsl(145 30% 42%)" strokeWidth={1.5} />
              <div className="text-center">
                <p className="text-base font-semibold" style={{ color: "hsl(145 30% 42%)" }}>
                  Take or upload a photo
                </p>
                <p className="text-sm mt-0.5" style={{ color: "#9E9790" }}>
                  Choose an image from your device
                </p>
              </div>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />

            <div className="rounded-2xl bg-white shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <ChefHat size={18} color="hsl(145 30% 42%)" strokeWidth={1.5} />
                <h3 className="font-semibold text-[15px]" style={{ color: "#332F2B" }}>How it works</h3>
              </div>
              <div className="space-y-3">
                {HOW_STEPS.map(({ icon: Icon, text }, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: "#EEF6F1" }}
                    >
                      <Icon size={14} color="hsl(145 30% 42%)" strokeWidth={1.75} />
                    </div>
                    <p className="text-sm leading-6" style={{ color: "#9E9790" }}>{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="relative rounded-2xl overflow-hidden shadow-sm">
              <img src={preview} alt="Fridge" className="w-full max-h-64 object-cover" />
              <button
                onClick={handleReset}
                className="absolute top-3 right-3 p-2 bg-black/50 rounded-full text-white backdrop-blur-sm"
              >
                <X size={16} />
              </button>
            </div>

            {scanning && (
              <div className="flex flex-col items-center gap-3 py-8">
                <div
                  className="w-12 h-12 rounded-full border-4 animate-spin"
                  style={{ borderColor: "#EEF6F1", borderTopColor: "hsl(145 30% 42%)" }}
                />
                <p className="text-sm font-medium" style={{ color: "#9E9790" }}>Finding fresh ideas…</p>
              </div>
            )}

            {error && (
              <div className="rounded-xl p-4 text-sm" style={{ background: "hsl(0 65% 97%)", color: "hsl(0 65% 45%)" }}>
                {error}
              </div>
            )}

            {results && !scanning && (
              <AnimatePresence>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  {added ? (
                    <div className="flex flex-col items-center gap-4 py-10">
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center"
                        style={{ background: "#EEF6F1" }}
                      >
                        <Check size={28} color="hsl(145 30% 42%)" strokeWidth={2} />
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-base" style={{ color: "#332F2B" }}>
                          Saved to your cookbook
                        </p>
                        <p className="text-sm mt-1" style={{ color: "#9E9790" }}>
                          {selected.size} ingredient{selected.size !== 1 ? "s" : ""} added to your fridge
                        </p>
                      </div>
                      <button
                        onClick={handleReset}
                        className="h-12 px-6 rounded-xl font-semibold text-sm text-white transition-transform duration-150 ease-out active:scale-[0.97]"
                        style={{ background: "hsl(145 30% 42%)" }}
                      >
                        Scan another photo
                      </button>
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl shadow-sm p-5">
                      <h3 className="font-semibold text-[15px] mb-1" style={{ color: "#332F2B" }}>
                        Found {results.length} ingredient{results.length !== 1 ? "s" : ""}
                      </h3>
                      <p className="text-sm mb-4" style={{ color: "#9E9790" }}>
                        Tap to deselect any you don't want to add.
                      </p>
                      <div className="flex flex-wrap gap-2 mb-5">
                        {results.map((ing) => (
                          <motion.button
                            key={ing}
                            onClick={() => toggleIngredient(ing)}
                            layout
                            className="h-9 flex items-center gap-1.5 px-3 rounded-full text-[13px] font-medium border transition-colors"
                            style={
                              selected.has(ing)
                                ? { background: "#EEF6F1", borderColor: "hsl(145 30% 42% / 0.3)", color: "hsl(145 30% 42%)" }
                                : { background: "#FAF8F5", borderColor: "#EDEBE8", color: "#9E9790" }
                            }
                          >
                            {selected.has(ing) ? <Check size={12} strokeWidth={2.5} /> : <X size={12} />}
                            {ing}
                          </motion.button>
                        ))}
                      </div>
                      <button
                        onClick={handleAdd}
                        disabled={selected.size === 0}
                        className="h-12 w-full rounded-xl text-white font-semibold disabled:opacity-40 transition-transform duration-150 ease-out active:scale-[0.97]"
                        style={{ background: "hsl(145 30% 42%)" }}
                      >
                        Add {selected.size} ingredient{selected.size !== 1 ? "s" : ""} to fridge
                      </button>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
