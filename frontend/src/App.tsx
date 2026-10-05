import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Sidebar, { NavTab } from "./components/Sidebar";
import Header from "./components/Header";
import Toast, { ToastMessage } from "./components/Toast";
import CommandPalette from "./components/CommandPalette";
import Dashboard from "./pages/Dashboard";
import Forecast from "./pages/forecast";
import AIChat from "./pages/AIChat";
import DataUpload from "./pages/DataUpload";

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isBackendOnline, setIsBackendOnline] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const queryClient = useQueryClient();

  const addToast = (message: string, type: "success" | "error" | "info" = "success") => {
    const newToast: ToastMessage = {
      id: Date.now().toString() + Math.random().toString(),
      message,
      type,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Keyboard shortcut listener for ⌘K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries();
    setTimeout(() => {
      setIsRefreshing(false);
      addToast("Synchronized analytics data with DuckDB storage", "success");
    }, 600);
  };

  const handleExportReport = () => {
    const reportData = {
      report_title: "BisGen AI Executive Summary",
      timestamp: new Date().toISOString(),
      dataset: "SuperStore Retail Sales",
      metrics: {
        total_revenue: 2297200.86,
        net_profit: 286397.02,
        profit_margin: "12.5%",
        completed_orders: 5009,
        active_customers: 793,
        units_sold: 37873,
      },
      leading_territory: "West Region ($725,457.82 - 31.6%)",
      top_category: "Technology ($145,454.95 profit - 50.8%)",
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `executive_summary_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast("Downloaded executive summary report", "info");
  };

  return (
    <div className="flex min-h-screen bg-slate-50/70 text-slate-900 font-sans antialiased selection:bg-blue-500/20 selection:text-blue-700">
      {/* Sidebar navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        isBackendOnline={isBackendOnline}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* Main content wrapper */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Header bar */}
        <Header
          activeTab={activeTab}
          onMenuClick={() => setSidebarOpen(true)}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          isBackendOnline={isBackendOnline}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onExportReport={handleExportReport}
        />

        {/* Dynamic page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === "dashboard" && (
            <Dashboard
              onBackendStatusChange={setIsBackendOnline}
              onShowToast={addToast}
            />
          )}
          {activeTab === "forecast" && <Forecast onShowToast={addToast} />}
          {activeTab === "chat" && <AIChat onShowToast={addToast} />}
          {activeTab === "upload" && <DataUpload onShowToast={addToast} />}
        </main>
      </div>

      {/* Global Interactive Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={setActiveTab}
        onRefresh={handleRefresh}
        onAskAI={() => {
          setActiveTab("chat");
          addToast("Opened AI Analyst with query template", "info");
        }}
      />

      {/* Floating Toast Notification System */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}