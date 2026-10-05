import { useEffect } from "react";
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
  Sparkles,
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

interface DashboardProps {
  onBackendStatusChange?: (isOnline: boolean) => void;
  onRefreshTrigger?: number;
}

export default function Dashboard({ onBackendStatusChange }: DashboardProps) {
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
    queryFn: () => getTopProducts(10),
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
  };

  // Gracefully use API data if available, otherwise fall back to mock data
  const summary = summaryQuery.data || mockSummary;
  const regionSales = regionQuery.data || mockRegionSales;
  const categoryProfit = categoryQuery.data || mockCategoryProfit;
  const topProducts = productsQuery.data || mockTopProducts;
  const monthlySales = monthlyQuery.data || mockMonthlySales;

  const isInitialLoading = summaryQuery.isLoading && !summaryQuery.data;

  // Calculate profit margin
  const profitMargin =
    summary.total_sales > 0
      ? ((summary.total_profit / summary.total_sales) * 100).toFixed(1)
      : "0";

  return (
    <div className="space-y-6">
      {/* Backend Offline Graceful Banner */}
      {isBackendOffline && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-amber-200/80 bg-linear-to-r from-amber-50 to-orange-50 p-4 text-amber-900 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-amber-900">
                Backend API Offline (Local Demo Mode)
              </p>
              <p className="text-xs text-amber-700">
                Displaying preloaded analytics for SuperStore dataset. Start the backend service (<code className="rounded bg-amber-100/80 px-1 py-0.5 font-mono text-[11px]">uvicorn app.main:app</code>) on port 8000 for live DuckDB queries.
              </p>
            </div>
          </div>
          <button
            onClick={refetchAll}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-800 shadow-xs hover:bg-amber-50 transition-colors shrink-0"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry Connection
          </button>
        </div>
      )}

      {/* Overview Quick Stats Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">
              Business Performance Summary
            </h2>
            <p className="text-xs text-gray-500">
              Global metrics across all retail channels and customer cohorts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="rounded-lg bg-gray-50 px-3 py-1.5 text-gray-600 border border-gray-100">
            Profit Margin: <span className="font-bold text-emerald-600">{profitMargin}%</span>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-1.5 text-gray-600 border border-gray-100">
            Returns: <span className="font-bold text-rose-600">{summary.total_returns.toLocaleString()} items</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KPICard
          title="Total Revenue"
          value={`$${summary.total_sales.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          description="Gross sales across orders"
          change={12.4}
          trend="up"
          accentColor="blue"
          icon={<DollarSign className="h-5 w-5" />}
          isLoading={isInitialLoading}
        />

        <KPICard
          title="Net Profit"
          value={`$${summary.total_profit.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          description={`${profitMargin}% overall margin`}
          change={8.7}
          trend="up"
          accentColor="emerald"
          icon={<TrendingUp className="h-5 w-5" />}
          isLoading={isInitialLoading}
        />

        <KPICard
          title="Total Orders"
          value={summary.total_orders.toLocaleString()}
          description="Completed purchases"
          change={15.2}
          trend="up"
          accentColor="violet"
          icon={<ShoppingBag className="h-5 w-5" />}
          isLoading={isInitialLoading}
        />

        <KPICard
          title="Active Customers"
          value={summary.total_customers.toLocaleString()}
          description="Unique corporate & retail"
          change={4.8}
          trend="up"
          accentColor="amber"
          icon={<Users className="h-5 w-5" />}
          isLoading={isInitialLoading}
        />

        <KPICard
          title="Units Sold"
          value={summary.total_quantity.toLocaleString()}
          description="Total items shipped"
          change={9.3}
          trend="up"
          accentColor="blue"
          icon={<Package className="h-5 w-5" />}
          isLoading={isInitialLoading}
        />

        <KPICard
          title="Returns Handled"
          value={summary.total_returns.toLocaleString()}
          description="Processed return items"
          change={-2.1}
          trend="down"
          accentColor="rose"
          icon={<RotateCcw className="h-5 w-5" />}
          isLoading={isInitialLoading}
        />
      </div>

      {/* Primary Momentum Chart */}
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
      />
    </div>
  );
}