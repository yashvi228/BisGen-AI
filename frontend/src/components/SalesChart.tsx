import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { TrendingUp, Calendar } from "lucide-react";
import { MonthlySales } from "../types/analytics";

interface SalesChartProps {
  data?: MonthlySales[];
  isLoading?: boolean;
}

export default function SalesChart({ data = [], isLoading = false }: SalesChartProps) {
  const [viewMode, setViewMode] = useState<"both" | "sales" | "profit">("both");

  // Format month labels nicely (e.g., "2019-01-01" -> "Jan '19" or keep "Jan")
  const formattedData = useMemo(() => {
    return data.map((item) => {
      let label = item.month;
      if (item.month.includes("-")) {
        const date = new Date(item.month);
        if (!isNaN(date.getTime())) {
          label = date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
        }
      }
      return {
        ...item,
        displayMonth: label,
      };
    });
  }, [data]);

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
    return `$${val.toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs animate-pulse">
        <div className="flex items-center justify-between mb-6">
          <div className="h-5 w-40 bg-gray-200 rounded"></div>
          <div className="h-8 w-32 bg-gray-100 rounded-lg"></div>
        </div>
        <div className="h-72 w-full bg-gray-100 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-xs">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <TrendingUp className="h-4 w-4" />
            </span>
            <h3 className="text-base font-bold text-gray-900">
              Sales & Profit Momentum
            </h3>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Monthly breakdown of top-line revenue and bottom-line profit
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1 text-xs font-medium text-gray-600">
            <button
              onClick={() => setViewMode("both")}
              className={`rounded-md px-2.5 py-1 transition-all ${
                viewMode === "both"
                  ? "bg-white text-blue-600 shadow-xs font-semibold"
                  : "hover:text-gray-900"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setViewMode("sales")}
              className={`rounded-md px-2.5 py-1 transition-all ${
                viewMode === "sales"
                  ? "bg-white text-blue-600 shadow-xs font-semibold"
                  : "hover:text-gray-900"
              }`}
            >
              Sales
            </button>
            <button
              onClick={() => setViewMode("profit")}
              className={`rounded-md px-2.5 py-1 transition-all ${
                viewMode === "profit"
                  ? "bg-white text-emerald-600 shadow-xs font-semibold"
                  : "hover:text-gray-900"
              }`}
            >
              Profit
            </button>
          </div>
        </div>
      </div>

      <div className="h-72 w-full">
        {formattedData.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-gray-400">
            <Calendar className="h-10 w-10 mb-2 stroke-1" />
            <p className="text-sm">No sales data available for this range</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={formattedData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="displayMonth"
                tickLine={false}
                axisLine={{ stroke: "#e2e8f0" }}
                tick={{ fill: "#64748b", fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
                tickFormatter={formatCurrency}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const row = payload[0].payload as MonthlySales & { displayMonth: string };
                    const margin = row.total_sales > 0 ? ((row.total_profit / row.total_sales) * 100).toFixed(1) : 0;
                    return (
                      <div className="rounded-xl border border-gray-100 bg-white/95 p-3 shadow-lg backdrop-blur-xs">
                        <p className="font-semibold text-gray-800 text-xs mb-2">
                          {row.displayMonth}
                        </p>
                        <div className="space-y-1.5 text-xs">
                          {(viewMode === "both" || viewMode === "sales") && (
                            <div className="flex items-center justify-between gap-4">
                              <span className="flex items-center gap-1.5 text-gray-500">
                                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                                Sales:
                              </span>
                              <span className="font-semibold text-gray-900">
                                ${row.total_sales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                          )}
                          {(viewMode === "both" || viewMode === "profit") && (
                            <div className="flex items-center justify-between gap-4">
                              <span className="flex items-center gap-1.5 text-gray-500">
                                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                                Profit:
                              </span>
                              <span className="font-semibold text-emerald-600">
                                ${row.total_profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                          )}
                          <div className="pt-1 border-t border-gray-100 flex items-center justify-between gap-4">
                            <span className="text-gray-400">Profit Margin:</span>
                            <span className="font-medium text-gray-700">{margin}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                height={30}
                iconType="circle"
                wrapperStyle={{ fontSize: "12px", paddingBottom: "10px" }}
              />
              {(viewMode === "both" || viewMode === "sales") && (
                <Area
                  type="monotone"
                  dataKey="total_sales"
                  name="Revenue"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorSales)"
                />
              )}
              {(viewMode === "both" || viewMode === "profit") && (
                <Area
                  type="monotone"
                  dataKey="total_profit"
                  name="Profit"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorProfit)"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
