import { useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { ChatbotOverlay } from '../components/ChatbotOverlay';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

export const ProtectedLayout = ({ allowedRoles = [] }) => {
  const { isAuthenticated, user, checkAuth } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[40] lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={clsx(
        "fixed inset-y-0 left-0 z-[50] w-72 transform transition-transform duration-500 ease-in-out lg:relative lg:translate-x-0 shadow-2xl lg:shadow-none",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Modern Mobile Header Trigger */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-100">
           <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-black text-white text-xs">SC</div>
              <span className="font-black tracking-tighter text-slate-800">SCMS</span>
           </div>
           <button 
             onClick={() => setIsSidebarOpen(true)}
             className="p-2 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
           >
             <Bars3Icon className="w-6 h-6" />
           </button>
        </div>

        <Header />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8 lg:p-10 scroll-smooth">
          <div className="max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      <ChatbotOverlay />
    </div>
  );
};
