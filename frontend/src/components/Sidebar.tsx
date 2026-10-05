import { LayoutDashboard, MessageSquareText, UploadCloud, Sparkles, X, Database, CheckCircle2, AlertCircle } from "lucide-react";

export type NavTab = "dashboard" | "chat" | "upload";

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isBackendOnline?: boolean;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  isOpen,
  setIsOpen,
  isBackendOnline = false,
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
      id: "chat" as NavTab,
      label: "AI Business Analyst",
      description: "Chat with your data",
      icon: MessageSquareText,
      badge: "Agent",
    },
    {
      id: "upload" as NavTab,
      label: "Data Management",
      description: "Ingest CSV/Excel records",
      icon: UploadCloud,
      badge: null,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-xs transition-opacity lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col border-r border-gray-200 bg-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-18 items-center justify-between border-b border-gray-100 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-tight text-gray-900 text-base">
                  BisGen
                </span>
                <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-600 border border-blue-100">
                  AI
                </span>
              </div>
              <p className="text-[11px] font-medium text-gray-400">
                Decision Intelligence
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Navigation
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
                  className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-left transition-all ${
                    isActive
                      ? "bg-blue-50/80 text-blue-700 shadow-xs ring-1 ring-blue-500/20 font-semibold"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`h-5 w-5 transition-colors ${
                        isActive
                          ? "text-blue-600"
                          : "text-gray-400 group-hover:text-gray-600"
                      }`}
                    />
                    <div>
                      <div className="text-sm leading-tight">{item.label}</div>
                      <div className="text-[11px] text-gray-400 leading-tight mt-0.5 font-normal">
                        {item.description}
                      </div>
                    </div>
                  </div>

                  {item.badge && (
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="mt-8 mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Active Dataset
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3.5 text-xs">
            <div className="flex items-center gap-2 font-medium text-gray-800">
              <Database className="h-4 w-4 text-blue-600" />
              <span>SuperStore Retail Sales</span>
            </div>
            <p className="mt-1 text-[11px] text-gray-500 leading-relaxed">
              5,903 records across 4 regions and 3 major categories.
            </p>
          </div>
        </div>

        {/* Footer System Status */}
        <div className="border-t border-gray-100 p-4 bg-gray-50/50">
          <div className="flex items-center justify-between rounded-xl bg-white p-3 border border-gray-200/80 shadow-xs">
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
                <p className="text-xs font-semibold text-gray-800">
                  {isBackendOnline ? "Backend Live" : "Demo Mode"}
                </p>
                <p className="text-[10px] text-gray-400">
                  {isBackendOnline ? "DuckDB Connected" : "Local Analytics Fallback"}
                </p>
              </div>
            </div>

            {isBackendOnline ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-amber-500" />
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
