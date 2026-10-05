import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { TrendingUp, BarChart2, LineChart as LineIcon } from "lucide-react";
import { MonthlySales } from "../types/analytics";

interface SalesChartProps {
  data?: MonthlySales[];
  isLoading?: boolean;
}

export default function SalesChart({ data = [], isLoading = false }: SalesChartProps) {
  const [viewMode, setViewMode] = useState<"both" | "sales" | "profit">("both");
  const [chartType, setChartType] = useState<"area" | "bar">("area");

  // Format month labels nicely
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

  // Compute key stats for summary badges
  const stats = useMemo(() => {
    if (!data.length) return { totalSales: 0, totalProfit: 0, peakMonth: "N/A", peakSales: 0, avgMonthly: 0 };
    const totalSales = data.reduce((s, i) => s + i.total_sales, 0);
    const totalProfit = data.reduce((s, i) => s + i.total_profit, 0);
    let peak = data[0];
    for (const item of data) {
      if (item.total_sales > peak.total_sales) peak = item;
    }
    const avg = totalSales / data.length;
    return {
      totalSales,
      totalProfit,
      peakMonth: peak.month.includes("-") ? new Date(peak.month).toLocaleDateString("en-US", { month: "short" }) : peak.month,
      peakSales: peak.total_sales,
      avgMonthly: avg,
    };
  }, [data]);

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
    return `$${val.toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs animate-pulse">
        <div className="flex items-center justify-between mb-6">
          <div className="h-5 w-48 bg-slate-200 rounded"></div>
          <div className="h-8 w-44 bg-slate-100 rounded-lg"></div>
        </div>
        <div className="h-72 w-full bg-slate-100 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
      {/* Top Header & Toggles */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <TrendingUp className="h-4 w-4" />
            </span>
            <h3 className="text-base font-bold text-slate-900">
              Sales & Profit Momentum
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Monthly distribution of top-line revenue and net margin
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Chart Type Toggle */}
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs">
            <button
              onClick={() => setChartType("area")}
              className={`flex items-center gap-1 rounded-md px-2 py-1 transition-all ${
                chartType === "area"
                  ? "bg-white text-blue-600 shadow-xs font-semibold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              title="Area Curve"
            >
              <LineIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Area</span>
            </button>
            <button
              onClick={() => setChartType("bar")}
              className={`flex items-center gap-1 rounded-md px-2 py-1 transition-all ${
                chartType === "bar"
                  ? "bg-white text-blue-600 shadow-xs font-semibold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              title="Bar Chart"
            >
              <BarChart2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Bars</span>
            </button>
          </div>

          {/* Metric Filter */}
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs font-medium text-slate-600">
            <button
              onClick={() => setViewMode("both")}
              className={`rounded-md px-2.5 py-1 transition-all ${
                viewMode === "both"
                  ? "bg-white text-blue-600 shadow-xs font-semibold"
                  : "hover:text-slate-900"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setViewMode("sales")}
              className={`rounded-md px-2.5 py-1 transition-all ${
                viewMode === "sales"
                  ? "bg-white text-blue-600 shadow-xs font-semibold"
                  : "hover:text-slate-900"
              }`}
            >
              Sales
            </button>
            <button
              onClick={() => setViewMode("profit")}
              className={`rounded-md px-2.5 py-1 transition-all ${
                viewMode === "profit"
                  ? "bg-white text-emerald-600 shadow-xs font-semibold"
                  : "hover:text-slate-900"
              }`}
            >
              Profit
            </button>
          </div>
        </div>
      </div>

      {/* Mini Executive Metric Strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6 pt-3 border-t border-slate-100">
        <div className="rounded-xl bg-slate-50/70 p-2.5 border border-slate-100">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Period Sales</p>
          <p className="text-sm font-bold text-slate-900 mt-0.5">${formatCurrency(stats.totalSales)}</p>
        </div>
        <div className="rounded-xl bg-emerald-50/50 p-2.5 border border-emerald-100/60">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Total Period Profit</p>
          <p className="text-sm font-bold text-emerald-700 mt-0.5">${formatCurrency(stats.totalProfit)}</p>
        </div>
        <div className="rounded-xl bg-slate-50/70 p-2.5 border border-slate-100">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Monthly Run Rate</p>
          <p className="text-sm font-bold text-slate-900 mt-0.5">${formatCurrency(stats.avgMonthly)}/mo</p>
        </div>
        <div className="rounded-xl bg-amber-50/50 p-2.5 border border-amber-100/60">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Peak Volume Month</p>
          <p className="text-sm font-bold text-amber-800 mt-0.5">{stats.peakMonth} ({formatCurrency(stats.peakSales)})</p>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "area" ? (
            <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
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
                tick={{ fill: "#64748b", fontSize: 11 }}
                tickFormatter={formatCurrency}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const row = payload[0].payload as MonthlySales & { displayMonth: string };
                    const margin = row.total_sales > 0 ? ((row.total_profit / row.total_sales) * 100).toFixed(1) : 0;
                    return (
                      <div className="rounded-xl border border-slate-200/80 bg-white/95 p-3.5 shadow-xl backdrop-blur-md">
                        <p className="font-bold text-slate-800 text-xs mb-2">
                          {row.displayMonth} Performance
                        </p>
                        <div className="space-y-1.5 text-xs">
                          {(viewMode === "both" || viewMode === "sales") && (
                            <div className="flex items-center justify-between gap-6">
                              <span className="flex items-center gap-1.5 text-slate-500">
                                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                                Gross Sales:
                              </span>
                              <span className="font-bold text-slate-900 tabular-nums">
                                ${row.total_sales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                          )}
                          {(viewMode === "both" || viewMode === "profit") && (
                            <div className="flex items-center justify-between gap-6">
                              <span className="flex items-center gap-1.5 text-slate-500">
                                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                                Net Profit:
                              </span>
                              <span className="font-bold text-emerald-600 tabular-nums">
                                ${row.total_profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                          )}
                          <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between gap-6 text-[11px]">
                            <span className="text-slate-400">Profit Margin:</span>
                            <span className="font-bold text-slate-700">{margin}%</span>
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
                  name="Sales Revenue"
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
                  name="Net Profit"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorProfit)"
                />
              )}
            </AreaChart>
          ) : (
            <BarChart data={formattedData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
                tick={{ fill: "#64748b", fontSize: 11 }}
                tickFormatter={formatCurrency}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const row = payload[0].payload as MonthlySales & { displayMonth: string };
                    return (
                      <div className="rounded-xl border border-slate-200/80 bg-white/95 p-3 shadow-lg">
                        <p className="font-bold text-slate-800 text-xs mb-1.5">{row.displayMonth}</p>
                        <p className="text-xs text-blue-600 font-semibold">Sales: ${row.total_sales.toLocaleString()}</p>
                        <p className="text-xs text-emerald-600 font-semibold">Profit: ${row.total_profit.toLocaleString()}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend verticalAlign="top" align="right" height={30} iconType="circle" />
              {(viewMode === "both" || viewMode === "sales") && (
                <Bar dataKey="total_sales" name="Sales Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              )}
              {(viewMode === "both" || viewMode === "profit") && (
                <Bar dataKey="total_profit" name="Net Profit" fill="#10b981" radius={[4, 4, 0, 0]} />
              )}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
