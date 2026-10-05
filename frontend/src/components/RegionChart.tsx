import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { MapPin, BarChart3, PieChart as PieIcon, Award } from "lucide-react";
import { RegionSales } from "../types/analytics";

interface RegionChartProps {
  data?: RegionSales[];
  isLoading?: boolean;
}

const REGION_COLORS: Record<string, string> = {
  West: "#3b82f6",     // Blue
  East: "#8b5cf6",     // Violet
  Central: "#06b6d4",  // Cyan
  South: "#10b981",    // Emerald
};

const DEFAULT_COLORS = ["#3b82f6", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b"];

export default function RegionChart({ data = [], isLoading = false }: RegionChartProps) {
  const [viewType, setViewType] = useState<"bar" | "pie">("bar");

  const { processedData, topRegion } = useMemo(() => {
    const total = data.reduce((sum, item) => sum + item.total_sales, 0);
    const processed = data.map((item, index) => ({
      ...item,
      percentage: total > 0 ? ((item.total_sales / total) * 100).toFixed(1) : "0",
      color: REGION_COLORS[item.region] || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
    }));
    const top = [...processed].sort((a, b) => b.total_sales - a.total_sales)[0];
    return { totalSales: total, processedData: processed, topRegion: top };
  }, [data]);

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
    return `$${val}`;
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs animate-pulse">
        <div className="flex items-center justify-between mb-6">
          <div className="h-5 w-40 bg-slate-200 rounded"></div>
          <div className="h-8 w-24 bg-slate-100 rounded-lg"></div>
        </div>
        <div className="h-64 w-full bg-slate-100 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <MapPin className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-base font-bold text-slate-900">Regional Performance</h3>
            <p className="text-xs text-slate-500">Sales volume distributed across geographic territories</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs">
            <button
              onClick={() => setViewType("bar")}
              className={`p-1 rounded-md transition-colors ${
                viewType === "bar"
                  ? "bg-white text-indigo-600 shadow-xs"
                  : "text-slate-400 hover:text-slate-700"
              }`}
              title="Bar Chart"
            >
              <BarChart3 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewType("pie")}
              className={`p-1 rounded-md transition-colors ${
                viewType === "pie"
                  ? "bg-white text-indigo-600 shadow-xs"
                  : "text-slate-400 hover:text-slate-700"
              }`}
              title="Donut Chart"
            >
              <PieIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Top Territory Badge */}
      {topRegion && (
        <div className="mb-3 flex items-center justify-between rounded-xl bg-indigo-50/60 p-2.5 border border-indigo-100/60 text-xs">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-indigo-600" />
            <span className="font-semibold text-indigo-900">Leading Market:</span>
            <span className="font-bold text-indigo-700">{topRegion.region} Territory</span>
          </div>
          <span className="font-extrabold text-indigo-700 tabular-nums">
            ${formatCurrency(topRegion.total_sales)} ({topRegion.percentage}%)
          </span>
        </div>
      )}

      <div className="h-52 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          {viewType === "bar" ? (
            <BarChart data={processedData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <XAxis
                dataKey="region"
                tickLine={false}
                axisLine={{ stroke: "#e2e8f0" }}
                tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#64748b", fontSize: 11 }}
                tickFormatter={formatCurrency}
              />
              <Tooltip
                cursor={{ fill: "rgba(241, 245, 249, 0.6)" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as RegionSales & {
                      percentage: string;
                      color: string;
                    };
                    return (
                      <div className="rounded-xl border border-slate-200/80 bg-white/95 p-3 shadow-lg">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <p className="font-bold text-slate-900 text-xs">{item.region} Region</p>
                        </div>
                        <p className="text-xs text-slate-600">
                          Sales: <span className="font-bold text-slate-900">${item.total_sales.toLocaleString()}</span>
                        </p>
                        <p className="text-xs text-indigo-600 font-medium">
                          Share: {item.percentage}%
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="total_sales" radius={[6, 6, 0, 0]}>
                {processedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <PieChart>
              <Pie
                data={processedData}
                dataKey="total_sales"
                nameKey="region"
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={80}
                paddingAngle={4}
              >
                {processedData.map((entry, index) => (
                  <Cell key={`pie-cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as RegionSales & {
                      percentage: string;
                      color: string;
                    };
                    return (
                      <div className="rounded-xl border border-slate-200/80 bg-white/95 p-2.5 shadow-lg text-xs">
                        <p className="font-bold text-slate-900">{item.region}</p>
                        <p className="text-slate-600">${item.total_sales.toLocaleString()} ({item.percentage}%)</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Mini legend badges */}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 pt-3 border-t border-slate-100">
        {processedData.map((item) => (
          <div key={item.region} className="flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs border border-slate-100/80">
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }}></span>
              {item.region}
            </span>
            <span className="font-bold text-slate-900">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
