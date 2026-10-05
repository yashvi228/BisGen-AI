import { useState, useEffect } from "react";
import {
  Search,
  LayoutDashboard,
  MessageSquareText,
  UploadCloud,
  TrendingUp,
  Sparkles,
  RefreshCw,
  X,
  BrainCircuit,
} from "lucide-react";
import { NavTab } from "./Sidebar";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: NavTab) => void;
  onRefresh: () => void;
  onAskAI?: (prompt: string) => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  onNavigate,
  onRefresh,
  onAskAI,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onClose();
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    {
      category: "Navigation",
      title: "Executive Business Dashboard",
      subtitle: "Overview of revenue, profit, orders, and sales charts",
      icon: LayoutDashboard,
      action: () => {
        onNavigate("dashboard");
        onClose();
      },
    },
    {
      category: "Navigation",
      title: "Predictive Sales Forecast",
      subtitle: "Machine learning regression projections for future months",
      icon: BrainCircuit,
      action: () => {
        onNavigate("forecast");
        onClose();
      },
    },
    {
      category: "Navigation",
      title: "AI Business Analyst Copilot",
      subtitle: "Chat with retail data, generate insights & answers",
      icon: MessageSquareText,
      action: () => {
        onNavigate("chat");
        onClose();
      },
    },
    {
      category: "Navigation",
      title: "Data Management & Ingestion",
      subtitle: "Upload CSV/Excel spreadsheets to DuckDB",
      icon: UploadCloud,
      action: () => {
        onNavigate("upload");
        onClose();
      },
    },
    {
      category: "AI Questions",
      title: "Ask AI: Which product generated the highest revenue?",
      subtitle: "Drills into gross sales for top items",
      icon: Sparkles,
      action: () => {
        onNavigate("chat");
        onAskAI?.("Which product generated the highest gross revenue?");
        onClose();
      },
    },
    {
      category: "AI Questions",
      title: "Ask AI: What is our profit margin by category?",
      subtitle: "Analyzes Technology vs Furniture profitability",
      icon: TrendingUp,
      action: () => {
        onNavigate("chat");
        onAskAI?.("What is our overall profit margin and how is it distributed?");
        onClose();
      },
    },
    {
      category: "Actions",
      title: "Synchronize & Refresh Analytics Data",
      subtitle: "Refetch live metrics from DuckDB",
      icon: RefreshCw,
      action: () => {
        onRefresh();
        onClose();
      },
    },
  ];

  const filtered = query.trim()
    ? actions.filter(
        (a) =>
          a.title.toLowerCase().includes(query.toLowerCase()) ||
          a.subtitle.toLowerCase().includes(query.toLowerCase()) ||
          a.category.toLowerCase().includes(query.toLowerCase())
      )
    : actions;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center border-b border-slate-100 px-4 py-3.5">
          <Search className="h-5 w-5 text-slate-400 mr-3 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search metrics, AI queries, pages..."
            className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none"
          />
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No matching actions or queries found.
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={item.action}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-blue-50/70 group"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors shrink-0">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 group-hover:text-blue-700 transition-colors truncate">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {item.subtitle}
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 group-hover:border-blue-100 group-hover:text-blue-600">
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-4 py-2 text-[11px] text-slate-400">
          <span>Use ⌘K to open anytime</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
}
