import { useRef, useState } from "react";
import { motion, useAnimation } from "framer-motion";

const SEGMENT_COLORS = [
  "#FF6B35", "#FF8C42", "#F7C59F", "#EFEFD0",
  "#004E89", "#1A936F", "#C3423F", "#E84855",
];

interface SpinnerWheelProps {
  items: string[];
  onResult: (item: string) => void;
}

export default function SpinnerWheel({ items, onResult }: SpinnerWheelProps) {
  const controls = useAnimation();
  const [isSpinning, setIsSpinning] = useState(false);
  const totalRotation = useRef(0);
  const count = items.length;

  const spin = async () => {
    if (isSpinning || count === 0) return;
    setIsSpinning(true);

    const extraSpins = 5 + Math.floor(Math.random() * 5);
    const randomOffset = Math.floor(Math.random() * 360);
    const spinAmount = extraSpins * 360 + randomOffset;
    totalRotation.current += spinAmount;

    await controls.start({
      rotate: totalRotation.current,
      transition: { duration: 4, ease: [0.17, 0.67, 0.21, 0.99] },
    });

    const finalAngle = totalRotation.current % 360;
    const segmentAngle = 360 / count;
    const normalized = (360 - (finalAngle % 360)) % 360;
    const index = Math.floor(normalized / segmentAngle) % count;
    onResult(items[index]);
    setIsSpinning(false);
  };

  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 4;

  const segments = items.map((item, i) => {
    const startAngle = (i * 360) / count - 90;
    const endAngle = ((i + 1) * 360) / count - 90;
    const start = polarToCartesian(cx, cy, r, startAngle);
    const end = polarToCartesian(cx, cy, r, endAngle);
    const largeArc = 360 / count > 180 ? 1 : 0;
    const path = `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;

    const labelAngle = startAngle + 360 / count / 2;
    const labelR = r * 0.62;
    const labelPos = polarToCartesian(cx, cy, labelR, labelAngle);
    const words = item.split(" ");
    const maxChars = 10;
    const truncated = item.length > maxChars ? item.slice(0, maxChars) + "…" : item;

    return { path, color: SEGMENT_COLORS[i % SEGMENT_COLORS.length], labelPos, labelAngle, label: truncated };
  });

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative" style={{ width: size, height: size }}>
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-20"
          style={{ width: 0, height: 0, borderLeft: "12px solid transparent", borderRight: "12px solid transparent", borderTop: "24px solid #1a1a1a" }}
        />
        <motion.svg
          width={size}
          height={size}
          animate={controls}
          style={{ originX: "50%", originY: "50%" }}
          className="drop-shadow-xl"
        >
          {count === 0 ? (
            <circle cx={cx} cy={cy} r={r} fill="#e5e7eb" />
          ) : (
            segments.map((seg, i) => (
              <g key={i}>
                <path d={seg.path} fill={seg.color} stroke="white" strokeWidth={2} />
                <text
                  x={seg.labelPos.x}
                  y={seg.labelPos.y}
                  fill="white"
                  fontSize={count > 6 ? 9 : 11}
                  fontWeight="700"
                  fontFamily="Inter, sans-serif"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${seg.labelAngle + 90}, ${seg.labelPos.x}, ${seg.labelPos.y})`}
                  style={{ textShadow: "0 1px 3px rgba(0,0,0,0.4)", pointerEvents: "none" }}
                >
                  {seg.label}
                </text>
              </g>
            ))
          )}
          <circle cx={cx} cy={cy} r={18} fill="white" stroke="#e5e7eb" strokeWidth={2} />
        </motion.svg>
      </div>

      <button
        onClick={spin}
        disabled={isSpinning || count === 0}
        className="px-10 py-3.5 rounded-full text-white font-bold text-lg shadow-lg transition-all active:scale-95 disabled:opacity-50"
        style={{ background: isSpinning || count === 0 ? "#ccc" : "linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)" }}
      >
        {isSpinning ? "Spinning…" : count === 0 ? "Add ingredients first" : "Spin!"}
      </button>
    </div>
  );
}

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  const rad = (angle * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}
