import { useRef, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { Shuffle } from "lucide-react";

const SEGMENT_COLORS = [
  "#4B8B6E", "#CC7A55", "#7DB89A", "#E8A81C",
  "#3A6B55", "#D9895F", "#93C5AC", "#F2C55C",
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
    const maxChars = 10;
    const truncated = item.length > maxChars ? item.slice(0, maxChars) + "…" : item;

    return { path, color: SEGMENT_COLORS[i % SEGMENT_COLORS.length], labelPos, labelAngle, label: truncated };
  });

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative" style={{ width: size, height: size }}>
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 z-20"
          style={{
            width: 0,
            height: 0,
            borderLeft: "10px solid transparent",
            borderRight: "10px solid transparent",
            borderTop: "22px solid #332F2B",
            marginTop: "-2px",
          }}
        />
        <motion.svg
          width={size}
          height={size}
          animate={controls}
          style={{ originX: "50%", originY: "50%" }}
          className="drop-shadow-lg"
        >
          {count === 0 ? (
            <circle cx={cx} cy={cy} r={r} fill="#EDEBE8" />
          ) : (
            segments.map((seg, i) => (
              <g key={i}>
                <path d={seg.path} fill={seg.color} stroke="rgba(255,255,255,0.6)" strokeWidth={1.5} />
                <text
                  x={seg.labelPos.x}
                  y={seg.labelPos.y}
                  fill="white"
                  fontSize={count > 6 ? 9 : 11}
                  fontWeight="600"
                  fontFamily="Inter, system-ui, sans-serif"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${seg.labelAngle + 90}, ${seg.labelPos.x}, ${seg.labelPos.y})`}
                  style={{ pointerEvents: "none" }}
                >
                  {seg.label}
                </text>
              </g>
            ))
          )}
          <circle cx={cx} cy={cy} r={20} fill="white" stroke="#EDEBE8" strokeWidth={2} />
        </motion.svg>
      </div>

      <button
        onClick={spin}
        disabled={isSpinning || count === 0}
        className="h-12 min-w-[240px] px-6 rounded-xl text-white font-semibold text-[15px] shadow-sm transition-transform duration-150 ease-out active:scale-[0.97] disabled:opacity-50 disabled:active:scale-100 inline-flex items-center justify-center gap-2"
        style={{ background: isSpinning || count === 0 ? "#EDEBE8" : "hsl(145 30% 42%)" }}
      >
        <Shuffle size={17} />
        {isSpinning ? "Spinning…" : count === 0 ? "Add ingredients first" : "Show me what I can make"}
      </button>
    </div>
  );
}

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  const rad = (angle * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}
