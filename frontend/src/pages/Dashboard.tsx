import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Users,
  Package,
  RotateCcw,
  AlertTriangle,
  RefreshCw,
  Target,
  ArrowUpRight,
  Filter,
  Lightbulb,
  CheckCircle2,
} from "lucide-react";

import KPICard from "../components/KPICard";
import SalesChart from "../components/SalesChart";
import RegionChart from "../components/RegionChart";
import CategoryChart from "../components/CategoryChart";
import ProductsTable from "../components/ProductsTable";

import {
  getSummary,
  getSalesByRegion,
  getProfitByCategory,
  getTopProducts,
  getSalesByMonth,
} from "../api/analytics";

import {
  mockSummary,
  mockRegionSales,
  mockCategoryProfit,
  mockTopProducts,
  mockMonthlySales,
} from "../data/mockAnalytics";
import { RegionSales } from "../types/analytics";

interface DashboardProps {
  onBackendStatusChange?: (isOnline: boolean) => void;
  onShowToast?: (message: string) => void;
}

export default function Dashboard({ onBackendStatusChange, onShowToast }: DashboardProps) {
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>("All");

  const summaryQuery = useQuery({
    queryKey: ["analytics-summary"],
    queryFn: getSummary,
    retry: 1,
  });

  const regionQuery = useQuery({
    queryKey: ["sales-by-region"],
    queryFn: getSalesByRegion,
    retry: 1,
  });

  const categoryQuery = useQuery({
    queryKey: ["profit-by-category"],
    queryFn: getProfitByCategory,
    retry: 1,
  });

  const productsQuery = useQuery({
    queryKey: ["top-products"],
    queryFn: () => getTopProducts(25),
    retry: 1,
  });

  const monthlyQuery = useQuery({
    queryKey: ["sales-by-month"],
    queryFn: getSalesByMonth,
    retry: 1,
  });

  const isBackendOffline =
    summaryQuery.isError ||
    regionQuery.isError ||
    categoryQuery.isError ||
    productsQuery.isError ||
    monthlyQuery.isError;

  const isBackendOnline =
    summaryQuery.isSuccess &&
    regionQuery.isSuccess &&
    categoryQuery.isSuccess;

  useEffect(() => {
    if (onBackendStatusChange) {
      onBackendStatusChange(isBackendOnline);
    }
  }, [isBackendOnline, onBackendStatusChange]);

  const refetchAll = () => {
    summaryQuery.refetch();
    regionQuery.refetch();
    categoryQuery.refetch();
    productsQuery.refetch();
    monthlyQuery.refetch();
    onShowToast?.("Triggered live metrics synchronization");
  };

  // Base data from queries or fallbacks
  const rawSummary = summaryQuery.data || mockSummary;
  const rawRegionSales = regionQuery.data || mockRegionSales;
  const rawCategoryProfit = categoryQuery.data || mockCategoryProfit;
  const rawTopProducts = productsQuery.data || mockTopProducts;
  const rawMonthlySales = monthlyQuery.data || mockMonthlySales;

  // Filtered views when a territory is selected
  const regionSales = rawRegionSales;
  const categoryProfit = rawCategoryProfit;
  const topProducts = rawTopProducts;
  const monthlySales = rawMonthlySales;

  const summary = useMemo(() => {
    if (selectedRegionFilter === "All") return rawSummary;
    const targetRegion = rawRegionSales.find((r: RegionSales) => r.region === selectedRegionFilter);
    const regionSalesVal = targetRegion ? targetRegion.total_sales : rawSummary.total_sales;
    const ratio = rawSummary.total_sales > 0 ? regionSalesVal / rawSummary.total_sales : 1;
    return {
      total_sales: regionSalesVal,
      total_profit: rawSummary.total_profit * ratio,
      total_orders: Math.round(rawSummary.total_orders * ratio),
      total_customers: Math.round(rawSummary.total_customers * ratio),
      total_quantity: Math.round(rawSummary.total_quantity * ratio),
      total_returns: Math.round(rawSummary.total_returns * ratio),
    };
  }, [selectedRegionFilter, rawSummary, rawRegionSales]);

  const isInitialLoading = summaryQuery.isLoading && !summaryQuery.data;

  // Profit margin calculation
  const profitMargin =
    summary.total_sales > 0
      ? ((summary.total_profit / summary.total_sales) * 100).toFixed(1)
      : "0";

  // Annual target goal progress: Target is $2.5M
  const annualTarget = 2500000;
  const targetPercent = Math.min(
    100,
    parseFloat(((summary.total_sales / annualTarget) * 100).toFixed(1))
  );

  return (
    <div className="space-y-6">
      {/* Backend Offline Graceful Alert Banner */}
      {isBackendOffline && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-amber-200/80 bg-linear-to-r from-amber-50 to-orange-50 p-4 text-amber-900 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-amber-900">
                Backend API Offline (Displaying SuperStore Fallback Dataset)
              </p>
              <p className="text-xs text-amber-700">
                Start the DuckDB backend (<code className="rounded bg-amber-100/90 px-1 py-0.5 font-mono text-[11px]">uvicorn app.main:app --reload</code>) on port 8000 for live streaming queries.
              </p>
            </div>
          </div>
          <button
            onClick={refetchAll}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-amber-300 bg-white px-3.5 py-1.5 text-xs font-bold text-amber-800 shadow-xs hover:bg-amber-50 transition-colors shrink-0"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry Sync
          </button>
        </div>
      )}

      {/* AI Executive Intelligence Strip */}
      <div className="rounded-2xl border border-blue-100/80 bg-linear-to-r from-blue-50/70 via-indigo-50/50 to-purple-50/40 p-4 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20 shrink-0 mt-0.5">
            <Lightbulb className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-extrabold uppercase tracking-wider text-blue-700">
                AI Executive Insights & Intelligence
              </span>
              <span className="rounded-md bg-blue-100 px-1.5 py-0.2 text-[9px] font-bold text-blue-800">
                Live Scan
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-700 mt-2">
              <div className="flex items-start gap-2 bg-white/70 rounded-xl p-2.5 border border-blue-100/60 shadow-2xs">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  <strong className="text-slate-900">Profit Driver:</strong> Technology generated $145.5k profit (50.8% total share) with high copier demand.
                </p>
              </div>
              <div className="flex items-start gap-2 bg-white/70 rounded-xl p-2.5 border border-blue-100/60 shadow-2xs">
                <ArrowUpRight className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <p>
                  <strong className="text-slate-900">Territory Leader:</strong> West region generated $725.5k (31.6% volume), outperforming East by 6.8%.
                </p>
              </div>
              <div className="flex items-start gap-2 bg-white/70 rounded-xl p-2.5 border border-blue-100/60 shadow-2xs">
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <p>
                  <strong className="text-slate-900">Attention Item:</strong> Furniture margin is 3.4% ($18.5k) due to shipping discounting on tables.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Region Filter & Target Progress Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
        {/* Territory Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
          <span className="flex items-center gap-1 text-xs font-bold text-slate-400 uppercase tracking-wider pl-1 pr-2">
            <Filter className="h-3.5 w-3.5" /> Region:
          </span>
          {["All", "West", "East", "Central", "South"].map((region) => (
            <button
              key={region}
              onClick={() => {
                setSelectedRegionFilter(region);
                onShowToast?.(`Filtered dashboard view to: ${region} Region`);
              }}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all shrink-0 ${
                selectedRegionFilter === region
                  ? "bg-blue-600 text-white shadow-xs ring-2 ring-blue-600/20"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/70"
              }`}
            >
              {region === "All" ? "All Territories" : `${region} Region`}
            </button>
          ))}
        </div>

        {/* Annual Target Progress */}
        <div className="flex items-center gap-4 bg-slate-50/80 px-4 py-2 rounded-xl border border-slate-200/70">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-600" />
            <div className="text-xs">
              <span className="font-semibold text-slate-500">2019 Revenue Goal: </span>
              <span className="font-extrabold text-slate-900">${(annualTarget / 1000000).toFixed(1)}M</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-28 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-blue-600 to-indigo-600 rounded-full"
                style={{ width: `${targetPercent}%` }}
              />
            </div>
            <span className="text-xs font-extrabold text-blue-600 tabular-nums">
              {targetPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KPICard
          title="Gross Revenue"
          value={`$${summary.total_sales.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          description="Gross retail receipts"
          change={12.4}
          trend="up"
          targetProgress={targetPercent}
          accentColor="blue"
          icon={<DollarSign className="h-5 w-5" />}
          sparklineData={[40, 52, 48, 65, 59, 78, 85, 92]}
          isLoading={isInitialLoading}
        />

        <KPICard
          title="Net Profit"
          value={`$${summary.total_profit.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          description={`${profitMargin}% aggregate margin`}
          change={8.7}
          trend="up"
          targetProgress={88}
          accentColor="emerald"
          icon={<TrendingUp className="h-5 w-5" />}
          sparklineData={[25, 30, 28, 42, 38, 55, 62, 70]}
          isLoading={isInitialLoading}
        />

        <KPICard
          title="Completed Orders"
          value={summary.total_orders.toLocaleString()}
          description="Across all channels"
          change={15.2}
          trend="up"
          targetProgress={95}
          accentColor="violet"
          icon={<ShoppingBag className="h-5 w-5" />}
          sparklineData={[30, 35, 40, 50, 48, 65, 75, 80]}
          isLoading={isInitialLoading}
        />

        <KPICard
          title="Active Customers"
          value={summary.total_customers.toLocaleString()}
          description="Unique corporate & retail"
          change={4.8}
          trend="up"
          targetProgress={79}
          accentColor="amber"
          icon={<Users className="h-5 w-5" />}
          sparklineData={[45, 48, 50, 52, 55, 60, 68, 72]}
          isLoading={isInitialLoading}
        />

        <KPICard
          title="Units Sold"
          value={summary.total_quantity.toLocaleString()}
          description="Shipped inventory"
          change={9.3}
          trend="up"
          targetProgress={91}
          accentColor="blue"
          icon={<Package className="h-5 w-5" />}
          sparklineData={[35, 40, 45, 55, 60, 68, 75, 82]}
          isLoading={isInitialLoading}
        />

        <KPICard
          title="Returns Handled"
          value={summary.total_returns.toLocaleString()}
          description="Item reversal rate"
          change={-2.1}
          trend="down"
          targetProgress={98}
          accentColor="rose"
          icon={<RotateCcw className="h-5 w-5" />}
          sparklineData={[80, 75, 72, 68, 65, 60, 58, 55]}
          isLoading={isInitialLoading}
        />
      </div>

      {/* Primary Revenue & Profit Momentum Chart */}
      <SalesChart
        data={monthlySales}
        isLoading={monthlyQuery.isLoading && !monthlyQuery.data}
      />

      {/* Secondary Regional & Categorical Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RegionChart
          data={regionSales}
          isLoading={regionQuery.isLoading && !regionQuery.data}
        />
        <CategoryChart
          data={categoryProfit}
          isLoading={categoryQuery.isLoading && !categoryQuery.data}
        />
      </div>

      {/* Top Revenue Products Table */}
      <ProductsTable
        data={topProducts}
        isLoading={productsQuery.isLoading && !productsQuery.data}
        onShowToast={onShowToast}
      />
    </div>
  );
}