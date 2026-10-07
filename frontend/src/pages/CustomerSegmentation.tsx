import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Award,
  AlertTriangle,
  TrendingUp,
  Search,
  Download,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  DollarSign,
  Layers,
  ArrowUpRight,
  Filter,
  BarChart3,
  PieChart as PieIcon,
  Crown,
  HeartHandshake,
  UserX,
  Target,
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
  PieChart,
  Pie,
} from "recharts";

import { getCustomerSegmentation } from "../api/ml";
import { mockCustomerSegmentation } from "../data/mockAnalytics";
import { CustomerRFMItem, CustomerSegment } from "../types/analytics";

interface CustomerSegmentationProps {
  onShowToast?: (message: string, type?: "success" | "error" | "info") => void;
}

const SEGMENT_COLORS: Record<string, string> = {
  "High Value": "#10b981", // Emerald
  Loyal: "#3b82f6", // Blue
  Regular: "#6366f1", // Indigo
  "At Risk": "#f43f5e", // Rose
};

const SEGMENT_ICONS: Record<string, typeof Crown> = {
  "High Value": Crown,
  Loyal: HeartHandshake,
  Regular: Users,
  "At Risk": UserX,
};

export default function CustomerSegmentation({ onShowToast }: CustomerSegmentationProps) {
  const [clusterCount, setClusterCount] = useState<number>(4);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"monetary" | "recency" | "frequency">("monetary");

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["customer-segmentation", clusterCount],
    queryFn: () => getCustomerSegmentation(clusterCount),
    retry: 1,
  });

  const activeData = data || mockCustomerSegmentation;
  const totalCustomers = activeData.total_customers || 773;
  const silhouetteScore = activeData.silhouette_score ?? 0.3802;
  const summary: CustomerSegment[] = activeData.summary || [];
  const customers: CustomerRFMItem[] = activeData.customers || [];

  // Filtered and sorted customers
  const filteredCustomers = useMemo(() => {
    return customers
      .filter((c) => {
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !q ||
          c.customer_id.toLowerCase().includes(q) ||
          (c.customer_name && c.customer_name.toLowerCase().includes(q)) ||
          (c.segment && c.segment.toLowerCase().includes(q));

        if (!matchesQuery) return false;

        if (activeFilter !== "All") {
          return c.segment === activeFilter;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "monetary") return b.monetary - a.monetary;
        if (sortBy === "frequency") return b.frequency - a.frequency;
        if (sortBy === "recency") return a.recency - b.recency; // lower recency = more recent
        return 0;
      });
  }, [customers, searchQuery, activeFilter, sortBy]);

  // Aggregate totals
  const totalRevenue = useMemo(() => {
    return summary.reduce((acc, curr) => acc + curr.total_revenue, 0);
  }, [summary]);

  const handleExportCSV = () => {
    if (!filteredCustomers.length) return;

    const headers = [
      "Customer ID",
      "Customer Name",
      "Segment",
      "Cluster",
      "Recency (Days)",
      "Frequency (Orders)",
      "Monetary ($)",
    ];

    const rows = filteredCustomers.map((c) => [
      `"${c.customer_id}"`,
      `"${c.customer_name || ""}"`,
      `"${c.segment}"`,
      c.cluster,
      c.recency,
      c.frequency,
      c.monetary.toFixed(2),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `customer_segments_${clusterCount}_clusters_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onShowToast?.(`Exported ${filteredCustomers.length} customer records to CSV`, "success");
  };

  const getSilhouetteQuality = (score: number) => {
    if (score >= 0.5) return { label: "Strong Structure", color: "text-emerald-400" };
    if (score >= 0.35) return { label: "Good Separation", color: "text-blue-400" };
    if (score >= 0.25) return { label: "Moderate Clusters", color: "text-amber-400" };
    return { label: "Weak Separation", color: "text-rose-400" };
  };

  const quality = getSilhouetteQuality(silhouetteScore);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Hero Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl shadow-slate-900/10 border border-slate-800">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-10 h-48 w-48 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
                <Target className="h-3.5 w-3.5 text-emerald-400" />
                K-Means RFM Segmentation
              </span>
              {isError ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-medium text-amber-300 border border-amber-500/30">
                  <AlertTriangle className="h-3 w-3" /> Offline Mock Data
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 px-2.5 py-0.5 text-xs font-medium text-blue-300 border border-blue-500/30">
                  <CheckCircle2 className="h-3 w-3" /> Active ML Service
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Customer RFM Segmentation & Cohorts
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Unsupervised K-Means clustering classifies customer purchasing behaviors across{" "}
              <strong>Recency</strong> (days since last purchase), <strong>Frequency</strong> (total
              orders placed), and <strong>Monetary</strong> (gross lifetime spend).
            </p>
          </div>

          {/* Model Controls */}
          <div className="flex flex-col gap-3 rounded-xl bg-white/5 p-4 border border-white/10 backdrop-blur-md shrink-0">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5 font-medium">
                <span className="flex items-center gap-1">
                  <Layers className="h-3.5 w-3.5 text-indigo-400" />
                  Cluster Count (K):
                </span>
                <span className="font-bold text-white">{clusterCount} Clusters</span>
              </div>
              <div className="flex items-center gap-1.5">
                {[3, 4, 5, 6].map((k) => (
                  <button
                    key={k}
                    onClick={() => {
                      setClusterCount(k);
                      onShowToast?.(`Re-clustering customers into ${k} cohorts`, "info");
                    }}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                      clusterCount === k
                        ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/40"
                        : "bg-white/10 text-slate-300 hover:bg-white/15"
                    }`}
                  >
                    K = {k}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
              <span>Silhouette Score:</span>
              <span className={`font-mono font-bold ${quality.color}`}>
                {silhouetteScore.toFixed(4)} ({quality.label})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Segment Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {summary.map((seg) => {
          const segName = seg.segment || `Cluster ${seg.cluster}`;
          const Icon = SEGMENT_ICONS[segName] || Users;
          const color = SEGMENT_COLORS[segName] || "#6366f1";
          const revPercent =
            totalRevenue > 0 ? ((seg.total_revenue / totalRevenue) * 100).toFixed(1) : "0";

          return (
            <div
              key={seg.cluster}
              className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-extrabold"
                    style={{
                      backgroundColor: `${color}15`,
                      color: color,
                      border: `1px solid ${color}30`,
                    }}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {segName}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400">Cluster {seg.cluster}</span>
                </div>

                <div className="mt-4">
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                      {seg.customers}
                    </h3>
                    <span className="text-xs font-semibold text-slate-500">
                      customers ({((seg.customers / totalCustomers) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Revenue:{" "}
                    <strong className="text-slate-900 font-bold">
                      ${(seg.total_revenue / 1000).toFixed(1)}k
                    </strong>{" "}
                    ({revPercent}% of total)
                  </p>
                </div>
              </div>

              {/* RFM Mini Metrics */}
              <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-lg bg-slate-50 p-2">
                  <span className="text-[10px] text-slate-400 block font-medium">Recency</span>
                  <span className="font-bold text-slate-700">{seg.avg_recency.toFixed(0)}d</span>
                </div>
                <div className="rounded-lg bg-slate-50 p-2">
                  <span className="text-[10px] text-slate-400 block font-medium">Freq</span>
                  <span className="font-bold text-slate-700">{seg.avg_frequency.toFixed(1)}x</span>
                </div>
                <div className="rounded-lg bg-slate-50 p-2">
                  <span className="text-[10px] text-slate-400 block font-medium">Spend</span>
                  <span className="font-bold text-slate-700">
                    ${(seg.avg_monetary / 1000).toFixed(1)}k
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Analytics & Strategic Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Contribution by Segment */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PieIcon className="h-5 w-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm">Revenue Share by Cohort</h3>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={summary}
                  dataKey="total_revenue"
                  nameKey="segment"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={50}
                  paddingAngle={4}
                >
                  {summary.map((entry, index) => (
                    <Cell
                      key={`pie-cell-${index}`}
                      fill={SEGMENT_COLORS[entry.segment || ""] || "#6366f1"}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: unknown) => [
                    `$${Number(val || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
                    "Revenue",
                  ]}
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 text-xs">
            {summary.map((seg) => (
              <div key={seg.cluster} className="flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: SEGMENT_COLORS[seg.segment || ""] || "#6366f1" }}
                />
                <span className="text-slate-600 truncate">{seg.segment || `Cluster ${seg.cluster}`}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Average Frequency & Recency Comparison */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm">Avg Orders (Frequency)</h3>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="segment"
                  tickLine={false}
                  axisLine={{ stroke: "#cbd5e1" }}
                  tick={{ fill: "#64748b", fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 11 }}
                />
                <Tooltip
                  formatter={(val: unknown) => [`${Number(val || 0).toFixed(1)} orders`, "Frequency"]}
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="avg_frequency" radius={[8, 8, 0, 0]}>
                  {summary.map((entry, index) => (
                    <Cell
                      key={`bar-cell-${index}`}
                      fill={SEGMENT_COLORS[entry.segment || ""] || "#6366f1"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 text-center">
            Higher frequency signals strong brand retention and repeat order cadence.
          </div>
        </div>

        {/* Marketing Recommendations Playbook */}
        <div className="rounded-2xl border border-slate-200/90 bg-linear-to-b from-slate-50 to-white p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-3.5">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
              <Sparkles className="h-4 w-4" />
              <span>Targeted Action Playbook</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="rounded-xl bg-white p-3 border border-slate-200/80 shadow-2xs">
                <span className="font-bold text-emerald-600 flex items-center gap-1 mb-0.5">
                  <Crown className="h-3.5 w-3.5" /> High Value (Champions)
                </span>
                <p className="text-slate-600">
                  Provide VIP accounts, dedicated enterprise reps, and early access to new lines.
                </p>
              </div>

              <div className="rounded-xl bg-white p-3 border border-slate-200/80 shadow-2xs">
                <span className="font-bold text-blue-600 flex items-center gap-1 mb-0.5">
                  <HeartHandshake className="h-3.5 w-3.5" /> Loyal Customers
                </span>
                <p className="text-slate-600">
                  Upsell cross-category technology packages and loyalty reward incentives.
                </p>
              </div>

              <div className="rounded-xl bg-white p-3 border border-slate-200/80 shadow-2xs">
                <span className="font-bold text-rose-600 flex items-center gap-1 mb-0.5">
                  <UserX className="h-3.5 w-3.5" /> At Risk Customers
                </span>
                <p className="text-slate-600">
                  Trigger automated win-back discount promotions to prevent customer churn.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Algorithm: K-Means (RFM)</span>
            <span className="font-semibold text-slate-600">Sklearn Cluster</span>
          </div>
        </div>
      </div>

      {/* Customer Registry Table */}
      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
        {/* Controls Bar */}
        <div className="border-b border-slate-200/80 p-5 bg-slate-50/50">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by customer name, ID, or cohort..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
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

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Sort selector */}
              <div className="flex items-center gap-1 text-xs text-slate-600 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-2xs">
                <span className="text-slate-400">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="bg-transparent font-semibold outline-none cursor-pointer"
                >
                  <option value="monetary">Highest Spend ($)</option>
                  <option value="frequency">Most Frequent</option>
                  <option value="recency">Most Recent</option>
                </select>
              </div>

              <button
                onClick={() => {
                  refetch();
                  onShowToast?.("Re-clustered customer dataset", "success");
                }}
                disabled={isLoading || isFetching}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${isFetching ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors shadow-xs shadow-indigo-500/20 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export CSV ({filteredCustomers.length})</span>
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1">
              <Filter className="h-3 w-3" /> Filter Cohort:
            </span>
            {["All", ...summary.map((s) => s.segment || `Cluster ${s.cluster}`)].map((seg) => (
              <button
                key={seg}
                onClick={() => setActiveFilter(seg)}
                className={`rounded-lg px-3 py-1 font-semibold transition-colors shrink-0 ${
                  activeFilter === seg
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {seg}
              </button>
            ))}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Assigned Cohort</th>
                <th className="px-5 py-3.5 text-center">Cluster</th>
                <th className="px-5 py-3.5 text-right">Recency</th>
                <th className="px-5 py-3.5 text-center">Frequency</th>
                <th className="px-5 py-3.5 text-right">Lifetime Spend</th>
                <th className="px-5 py-3.5 text-right">Avg Order Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.slice(0, 100).map((c, idx) => {
                  const color = SEGMENT_COLORS[c.segment] || "#6366f1";
                  const aov = c.frequency > 0 ? c.monetary / c.frequency : c.monetary;

                  return (
                    <tr
                      key={`${c.customer_id}-${idx}`}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900">
                          {c.customer_name || "Enterprise Customer"}
                        </div>
                        <div className="font-mono text-[11px] text-slate-400">{c.customer_id}</div>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span
                          className="inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-[11px] font-bold"
                          style={{
                            backgroundColor: `${color}15`,
                            color: color,
                            border: `1px solid ${color}30`,
                          }}
                        >
                          {c.segment}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center font-bold text-slate-600">
                        {c.cluster}
                      </td>
                      <td className="px-5 py-3.5 text-right font-medium text-slate-700 whitespace-nowrap">
                        {c.recency} days ago
                      </td>
                      <td className="px-5 py-3.5 text-center whitespace-nowrap">
                        <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 font-bold text-slate-700 text-xs">
                          {c.frequency} orders
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-bold text-slate-900 whitespace-nowrap">
                        ${c.monetary.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-5 py-3.5 text-right text-slate-600 whitespace-nowrap">
                        ${aov.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="h-8 w-8 text-slate-300" />
                      <p className="font-semibold text-slate-600">No customers match your search</p>
                      <p className="text-xs text-slate-400">Try changing the cohort filter or resetting your search query.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200/80 px-5 py-3 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>
            Showing <strong>{Math.min(100, filteredCustomers.length)}</strong> of{" "}
            <strong>{filteredCustomers.length}</strong> matching customers
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <Award className="h-3.5 w-3.5 text-slate-400" />
            SuperStore RFM Cohort Segmentation
          </span>
        </div>
      </div>
    </div>
  );
}
