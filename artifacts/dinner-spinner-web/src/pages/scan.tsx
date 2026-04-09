import { useState, useRef } from "react";
import { Camera, Upload, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useIngredients } from "@/context/IngredientsContext";

interface ScanResult {
  ingredients: string[];
}

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
    <div className="min-h-screen pb-24" style={{ background: "#FAFAF8" }}>
      <div className="px-5 pt-12 pb-4">
        <h1 className="text-3xl font-extrabold" style={{ color: "#1a1a1a" }}>Scan Your Fridge</h1>
        <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
          Take a photo of your fridge or pantry to auto-detect ingredients
        </p>
      </div>

      <div className="px-5">
        {!preview ? (
          <div className="flex flex-col gap-4">
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full py-10 rounded-2xl border-2 border-dashed border-orange-300 bg-orange-50 flex flex-col items-center gap-3 transition-colors hover:bg-orange-100"
            >
              <Camera size={40} style={{ color: "#FF6B35" }} />
              <span className="text-base font-semibold" style={{ color: "#FF6B35" }}>
                Take or Upload a Photo
              </span>
              <span className="text-xs text-gray-400">Tap to choose image from your device</span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
              <h3 className="font-semibold text-gray-800 mb-2">How it works</h3>
              <ul className="text-sm text-gray-500 space-y-1.5">
                <li>📸 Take or upload a photo of your fridge / pantry</li>
                <li>🤖 AI vision detects the ingredients automatically</li>
                <li>✅ Select which ingredients to add to your list</li>
                <li>🎡 Head to Spin and let the wheel decide dinner!</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="relative rounded-2xl overflow-hidden shadow-md">
              <img src={preview} alt="Fridge" className="w-full max-h-64 object-cover" />
              <button
                onClick={handleReset}
                className="absolute top-3 right-3 p-1.5 bg-black/60 rounded-full text-white"
              >
                <X size={16} />
              </button>
            </div>

            {scanning && (
              <div className="flex flex-col items-center gap-3 py-8">
                <div className="w-12 h-12 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin" />
                <p className="text-gray-500 font-medium">Analysing your fridge…</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">
                {error}
              </div>
            )}

            {results && !scanning && (
              <AnimatePresence>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  {added ? (
                    <div className="flex flex-col items-center gap-3 py-8">
                      <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                        <Check size={28} className="text-green-600" />
                      </div>
                      <p className="text-gray-700 font-semibold">
                        {selected.size} ingredient{selected.size !== 1 ? "s" : ""} added!
                      </p>
                      <button
                        onClick={handleReset}
                        className="px-6 py-2.5 rounded-xl font-semibold text-sm text-white transition-all active:scale-95"
                        style={{ background: "linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)" }}
                      >
                        Scan another photo
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                        <h3 className="font-bold text-gray-900 mb-3">
                          Found {results.length} ingredient{results.length !== 1 ? "s" : ""}
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {results.map((ing) => (
                            <button
                              key={ing}
                              onClick={() => toggleIngredient(ing)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all"
                              style={
                                selected.has(ing)
                                  ? { background: "#FFF3EE", borderColor: "#FF6B35", color: "#FF6B35" }
                                  : { background: "#f9fafb", borderColor: "#e5e7eb", color: "#9ca3af" }
                              }
                            >
                              {selected.has(ing) ? <Check size={12} /> : <X size={12} />}
                              {ing}
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={handleAdd}
                          disabled={selected.size === 0}
                          className="w-full py-2.5 rounded-xl text-white font-semibold disabled:opacity-40 transition-all active:scale-95"
                          style={{ background: "linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)" }}
                        >
                          Add {selected.size} selected ingredient{selected.size !== 1 ? "s" : ""}
                        </button>
                      </div>
                    </>
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
