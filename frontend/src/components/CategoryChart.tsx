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
import { Layers, Laptop, Briefcase, Armchair } from "lucide-react";
import { CategoryProfit } from "../types/analytics";

interface CategoryChartProps {
  data?: CategoryProfit[];
  isLoading?: boolean;
}

const CATEGORY_META: Record<string, { color: string; icon: any; status: string; statusColor: string }> = {
  Technology: {
    color: "#0284c7",
    icon: Laptop,
    status: "Strong Margins",
    statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  "Office Supplies": {
    color: "#059669",
    icon: Briefcase,
    status: "High Volume",
    statusColor: "bg-blue-50 text-blue-700 border-blue-200",
  },
  Furniture: {
    color: "#d97706",
    icon: Armchair,
    status: "Margin Caution",
    statusColor: "bg-amber-50 text-amber-700 border-amber-200",
  },
};

export default function CategoryChart({ data = [], isLoading = false }: CategoryChartProps) {
  const { totalProfit, sortedData } = useMemo(() => {
    const total = data.reduce((sum, item) => sum + item.total_profit, 0);
    const sorted = [...data].sort((a, b) => b.total_profit - a.total_profit);
    const enriched = sorted.map((item) => {
      const meta = CATEGORY_META[item.category] || {
        color: "#6366f1",
        icon: Layers,
        status: "Standard",
        statusColor: "bg-slate-50 text-slate-700 border-slate-200",
      };
      return {
        ...item,
        color: meta.color,
        icon: meta.icon,
        status: meta.status,
        statusColor: meta.statusColor,
        percentage: total > 0 ? ((item.total_profit / total) * 100).toFixed(1) : "0",
      };
    });
    return { totalProfit: total, sortedData: enriched };
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
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <Layers className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-base font-bold text-slate-900">Profitability by Category</h3>
            <p className="text-xs text-slate-500">Margin contribution across product categories</p>
          </div>
        </div>

        {totalProfit > 0 && (
          <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200/60 tabular-nums">
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
                    status: string;
                  };
                  return (
                    <div className="rounded-xl border border-slate-200/80 bg-white/95 p-3 shadow-lg">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <p className="font-bold text-slate-900 text-xs">{item.category}</p>
                      </div>
                      <div className="text-xs space-y-1">
                        <p className="text-slate-600">
                          Profit:{" "}
                          <span className="font-bold text-emerald-600">
                            ${item.total_profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </p>
                        <p className="text-slate-500">
                          Share of Profit:{" "}
                          <span className="font-semibold text-slate-900">{item.percentage}%</span>
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

      {/* Category cards with icons & status tag */}
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3 pt-3 border-t border-slate-100">
        {sortedData.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.category}
              className="flex items-center justify-between rounded-xl bg-slate-50/80 p-2.5 border border-slate-100 text-xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-white shrink-0"
                  style={{ backgroundColor: item.color }}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="truncate">
                  <p className="font-semibold text-slate-800 truncate">{item.category}</p>
                  <span className={`inline-block rounded px-1.5 py-0.2 text-[9px] font-bold border ${item.statusColor}`}>
                    {item.status}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0 ml-2">
                <p className="font-bold text-emerald-700">${formatCurrency(item.total_profit)}</p>
                <p className="text-[10px] text-slate-400 font-medium">{item.percentage}%</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
