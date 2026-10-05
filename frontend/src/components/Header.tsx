import { useState } from "react";
import {
  Menu,
  RefreshCw,
  Radio,
  Search,
  Bell,
  Download,
  Calendar,
} from "lucide-react";
import { NavTab } from "./Sidebar";

interface HeaderProps {
  activeTab: NavTab;
  onMenuClick: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  isBackendOnline?: boolean;
  onOpenCommandPalette?: () => void;
  onExportReport?: () => void;
}

const tabTitles: Record<NavTab, { title: string; subtitle: string }> = {
  dashboard: {
    title: "Executive Business Dashboard",
    subtitle: "Real-time key performance indicators, regional sales, and profit insights",
  },
  forecast: {
    title: "Predictive Sales Forecast",
    subtitle: "Scikit-Learn machine learning regression algorithms trained on historical data",
  },
  chat: {
    title: "AI Business Analyst",
    subtitle: "Natural language query engine powered by DuckDB & LLM Agent",
  },
  upload: {
    title: "Data Management & Ingestion",
    subtitle: "Import retail datasets, inspect schemas, and refresh analytical tables",
  },
};

export default function Header({
  activeTab,
  onMenuClick,
  onRefresh,
  isRefreshing = false,
  isBackendOnline = false,
  onOpenCommandPalette,
  onExportReport,
}: HeaderProps) {
  const current = tabTitles[activeTab];
  const [selectedPeriod, setSelectedPeriod] = useState("Full Year 2019");

  return (
    <header className="sticky top-0 z-30 flex h-18 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 sm:px-8 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 lg:hidden"
          aria-label="Open navigation sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 leading-tight">
            {current.title}
          </h1>
          <p className="hidden text-xs text-slate-500 sm:block leading-tight mt-0.5">
            {current.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Quick Search / Command Palette bar */}
        {onOpenCommandPalette && (
          <button
            onClick={onOpenCommandPalette}
            className="hidden md:flex items-center gap-2 rounded-xl border border-slate-200/90 bg-slate-50/70 px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors shadow-2xs"
          >
            <Search className="h-3.5 w-3.5 text-slate-400" />
            <span>Search or command...</span>
            <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
              ⌘K
            </kbd>
          </button>
        )}

        {/* Period Selector (on dashboard) */}
        {activeTab === "dashboard" && (
          <div className="relative hidden xl:block">
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-transparent outline-none cursor-pointer pr-1"
              >
                <option value="Full Year 2019">Full Year 2019</option>
                <option value="H2 2019">H2 2019 (Jul-Dec)</option>
                <option value="H1 2019">H1 2019 (Jan-Jun)</option>
                <option value="Q4 Peak">Q4 Peak (Oct-Dec)</option>
              </select>
            </div>
          </div>
        )}

        {/* Backend status pill */}
        <div
          className={`hidden sm:inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border ${
            isBackendOnline
              ? "bg-emerald-50 text-emerald-700 border-emerald-200/80"
              : "bg-amber-50 text-amber-700 border-amber-200/80"
          }`}
          title={isBackendOnline ? "DuckDB Backend Connected" : "Local Fallback Sample Data"}
        >
          <Radio className={`h-3 w-3 ${isBackendOnline ? "text-emerald-500 animate-pulse" : "text-amber-500"}`} />
          <span>{isBackendOnline ? "API Live" : "Demo Fallback"}</span>
        </div>

        {/* Global Refresh Button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50"
            title="Refresh analytics data"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 text-slate-500 ${
                isRefreshing ? "animate-spin text-blue-600" : ""
              }`}
            />
            <span className="hidden sm:inline">Sync</span>
          </button>
        )}

        {/* Export Report Action */}
        {onExportReport && activeTab === "dashboard" && (
          <button
            onClick={onExportReport}
            className="hidden sm:flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:bg-slate-50 hover:border-slate-300"
            title="Download executive report"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Export</span>
          </button>
        )}

        {/* Notification Bell */}
        <div className="relative">
          <button
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs"
            title="System Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />
          </button>
        </div>
      </div>
    </header>
  );
}
