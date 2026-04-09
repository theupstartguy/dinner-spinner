import { ChefHat, Refrigerator, ScanLine } from "lucide-react";
import { useLocation } from "wouter";

const tabs = [
  { path: "/", label: "Spin", icon: ChefHat },
  { path: "/ingredients", label: "Fridge", icon: Refrigerator },
  { path: "/scan", label: "Scan", icon: ScanLine },
];

export default function BottomNav() {
  const [location, navigate] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-stone-200/70 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-[480px] px-4">
        {tabs.map((tab) => {
          const active = tab.path === "/" ? location === "/" : location.startsWith(tab.path);
          const Icon = tab.icon;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="flex-1 py-3.5 flex flex-col items-center gap-1 transition-colors"
            >
              <Icon size={20} strokeWidth={1.75} />
              <span
                className="text-[11px] font-medium tracking-[0.04em]"
                style={{ color: active ? "hsl(145 30% 42%)" : "hsl(30 8% 60%)" }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
