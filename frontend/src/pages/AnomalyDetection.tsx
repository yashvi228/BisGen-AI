import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ShieldAlert,
  AlertTriangle,
  TrendingDown,
  Search,
  Download,
  RefreshCw,
  SlidersHorizontal,
  Sparkles,
  BarChart3,
  CheckCircle2,
  DollarSign,
  Package,
  Layers,
  ArrowUpRight,
  Filter,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";

import { getAnomalies } from "../api/ml";
import { mockAnomalies } from "../data/mockAnalytics";
import { AnomalyItem } from "../types/analytics";

interface AnomalyDetectionProps {
  onShowToast?: (message: string, type?: "success" | "error" | "info") => void;
}

export default function AnomalyDetection({ onShowToast }: AnomalyDetectionProps) {
  const [contamination, setContamination] = useState<number>(0.01);
  const [limit, setLimit] = useState<number>(50);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<
    "all" | "negative_profit" | "high_sales" | "tech" | "supplies" | "furniture"
  >("all");

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["ml-anomalies", contamination, limit],
    queryFn: () => getAnomalies(contamination, limit),
    retry: 1,
  });

  const activeData = data || mockAnomalies;
  const anomalies: AnomalyItem[] = activeData.anomalies || [];
  const totalTransactions = activeData.total_transactions || 5901;
  const totalAnomaliesCount = activeData.total_anomalies || anomalies.length;
  const anomalyRate = activeData.anomaly_rate
    ? (activeData.anomaly_rate * 100).toFixed(2)
    : "1.00";

  // Filtered anomalies based on search query and quick filters
  const filteredAnomalies = useMemo(() => {
    return anomalies.filter((item) => {
      // Search matching
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.order_id.toLowerCase().includes(q) ||
        item.product_name.toLowerCase().includes(q) ||
        (item.customer_name && item.customer_name.toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q)) ||
        (item.region && item.region.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      // Quick filter
      if (activeFilter === "negative_profit") return item.profit < 0;
      if (activeFilter === "high_sales") return item.sales >= 3000;
      if (activeFilter === "tech")
        return item.category?.toLowerCase() === "technology";
      if (activeFilter === "supplies")
        return item.category?.toLowerCase() === "office supplies";
      if (activeFilter === "furniture")
        return item.category?.toLowerCase() === "furniture";

      return true;
    });
  }, [anomalies, searchQuery, activeFilter]);

  // Aggregated KPI numbers
  const { totalLoss, totalAnomalySales, lossCount } = useMemo(() => {
    let loss = 0;
    let sales = 0;
    let losses = 0;

    anomalies.forEach((item) => {
      sales += item.sales;
      if (item.profit < 0) {
        loss += Math.abs(item.profit);
        losses += 1;
      }
    });

    return {
      totalLoss: loss,
      totalAnomalySales: sales,
      lossCount: losses,
    };
  }, [anomalies]);

  // Category breakdown for distribution chart
  const categoryStats = useMemo(() => {
    const counts: Record<string, { count: number; loss: number; sales: number }> = {
      Technology: { count: 0, loss: 0, sales: 0 },
      "Office Supplies": { count: 0, loss: 0, sales: 0 },
      Furniture: { count: 0, loss: 0, sales: 0 },
    };

    anomalies.forEach((item) => {
      const cat = item.category || "Technology";
      if (!counts[cat]) {
        counts[cat] = { count: 0, loss: 0, sales: 0 };
      }
      counts[cat].count += 1;
      counts[cat].sales += item.sales;
      if (item.profit < 0) {
        counts[cat].loss += Math.abs(item.profit);
      }
    });

    return Object.entries(counts).map(([name, data]) => ({
      category: name,
      count: data.count,
      loss: Math.round(data.loss),
      sales: Math.round(data.sales),
    }));
  }, [anomalies]);

  const handleExportCSV = () => {
    if (!filteredAnomalies.length) return;

    const headers = [
      "Order ID",
      "Customer",
      "Product Name",
      "Category",
      "Sub-Category",
      "Region",
      "Sales ($)",
      "Quantity",
      "Profit ($)",
      "Anomaly Score",
    ];

    const rows = filteredAnomalies.map((item) => [
      `"${item.order_id}"`,
      `"${item.customer_name || ""}"`,
      `"${item.product_name.replace(/"/g, '""')}"`,
      `"${item.category || ""}"`,
      `"${item.sub_category || ""}"`,
      `"${item.region || ""}"`,
      item.sales.toFixed(2),
      item.quantity,
      item.profit.toFixed(2),
      item.anomaly_score.toFixed(4),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `anomalies_contamination_${contamination}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onShowToast?.(`Exported ${filteredAnomalies.length} anomaly records to CSV`, "success");
  };

  const getSeverityBadge = (score: number) => {
    if (score <= -0.09) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 border border-rose-200">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-600 animate-pulse" />
          Critical Outlier
        </span>
      );
    }
    if (score <= -0.07) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          High Variance
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
        Moderate Outlier
      </span>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Banner / Hero Card */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl shadow-slate-900/10 border border-slate-800">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 h-48 w-48 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/20 px-3 py-1 text-xs font-semibold text-rose-300 border border-rose-500/30 backdrop-blur-md">
                <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
                Scikit-Learn Isolation Forest
              </span>
              {isError ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-medium text-amber-300 border border-amber-500/30">
                  <AlertTriangle className="h-3 w-3" /> Offline Mock Data
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-medium text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 className="h-3 w-3" /> Live ML Engine
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Transaction Anomaly & Fraud Risk Detection
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Unsupervised tree-based partitioning isolates statistical outliers across multi-dimensional
              feature spaces (Sales, Quantity, Profit, Margin). Flags high-risk loss leaders, unauthorized bulk transactions,
              and pricing discrepancies.
            </p>
          </div>

          {/* Sensitivity & Limit Controls */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 rounded-xl bg-white/5 p-4 border border-white/10 backdrop-blur-md shrink-0">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5 font-medium">
                <span className="flex items-center gap-1">
                  <SlidersHorizontal className="h-3.5 w-3.5 text-blue-400" />
                  Model Contamination:
                </span>
                <span className="font-bold text-white">{(contamination * 100).toFixed(1)}%</span>
              </div>
              <div className="flex items-center gap-1.5">
                {[
                  { label: "0.5% (Strict)", val: 0.005 },
                  { label: "1.0% (Balanced)", val: 0.01 },
                  { label: "2.0% (Broad)", val: 0.02 },
                ].map((item) => (
                  <button
                    key={item.val}
                    onClick={() => {
                      setContamination(item.val);
                      onShowToast?.(`Updated model contamination to ${(item.val * 100).toFixed(1)}%`, "info");
                    }}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                      contamination === item.val
                        ? "bg-rose-500 text-white shadow-sm shadow-rose-500/40"
                        : "bg-white/10 text-slate-300 hover:bg-white/15"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <span className="text-xs text-slate-300 font-medium">Display Limit:</span>
              <div className="flex items-center gap-1">
                {[10, 25, 50].map((l) => (
                  <button
                    key={l}
                    onClick={() => setLimit(l)}
                    className={`h-7 w-8 rounded text-xs font-semibold transition-colors ${
                      limit === l
                        ? "bg-blue-600 text-white"
                        : "bg-white/10 text-slate-300 hover:bg-white/20"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Examined */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Evaluated Records
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Layers className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {totalTransactions.toLocaleString()}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Transactions parsed from SuperStore
            </p>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>100% full dataset coverage</span>
          </div>
        </div>

        {/* Flagged Outliers */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Flagged Anomalies
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <ShieldAlert className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-rose-600 tracking-tight">
              {totalAnomaliesCount}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Transactions with score &lt; threshold
            </p>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-rose-700 font-semibold">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Contamination rate: {anomalyRate}%</span>
          </div>
        </div>

        {/* Cumulative Loss Exposure */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Loss Risk Impact
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <TrendingDown className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-amber-600 tracking-tight">
              ${totalLoss.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Negative profit from {lossCount} severe loss items
            </p>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-700 font-semibold">
            <span>Severe pricing/discount erosion</span>
          </div>
        </div>

        {/* Total Anomaly Volume */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Anomaly Gross Value
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              ${totalAnomalySales.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Total transaction sales of outliers
            </p>
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs text-violet-700 font-semibold">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>High-capital purchase orders</span>
          </div>
        </div>
      </div>

      {/* Visual Analytics Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Anomaly Distribution */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Anomaly Breakdown by Product Sector
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Frequency and gross dollar volume of detected outliers across business categories
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryStats} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="category"
                  axisLine={{ stroke: "#cbd5e1" }}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-xl text-xs space-y-1.5">
                          <p className="font-bold text-slate-900 text-sm">{d.category}</p>
                          <div className="flex justify-between gap-4 text-slate-600">
                            <span>Detected Outliers:</span>
                            <span className="font-bold text-rose-600">{d.count} orders</span>
                          </div>
                          <div className="flex justify-between gap-4 text-slate-600">
                            <span>Total Gross Sales:</span>
                            <span className="font-bold text-indigo-600">${d.sales.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between gap-4 text-slate-600">
                            <span>Total Negative Losses:</span>
                            <span className="font-bold text-amber-600">-${d.loss.toLocaleString()}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="sales" name="Gross Outlier Sales ($)" radius={[8, 8, 0, 0]}>
                  {categoryStats.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.category === "Technology"
                          ? "#6366f1"
                          : entry.category === "Office Supplies"
                          ? "#3b82f6"
                          : "#f43f5e"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Explainability / Diagnostic Box */}
        <div className="rounded-2xl border border-slate-200/90 bg-linear-to-b from-slate-50 to-white p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
              <Sparkles className="h-4 w-4" />
              <span>Model Insights & RCA</span>
            </div>

            <h4 className="text-base font-bold text-slate-900">
              Why Were These Flagged?
            </h4>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="rounded-xl bg-white p-3 border border-slate-200/80 shadow-2xs">
                <span className="font-bold text-rose-600 block mb-1">
                  1. Deep Discount & Negative Margin Outliers
                </span>
                Machines like the <em>Cubify CubeX 3D Printer</em> experienced extreme promotional discounts,
                generating up to <strong>-$6,599</strong> single-transaction losses despite massive gross sales.
              </div>

              <div className="rounded-xl bg-white p-3 border border-slate-200/80 shadow-2xs">
                <span className="font-bold text-blue-600 block mb-1">
                  2. Extreme Volume Clusters
                </span>
                Orders with quantity ≥ 13 on enterprise copiers or binding units diverge sharply from the
                median quantity of 3-4 items, scoring high anomaly indices.
              </div>

              <div className="rounded-xl bg-white p-3 border border-slate-200/80 shadow-2xs">
                <span className="font-bold text-emerald-600 block mb-1">
                  3. Unsupervised Isolation Scoring
                </span>
                Isolation Forest builds random decision trees. Rare data points require far fewer splits
                to isolate, generating negative anomaly scores below the benchmark threshold.
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 mt-4 flex items-center justify-between text-xs text-slate-500">
            <span>Algorithm: IsolationForest</span>
            <span className="font-semibold text-slate-700">Sklearn v1.4+</span>
          </div>
        </div>
      </div>

      {/* Interactive Table Section */}
      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
        {/* Table Controls Header */}
        <div className="border-b border-slate-200/80 p-5 bg-slate-50/50">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by order ID, product, customer, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  refetch();
                  onShowToast?.("Re-computed Isolation Forest anomalies", "success");
                }}
                disabled={isLoading || isFetching}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${isFetching ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-xs shadow-blue-500/20 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export CSV ({filteredAnomalies.length})</span>
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1">
              <Filter className="h-3 w-3" /> Quick Filter:
            </span>
            {[
              { id: "all", label: "All Anomalies" },
              { id: "negative_profit", label: "Loss Leaders (Profit < 0)" },
              { id: "high_sales", label: "High Ticket (Sales ≥ $3,000)" },
              { id: "tech", label: "Technology" },
              { id: "supplies", label: "Office Supplies" },
              { id: "furniture", label: "Furniture" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id as typeof activeFilter)}
                className={`rounded-lg px-3 py-1 font-semibold transition-colors shrink-0 ${
                  activeFilter === f.id
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Order & Territory</th>
                <th className="px-5 py-3.5">Product & Customer</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5 text-right">Sales</th>
                <th className="px-5 py-3.5 text-center">Qty</th>
                <th className="px-5 py-3.5 text-right">Profit</th>
                <th className="px-5 py-3.5 text-center">Anomaly Score</th>
                <th className="px-5 py-3.5 text-center">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAnomalies.length > 0 ? (
                filteredAnomalies.map((item, idx) => (
                  <tr
                    key={`${item.order_id}-${idx}`}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="px-5 py-3.5 font-medium">
                      <div className="font-bold text-slate-900">{item.order_id}</div>
                      {item.region && (
                        <span className="inline-block mt-0.5 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                          {item.region}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 max-w-xs">
                      <div className="font-semibold text-slate-800 truncate" title={item.product_name}>
                        {item.product_name}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Customer: <span className="font-medium text-slate-700">{item.customer_name || "Enterprise Client"}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="inline-block rounded-md bg-indigo-50/60 px-2 py-0.5 text-[11px] font-medium text-indigo-700 border border-indigo-100">
                        {item.category || "General"}
                      </span>
                      {item.sub_category && (
                        <span className="block text-[10px] text-slate-400 mt-0.5">
                          {item.sub_category}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-slate-900 whitespace-nowrap">
                      ${item.sales.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-3.5 text-center whitespace-nowrap">
                      <span className="inline-flex items-center justify-center rounded-md bg-slate-100 px-2 py-0.5 font-bold text-slate-700 text-xs">
                        {item.quantity}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <span
                        className={`inline-block font-black px-2 py-0.5 rounded ${
                          item.profit < 0
                            ? "bg-rose-50 text-rose-600 border border-rose-200"
                            : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                        }`}
                      >
                        {item.profit < 0 ? "-" : "+"}$
                        {Math.abs(item.profit).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center font-mono text-[11px] font-bold text-slate-600 whitespace-nowrap">
                      {item.anomaly_score.toFixed(4)}
                    </td>
                    <td className="px-5 py-3.5 text-center whitespace-nowrap">
                      {getSeverityBadge(item.anomaly_score)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <ShieldAlert className="h-8 w-8 text-slate-300" />
                      <p className="font-semibold text-slate-600">No anomalies match your search filter</p>
                      <p className="text-xs text-slate-400">
                        Try resetting your query or adjusting the contamination sensitivity slider.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary Bar */}
        <div className="border-t border-slate-200/80 px-5 py-3 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>
            Showing <strong>{filteredAnomalies.length}</strong> of <strong>{anomalies.length}</strong> loaded outliers (Contamination: {(contamination * 100).toFixed(1)}%)
          </span>
          <span className="flex items-center gap-1.5">
            <Package className="h-3.5 w-3.5 text-slate-400" />
            SuperStore Transaction Registry
          </span>
        </div>
      </div>
    </div>
  );
}
