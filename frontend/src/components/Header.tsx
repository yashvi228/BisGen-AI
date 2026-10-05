import { Menu, RefreshCw, Radio, Sparkles } from "lucide-react";
import { NavTab } from "./Sidebar";

interface HeaderProps {
  activeTab: NavTab;
  onMenuClick: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  isBackendOnline?: boolean;
}

const tabTitles: Record<NavTab, { title: string; subtitle: string }> = {
  dashboard: {
    title: "Executive Business Dashboard",
    subtitle: "Real-time key performance metrics, regional sales, and profit insights",
  },
  chat: {
    title: "AI Business Analyst",
    subtitle: "Natural language query engine powered by DuckDB & LLM Agent",
  },
  upload: {
    title: "Data Management & Upload",
    subtitle: "Import retail datasets, inspect schemas, and refresh analytical tables",
  },
};

export default function Header({
  activeTab,
  onMenuClick,
  onRefresh,
  isRefreshing = false,
  isBackendOnline = false,
}: HeaderProps) {
  const current = tabTitles[activeTab];

  return (
    <header className="sticky top-0 z-30 flex h-18 items-center justify-between border-b border-gray-200/80 bg-white/90 px-4 sm:px-8 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 lg:hidden"
          aria-label="Open navigation sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold tracking-tight text-gray-900 leading-tight">
            {current.title}
          </h1>
          <p className="hidden text-xs text-gray-500 sm:block leading-tight mt-0.5">
            {current.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Backend status pill */}
        <div
          className={`hidden sm:inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border ${
            isBackendOnline
              ? "bg-emerald-50 text-emerald-700 border-emerald-200/70"
              : "bg-amber-50 text-amber-700 border-amber-200/70"
          }`}
        >
          <Radio className={`h-3 w-3 ${isBackendOnline ? "text-emerald-500 animate-pulse" : "text-amber-500"}`} />
          <span>{isBackendOnline ? "API Live (Port 8000)" : "Fallback Demo Mode"}</span>
        </div>

        {/* Global Refresh Button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-xs transition-all hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50"
            title="Refresh analytics data"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 text-gray-500 ${
                isRefreshing ? "animate-spin text-blue-600" : ""
              }`}
            />
            <span className="hidden md:inline">Refresh</span>
          </button>
        )}

        {/* Agent quick status */}
        <div className="flex items-center gap-2 rounded-xl bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-100/80 px-3 py-1.5 text-xs text-blue-700 font-medium">
          <Sparkles className="h-3.5 w-3.5 text-blue-600" />
          <span className="hidden md:inline">v1.0 Ready</span>
        </div>
      </div>
    </header>
  );
}
