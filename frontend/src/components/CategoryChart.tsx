import { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from "recharts";
import { Layers } from "lucide-react";
import { CategoryProfit } from "../types/analytics";

interface CategoryChartProps {
  data?: CategoryProfit[];
  isLoading?: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  Technology: "#0284c7",    // Ocean Blue
  "Office Supplies": "#059669", // Emerald Green
  Furniture: "#d97706",    // Warm Amber
};

const DEFAULT_COLORS = ["#0284c7", "#059669", "#d97706", "#7c3aed"];

export default function CategoryChart({ data = [], isLoading = false }: CategoryChartProps) {
  const { totalProfit, sortedData } = useMemo(() => {
    const total = data.reduce((sum, item) => sum + item.total_profit, 0);
    const sorted = [...data].sort((a, b) => b.total_profit - a.total_profit);
    const enriched = sorted.map((item, index) => ({
      ...item,
      color: CATEGORY_COLORS[item.category] || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
      percentage: total > 0 ? ((item.total_profit / total) * 100).toFixed(1) : "0",
    }));
    return { totalProfit: total, sortedData: enriched };
  }, [data]);

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
    return `$${val}`;
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs animate-pulse">
        <div className="flex items-center justify-between mb-6">
          <div className="h-5 w-36 bg-gray-200 rounded"></div>
          <div className="h-4 w-20 bg-gray-100 rounded"></div>
        </div>
        <div className="h-64 w-full bg-gray-100 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <Layers className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-base font-bold text-gray-900">Profitability by Category</h3>
            <p className="text-xs text-gray-500">Margin contribution across product categories</p>
          </div>
        </div>

        {totalProfit > 0 && (
          <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200/60">
            Total ${formatCurrency(totalProfit)}
          </span>
        )}
      </div>

      <div className="h-52 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sortedData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#64748b", fontSize: 11 }}
              tickFormatter={formatCurrency}
            />
            <YAxis
              type="category"
              dataKey="category"
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
              tick={{ fill: "#334155", fontSize: 12, fontWeight: 500 }}
              width={100}
            />
            <Tooltip
              cursor={{ fill: "rgba(241, 245, 249, 0.6)" }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as CategoryProfit & {
                    color: string;
                    percentage: string;
                  };
                  return (
                    <div className="rounded-xl border border-gray-100 bg-white/95 p-3 shadow-lg backdrop-blur-xs">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <p className="font-bold text-gray-900 text-xs">{item.category}</p>
                      </div>
                      <div className="text-xs space-y-1">
                        <p className="text-gray-600">
                          Profit:{" "}
                          <span className="font-semibold text-emerald-600">
                            ${item.total_profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </p>
                        <p className="text-gray-500">
                          Profit Share:{" "}
                          <span className="font-medium text-gray-900">{item.percentage}%</span>
                        </p>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="total_profit" radius={[0, 6, 6, 0]}>
              {sortedData.map((entry, index) => (
                <Cell key={`cat-cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Breakdown list */}
      <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-gray-100">
        {sortedData.map((item) => (
          <div
            key={item.category}
            className="flex flex-1 min-w-[120px] items-center justify-between rounded-lg bg-gray-50 px-3 py-1.5 text-xs"
          >
            <span className="flex items-center gap-1.5 text-gray-600 font-medium truncate">
              <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
              <span className="truncate">{item.category}</span>
            </span>
            <span className="font-semibold text-emerald-700 shrink-0 ml-2">
              ${formatCurrency(item.total_profit)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
