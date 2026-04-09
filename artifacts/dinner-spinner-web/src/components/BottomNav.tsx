import { useLocation } from "wouter";

const tabs = [
  { path: "/", label: "Spin", icon: "🎡" },
  { path: "/ingredients", label: "Ingredients", icon: "🥦" },
  { path: "/scan", label: "Scan", icon: "📷" },
];

export default function BottomNav() {
  const [location, navigate] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 safe-area-bottom">
      <div className="flex">
        {tabs.map((tab) => {
          const active = tab.path === "/" ? location === "/" : location.startsWith(tab.path);
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="flex-1 py-3 flex flex-col items-center gap-0.5 transition-colors"
            >
              <span className="text-2xl">{tab.icon}</span>
              <span
                className="text-xs font-semibold"
                style={{ color: active ? "#FF6B35" : "#9ca3af" }}
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
