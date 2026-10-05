import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Sidebar, { NavTab } from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import AIChat from "./pages/AIChat";
import DataUpload from "./pages/DataUpload";

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isBackendOnline, setIsBackendOnline] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const queryClient = useQueryClient();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  return (
    <div className="flex min-h-screen bg-slate-50/60 text-gray-900 font-sans antialiased">
      {/* Sidebar navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        isBackendOnline={isBackendOnline}
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
        />

        {/* Dynamic page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === "dashboard" && (
            <Dashboard onBackendStatusChange={setIsBackendOnline} />
          )}
          {activeTab === "chat" && <AIChat />}
          {activeTab === "upload" && <DataUpload />}
        </main>
      </div>
    </div>
  );
}