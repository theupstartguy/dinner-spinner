import { ChefHat, Refrigerator, ScanLine } from "lucide-react";
import { useLocation } from "wouter";

const SAGE = "hsl(145 30% 42%)";
const WARM_GRAY = "hsl(30 8% 60%)";

const tabs = [
  { path: "/", label: "Spin", icon: ChefHat },
  { path: "/ingredients", label: "Fridge", icon: Refrigerator },
  { path: "/scan", label: "Scan", icon: ScanLine },
];

export default function BottomNav() {
  const [location, navigate] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white/95 backdrop-blur-md" style={{ borderColor: "#EDEBE8" }}>
      <div className="mx-auto flex max-w-[480px] px-4">
        {tabs.map((tab) => {
          const active = tab.path === "/" ? location === "/" : location.startsWith(tab.path);
          const Icon = tab.icon;
          const color = active ? SAGE : WARM_GRAY;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="flex-1 py-3.5 flex flex-col items-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(145_30%_42%)] focus-visible:ring-offset-2 rounded"
            >
              <Icon size={20} strokeWidth={1.75} color={color} />
              <span
                className="text-[11px] font-medium tracking-[0.04em]"
                style={{ color }}
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
