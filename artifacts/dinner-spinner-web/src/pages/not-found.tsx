import { useLocation } from "wouter";
import { Refrigerator } from "lucide-react";

export default function NotFound() {
  const [, navigate] = useLocation();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-5 pb-24" style={{ background: "#FAF8F5" }}>
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{ background: "#EEF6F1" }}
      >
        <Refrigerator size={36} color="hsl(145 30% 42%)" strokeWidth={1.5} />
      </div>
      <div className="text-center">
        <h1 className="text-[28px] font-bold leading-[1.3] tracking-[-0.015em]" style={{ color: "#332F2B" }}>
          Page not found
        </h1>
        <p className="mt-2 text-sm leading-6" style={{ color: "#9E9790" }}>
          Hmm, we couldn't find what you were looking for.
        </p>
      </div>
      <button
        onClick={() => navigate("/")}
        className="h-12 px-6 rounded-xl text-white font-semibold text-sm transition-transform duration-150 ease-out active:scale-[0.97]"
        style={{ background: "hsl(145 30% 42%)" }}
      >
        Back to home
      </button>
    </div>
  );
}
