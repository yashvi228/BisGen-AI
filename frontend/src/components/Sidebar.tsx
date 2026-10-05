import {
  LayoutDashboard,
  MessageSquareText,
  UploadCloud,
  Sparkles,
  X,
  Database,
  CheckCircle2,
  AlertCircle,
  Command,
  ChevronDown,
  Building2,
  SlidersHorizontal,
  BrainCircuit,
} from "lucide-react";

export type NavTab = "dashboard" | "forecast" | "chat" | "upload";

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isBackendOnline?: boolean;
  onOpenCommandPalette?: () => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  isOpen,
  setIsOpen,
  isBackendOnline = false,
  onOpenCommandPalette,
}: SidebarProps) {
  const navItems = [
    {
      id: "dashboard" as NavTab,
      label: "Overview & Analytics",
      description: "KPIs, trends & revenue",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: "forecast" as NavTab,
      label: "ML Sales Forecast",
      description: "Predictive ML models",
      icon: BrainCircuit,
      badge: "AI",
    },
    {
      id: "chat" as NavTab,
      label: "AI Business Analyst",
      description: "Chat with retail data",
      icon: MessageSquareText,
      badge: "Agent",
    },
    {
      id: "upload" as NavTab,
      label: "Data Management",
      description: "Ingest CSV/Excel records",
      icon: UploadCloud,
      badge: "DuckDB",
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs transition-opacity lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200/90 bg-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-18 items-center justify-between border-b border-slate-100 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 via-indigo-600 to-violet-600 text-white shadow-md shadow-blue-500/25">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-tight text-slate-900 text-base">
                  BisGen
                </span>
                <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-blue-600 border border-blue-200/70">
                  AI
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-400">
                Decision Intelligence
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Workspace Switcher */}
        <div className="px-4 pt-4">
          <div className="flex items-center justify-between rounded-xl bg-slate-50/80 p-2.5 border border-slate-200/70 text-xs text-slate-700 hover:border-slate-300 transition-colors cursor-pointer group">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-700 shrink-0 font-bold text-[11px]">
                <Building2 className="h-3.5 w-3.5" />
              </div>
              <div className="truncate">
                <p className="font-bold text-slate-900 truncate text-[11px]">Global Retail Corp</p>
                <p className="text-[10px] text-slate-400 truncate">DuckDB Production</p>
              </div>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 shrink-0" />
          </div>
        </div>

        {/* Quick Command Palette Button */}
        {onOpenCommandPalette && (
          <div className="px-4 pt-2">
            <button
              onClick={onOpenCommandPalette}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/50 px-3 py-2 text-xs text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Command className="h-3.5 w-3.5" />
                <span>Quick Actions</span>
              </span>
              <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 shadow-2xs">
                ⌘K
              </kbd>
            </button>
          </div>
        )}

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-4 py-5">
          <div className="mb-2 px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            Workspaces
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsOpen(false);
                  }}
                  className={`group relative flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left transition-all ${
                    isActive
                      ? "bg-blue-50/80 text-blue-700 shadow-xs ring-1 ring-blue-500/20 font-bold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
                  }`}
                >
                  {/* Active Indicator Bar */}
                  {isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-blue-600" />
                  )}

                  <div className="flex items-center gap-3">
                    <Icon
                      className={`h-4.5 w-4.5 transition-colors ${
                        isActive
                          ? "text-blue-600"
                          : "text-slate-400 group-hover:text-slate-600"
                      }`}
                    />
                    <div>
                      <div className="text-xs leading-tight font-semibold">{item.label}</div>
                      <div className="text-[10px] text-slate-400 leading-tight mt-0.5 font-normal">
                        {item.description}
                      </div>
                    </div>
                  </div>

                  {item.badge && (
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="mt-7 mb-2 px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            Active Dataset
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 text-xs">
            <div className="flex items-center gap-2 font-semibold text-slate-800">
              <Database className="h-4 w-4 text-blue-600 shrink-0" />
              <span className="truncate">SuperStore Retail Sales</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
              5,903 transactions indexed in DuckDB analytical storage.
            </p>
          </div>
        </div>

        {/* Footer System Status & User Profile */}
        <div className="border-t border-slate-100 p-4 bg-slate-50/40 space-y-3">
          <div className="flex items-center justify-between rounded-xl bg-white p-2.5 border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div
                  className={`h-2.5 w-2.5 rounded-full ${
                    isBackendOnline ? "bg-emerald-500" : "bg-amber-400"
                  }`}
                />
                <span
                  className={`absolute -inset-0.5 rounded-full animate-ping opacity-60 ${
                    isBackendOnline ? "bg-emerald-400" : "bg-amber-300"
                  }`}
                />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 leading-tight">
                  {isBackendOnline ? "DuckDB Live" : "Demo Mode"}
                </p>
                <p className="text-[10px] text-slate-400 leading-tight">
                  {isBackendOnline ? "Port 8000 Connected" : "Local Analytics Fallback"}
                </p>
              </div>
            </div>

            {isBackendOnline ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-amber-500" />
            )}
          </div>

          {/* User profile */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-purple-600 font-bold text-white text-xs shadow-xs">
                AC
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 leading-tight">Alex Chen</p>
                <p className="text-[10px] text-slate-400 leading-tight">Senior BI Analyst</p>
              </div>
            </div>
            <button className="text-slate-400 hover:text-slate-600 p-1 rounded">
              <SlidersHorizontal className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
