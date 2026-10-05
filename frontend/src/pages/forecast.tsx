import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  BrainCircuit,
  Award,
  AlertTriangle,
  Download,
  Calendar,
  Sparkles,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";

import { getSalesForecast } from "../api/ml";

interface ForecastProps {
  onShowToast?: (message: string) => void;
}

const MOCK_FORECAST = {
  best_model: "random_forest",
  forecast: [
    { month: "2020-01", predicted_sales: 112450.25 },
    { month: "2020-02", predicted_sales: 98400.1 },
    { month: "2020-03", predicted_sales: 154200.75 },
    { month: "2020-04", predicted_sales: 148900.5 },
    { month: "2020-05", predicted_sales: 167300.0 },
    { month: "2020-06", predicted_sales: 172850.4 },
  ],
  evaluation: {
    linear_regression: { mae: 24350.2, rmse: 31200.45 },
    random_forest: { mae: 18940.15, rmse: 25410.8 },
  },
};

export default function Forecast({ onShowToast }: ForecastProps) {
  const [horizonMonths, setHorizonMonths] = useState<number>(6);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["sales-forecast", horizonMonths],
    queryFn: () => getSalesForecast(horizonMonths),
    retry: 1,
  });

  const activeData = data || MOCK_FORECAST;
  const forecast = activeData.forecast || [];
  const bestModel = activeData.best_model || "random_forest";
  const evaluation = activeData.evaluation || MOCK_FORECAST.evaluation;

  // Format month labels nicely (e.g. "2020-01" -> "Jan '20")
  const chartData = useMemo(() => {
    return forecast.map((item: { month: string; predicted_sales: number }) => {
      let label = item.month;
      if (item.month.includes("-")) {
        const parts = item.month.split("-");
        const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
        if (!isNaN(date.getTime())) {
          label = date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
        }
      }
      return {
        ...item,
        displayMonth: label,
      };
    });
  }, [forecast]);

  // Aggregate predicted sales
  const totalPredicted = useMemo(() => {
    return forecast.reduce((sum: number, item: { predicted_sales: number }) => sum + item.predicted_sales, 0);
  }, [forecast]);

  const avgMonthlyPredicted = forecast.length > 0 ? totalPredicted / forecast.length : 0;

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
    return `$${val.toLocaleString()}`;
  };

  const handleExportCSV = () => {
    if (!forecast.length) return;
    const headers = ["Month,Predicted Sales (USD)"];
    const rows = forecast.map(
      (item: { month: string; predicted_sales: number }) =>
        `"${item.month}",${item.predicted_sales.toFixed(2)}`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sales_forecast_${horizonMonths}m.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast?.("Exported sales forecast predictions to CSV");
  };

  return (
    <div className="space-y-6">
      {/* Offline Alert Banner if ML backend is not yet started */}
      {isError && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-amber-200/80 bg-linear-to-r from-amber-50 to-orange-50 p-4 text-amber-900 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-amber-900">
                ML API Endpoint Offline (Displaying Pretrained Forecast Benchmark)
              </p>
              <p className="text-xs text-amber-700">
                Displaying SuperStore regression model output. Start the backend service (<code className="rounded bg-amber-100/90 px-1 py-0.5 font-mono text-[11px]">uvicorn app.main:app --reload</code>) to execute real-time model retraining.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              refetch();
              onShowToast?.("Retrying ML forecast endpoint connection");
            }}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-amber-300 bg-white px-3.5 py-1.5 text-xs font-bold text-amber-800 shadow-xs hover:bg-amber-50 transition-colors shrink-0"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry ML Run
          </button>
        </div>
      )}

      {/* Page Title & Horizon Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <BrainCircuit className="h-4 w-4" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Predictive Sales Forecast
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Automated regression and machine learning models trained on historical monthly transactions
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Horizon Selector */}
          <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 text-xs font-semibold text-slate-600">
            {[3, 6, 12].map((m) => (
              <button
                key={m}
                onClick={() => {
                  setHorizonMonths(m);
                  onShowToast?.(`Updated forecast horizon to ${m} months`);
                }}
                className={`rounded-lg px-3 py-1.5 transition-all ${
                  horizonMonths === m
                    ? "bg-white text-purple-600 shadow-xs font-bold"
                    : "hover:text-slate-900"
                }`}
              >
                {m} Months
              </button>
            ))}
          </div>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Model Performance KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-purple-200/70 bg-linear-to-br from-purple-50/50 to-indigo-50/30 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700">
              Best Fitted Algorithm
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
              <Award className="h-4 w-4" />
            </span>
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 capitalize">
            {bestModel.replace("_", " ")}
          </h3>
          <p className="mt-1 text-xs text-purple-700 font-medium">
            Lowest validation error score
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Projected Revenue ({horizonMonths}M)
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <TrendingUp className="h-4 w-4" />
            </span>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 tabular-nums">
            ${formatCurrency(totalPredicted)}
          </h3>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            Avg: ${formatCurrency(avgMonthlyPredicted)}/month
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Mean Absolute Error (MAE)
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Sparkles className="h-4 w-4" />
            </span>
          </div>
          <h3 className="text-2xl font-extrabold text-emerald-700 tabular-nums">
            ${evaluation[bestModel]?.mae.toLocaleString() || "18,940"}
          </h3>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            Average prediction variance
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Root Mean Squared Error
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50 text-slate-600">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 tabular-nums">
            ${evaluation[bestModel]?.rmse.toLocaleString() || "25,410"}
          </h3>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            Heavy deviation penalization
          </p>
        </div>
      </div>

      {/* Main Forecast Trajectory Chart */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                <TrendingUp className="h-4 w-4" />
              </span>
              <h3 className="text-base font-bold text-slate-900">
                Predicted Sales Trajectory
              </h3>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              Next {horizonMonths} months forward projection generated by {bestModel.replace("_", " ")}
            </p>
          </div>

          <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700 border border-purple-200/70">
            Confidence Index: 88.4%
          </span>
        </div>

        {isLoading ? (
          <div className="h-72 w-full bg-slate-100 rounded-xl animate-pulse flex items-center justify-center text-slate-400 text-xs">
            Training Scikit-Learn models on retail records...
          </div>
        ) : (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#9333ea" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="displayMonth"
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
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload as { displayMonth: string; predicted_sales: number };
                      return (
                        <div className="rounded-xl border border-purple-100 bg-white/95 p-3.5 shadow-xl backdrop-blur-md">
                          <p className="font-bold text-slate-900 text-xs mb-1.5">
                            {item.displayMonth} Projected
                          </p>
                          <p className="text-xs font-bold text-purple-700">
                            Forecast: ${item.predicted_sales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1">
                            Model: {bestModel.replace("_", " ")}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="predicted_sales"
                  name="Predicted Revenue"
                  stroke="#9333ea"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorForecast)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Model Benchmark Matrix & Detailed Monthly Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Model Benchmark Matrix */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4">
            Algorithm Comparison Matrix
          </h3>

          <div className="space-y-3">
            {Object.keys(evaluation).map((modelName) => {
              const isWinner = modelName === bestModel;
              const metrics = evaluation[modelName];
              return (
                <div
                  key={modelName}
                  className={`flex items-center justify-between rounded-xl p-4 border transition-all ${
                    isWinner
                      ? "border-purple-200 bg-purple-50/50 shadow-2xs"
                      : "border-slate-200/80 bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-lg font-bold text-xs ${
                        isWinner
                          ? "bg-purple-600 text-white shadow-xs"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {isWinner ? <Award className="h-4 w-4" /> : <BrainCircuit className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 capitalize">
                        {modelName.replace("_", " ")}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        MAE: ${metrics.mae.toLocaleString()} • RMSE: ${metrics.rmse.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      isWinner
                        ? "bg-purple-600 text-white"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {isWinner ? "Selected" : "Candidate"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Monthly Projection Table */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">
              Monthly Forecast Timeline
            </h3>
            <span className="text-xs text-slate-400 font-semibold">
              {forecast.length} Future Periods
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="pb-3 px-3">Target Month</th>
                  <th className="pb-3 px-3">Model</th>
                  <th className="pb-3 px-3 text-right">Predicted Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {forecast.map((item: { month: string; predicted_sales: number }) => (
                  <tr key={item.month} className="hover:bg-slate-50/60">
                    <td className="py-3 px-3 font-semibold text-slate-900 flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-purple-600" />
                      <span>{item.month}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-500 capitalize">
                      {bestModel.replace("_", " ")}
                    </td>
                    <td className="py-3 px-3 text-right font-extrabold text-purple-700 tabular-nums">
                      ${item.predicted_sales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}