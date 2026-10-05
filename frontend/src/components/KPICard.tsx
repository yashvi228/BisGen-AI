import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string;
  description?: string;
  change?: number;
  trend?: "up" | "down" | "neutral";
  icon?: React.ReactNode;
  accentColor?: "blue" | "emerald" | "amber" | "violet" | "rose";
  isLoading?: boolean;
}

const colorMap = {
  blue: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-100",
  },
  emerald: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-100",
  },
  amber: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-100",
  },
  violet: {
    bg: "bg-violet-50",
    text: "text-violet-600",
    border: "border-violet-100",
  },
  rose: {
    bg: "bg-rose-50",
    text: "text-rose-600",
    border: "border-rose-100",
  },
};

export default function KPICard({
  title,
  value,
  description,
  change,
  trend,
  icon,
  accentColor = "blue",
  isLoading = false,
}: KPICardProps) {
  const colors = colorMap[accentColor] || colorMap.blue;

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
          <div className="h-10 w-10 bg-gray-100 rounded-xl"></div>
        </div>
        <div className="h-8 w-32 bg-gray-200 rounded mb-2"></div>
        <div className="h-3 w-20 bg-gray-100 rounded"></div>
      </div>
    );
  }

  const isPositive = trend ? trend === "up" : change !== undefined ? change >= 0 : null;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-6 shadow-xs transition-all duration-200 hover:shadow-md hover:border-gray-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-700">
            {title}
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
            {value}
          </h2>
        </div>

        {icon && (
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl border ${colors.bg} ${colors.text} ${colors.border} transition-transform duration-200 group-hover:scale-105`}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2">
        {change !== undefined && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
              isPositive
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                : "bg-rose-50 text-rose-700 border border-rose-200/60"
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

        {description && (
          <p className="text-xs text-gray-600 truncate">{description}</p>
        )}
      </div>
    </div>
  );
}