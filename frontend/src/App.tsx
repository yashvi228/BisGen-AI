import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import AIChat from './pages/AIChat';
import DataUpload from './pages/DataUpload';
import { LayoutDashboard, MessageSquare, Upload } from 'lucide-react';

const App = () => {
  const [currentRoute, setCurrentRoute] = useState('/');

  const renderContent = () => {
    switch (currentRoute) {
      case '/':
        return <Dashboard />;
      case '/chat':
        return <AIChat />;
      case '/upload':
        return <DataUpload />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-800">BisGen AI</h1>
          <p className="text-sm text-gray-500">Business Intelligence Agent</p>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <button 
            onClick={() => setCurrentRoute('/')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentRoute === '/' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
          >
            <LayoutDashboard size={20} />
            <span className="font-medium">Dashboard</span>
          </button>
          <button 
            onClick={() => setCurrentRoute('/chat')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentRoute === '/chat' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
          >
            <MessageSquare size={20} />
            <span className="font-medium">AI Chat</span>
          </button>
          <button 
            onClick={() => setCurrentRoute('/upload')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentRoute === '/upload' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
          >
            <Upload size={20} />
            <span className="font-medium">Upload Data</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
