import { useState, useRef } from "react";
import { Camera, Check, X } from "lucide-react";
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
    <div className="min-h-screen pb-24" style={{ background: "#FAF8F5" }}>
      <div className="mx-auto max-w-[480px] px-5 pt-12 pb-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em]" style={{ color: "#9E9790" }}>
          AI vision
        </p>
        <h1 className="mt-2 text-[28px] font-bold leading-[1.3] tracking-[-0.015em]" style={{ color: "#332F2B" }}>Scan your fridge</h1>
        <p className="text-sm mt-2" style={{ color: "#9E9790" }}>
          Take a photo of your fridge or pantry to auto-detect ingredients
        </p>
      </div>

      <div className="mx-auto max-w-[480px] px-5">
        {!preview ? (
          <div className="flex flex-col gap-4">
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full py-10 rounded-2xl border-2 border-dashed border-[hsl(145_30%_42%)]/20 bg-[hsl(145_30%_95%)] flex flex-col items-center gap-3 transition-colors hover:bg-[hsl(145_30%_95%)]"
            >
              <Camera size={40} style={{ color: "hsl(145 30% 42%)" }} />
              <span className="text-base font-semibold" style={{ color: "hsl(145 30% 42%)" }}>
                Take or Upload a Photo
              </span>
              <span className="text-xs" style={{ color: "#9E9790" }}>Tap to choose image from your device</span>
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
              <h3 className="font-semibold mb-2" style={{ color: "#332F2B" }}>How it works</h3>
              <ul className="text-sm space-y-1.5" style={{ color: "#9E9790" }}>
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
                <div className="w-12 h-12 rounded-full border-4 border-green-100 border-t-green-700 animate-spin" />
                <p className="font-medium" style={{ color: "#9E9790" }}>Analysing your fridge…</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 rounded-xl p-4 text-sm" style={{ color: "hsl(0 65% 55%)" }}>
                {error}
              </div>
            )}

            {results && !scanning && (
              <AnimatePresence>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  {added ? (
                    <div className="flex flex-col items-center gap-3 py-8">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "#EEF6F1" }}>
                        <Check size={28} style={{ color: "hsl(145 30% 42%)" }} />
                      </div>
                      <p className="font-semibold" style={{ color: "#332F2B" }}>
                        {selected.size} ingredient{selected.size !== 1 ? "s" : ""} added!
                      </p>
                      <button
                        onClick={handleReset}
                        className="h-12 px-6 rounded-xl font-semibold text-sm text-white transition-transform duration-150 ease-out active:scale-[0.97]"
                        style={{ background: "hsl(145 30% 42%)" }}
                      >
                        Scan another photo
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="bg-white rounded-2xl shadow-sm p-5">
                        <h3 className="font-semibold mb-3" style={{ color: "#332F2B" }}>
                          Found {results.length} ingredient{results.length !== 1 ? "s" : ""}
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {results.map((ing) => (
                            <button
                              key={ing}
                              onClick={() => toggleIngredient(ing)}
                              className="h-9 flex items-center gap-1.5 px-3 rounded-full text-sm font-medium border transition-all"
                              style={
                                selected.has(ing)
                                  ? { background: "#EEF6F1", borderColor: "hsl(145 30% 42%)", color: "hsl(145 30% 42%)" }
                                  : { background: "#FAF8F5", borderColor: "#EDEBE8", color: "#9E9790" }
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
                          className="h-12 w-full rounded-xl text-white font-semibold disabled:opacity-40 transition-transform duration-150 ease-out active:scale-[0.97]"
                          style={{ background: "hsl(145 30% 42%)" }}
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
