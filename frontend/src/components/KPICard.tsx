import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string;
  description?: string;
  change?: number;
  trend?: "up" | "down" | "neutral";
  targetProgress?: number; // e.g. 92% of target
  icon?: React.ReactNode;
  accentColor?: "blue" | "emerald" | "amber" | "violet" | "rose";
  isLoading?: boolean;
  sparklineData?: number[];
}

const colorMap = {
  blue: {
    bg: "bg-blue-50/80",
    text: "text-blue-600",
    border: "border-blue-100",
    glow: "group-hover:border-blue-300 group-hover:shadow-blue-500/10",
    stroke: "#3b82f6",
  },
  emerald: {
    bg: "bg-emerald-50/80",
    text: "text-emerald-600",
    border: "border-emerald-100",
    glow: "group-hover:border-emerald-300 group-hover:shadow-emerald-500/10",
    stroke: "#10b981",
  },
  amber: {
    bg: "bg-amber-50/80",
    text: "text-amber-600",
    border: "border-amber-100",
    glow: "group-hover:border-amber-300 group-hover:shadow-amber-500/10",
    stroke: "#f59e0b",
  },
  violet: {
    bg: "bg-violet-50/80",
    text: "text-violet-600",
    border: "border-violet-100",
    glow: "group-hover:border-violet-300 group-hover:shadow-violet-500/10",
    stroke: "#8b5cf6",
  },
  rose: {
    bg: "bg-rose-50/80",
    text: "text-rose-600",
    border: "border-rose-100",
    glow: "group-hover:border-rose-300 group-hover:shadow-rose-500/10",
    stroke: "#f43f5e",
  },
};

export default function KPICard({
  title,
  value,
  description,
  change,
  trend,
  targetProgress,
  icon,
  accentColor = "blue",
  isLoading = false,
  sparklineData = [30, 42, 38, 55, 48, 62, 75, 70, 85],
}: KPICardProps) {
  const colors = colorMap[accentColor] || colorMap.blue;

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-xs animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 w-24 bg-slate-200 rounded"></div>
          <div className="h-10 w-10 bg-slate-100 rounded-xl"></div>
        </div>
        <div className="h-8 w-32 bg-slate-200 rounded mb-3"></div>
        <div className="h-3 w-20 bg-slate-100 rounded"></div>
      </div>
    );
  }

  const isPositive = trend ? trend === "up" : change !== undefined ? change >= 0 : null;

  // Generate SVG path for mini sparkline
  const minVal = Math.min(...sparklineData);
  const maxVal = Math.max(...sparklineData);
  const range = maxVal - minVal || 1;
  const height = 24;
  const width = 64;
  const points = sparklineData
    .map((val, idx) => {
      const x = (idx / (sparklineData.length - 1)) * width;
      const y = height - ((val - minVal) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${colors.glow}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
            {title}
          </span>
          <h2 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900 tabular-nums lg:text-3xl">
            {value}
          </h2>
        </div>

        {icon && (
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl border ${colors.bg} ${colors.text} ${colors.border} transition-transform duration-200 group-hover:scale-105 shadow-2xs`}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {change !== undefined && (
            <span
              className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                isPositive
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200/70"
                  : "bg-rose-50 text-rose-700 border border-rose-200/70"
              }`}
            >
              {isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {change > 0 ? `+${change}%` : `${change}%`}
            </span>
          )}

          {trend === "neutral" && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-slate-50 px-2 py-0.5 text-[11px] font-bold text-slate-600 border border-slate-200">
              <Minus className="h-3 w-3" /> Steady
            </span>
          )}

          {description && (
            <p className="text-[11px] text-slate-600 truncate max-w-[120px] sm:max-w-none">
              {description}
            </p>
          )}
        </div>

        {/* Mini Sparkline Chart */}
        <div className="hidden sm:block opacity-75 group-hover:opacity-100 transition-opacity">
          <svg width={width} height={height} className="overflow-visible">
            <polyline
              fill="none"
              stroke={colors.stroke}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />
          </svg>
        </div>
      </div>

      {/* Target Progress Bar if specified */}
      {targetProgress !== undefined && (
        <div className="mt-3 pt-2.5 border-t border-slate-100">
          <div className="flex justify-between text-[10px] font-semibold text-slate-600 mb-1">
            <span>Target Benchmark</span>
            <span>{targetProgress}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                targetProgress >= 90 ? "bg-emerald-500" : "bg-blue-500"
              }`}
              style={{ width: `${Math.min(targetProgress, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}