
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import useAdminAuth from "../../hooks/use-admin-auth";
import { ThemeProvider } from "@/components/theme-provider";

const AdminLayout = () => {
  useAdminAuth();
  
  // ✅ Enhanced sidebar state with better defaults
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('admin-sidebar-open');
    if (saved !== null) {
      return JSON.parse(saved);
    }
    // Default: open on desktop/tablet (768px+), closed on mobile
    return window.innerWidth >= 768;
  });

  // ✅ Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('admin-sidebar-open', JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  // ✅ Handle window resize
  useEffect(() => {
    const handleResize = () => {
      // Auto-close on mobile to prevent overlay issues
      if (window.innerWidth < 768 && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  // ✅ Keyboard shortcut support
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Toggle sidebar with Ctrl/Cmd + \
      if ((event.ctrlKey || event.metaKey) && event.key === '\\') {
        event.preventDefault();
        toggleSidebar();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <ThemeProvider defaultTheme="light" storageKey="admin-ui-theme">
      <div className="flex h-screen bg-gray-50 dark:bg-black overflow-hidden">
        {/* ✅ Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={toggleSidebar} // ✅ Changed to toggle instead of just close
        />
        
        {/* ✅ Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden transition-opacity duration-300"
            onClick={closeSidebar}
          />
        )}
        
        {/* ✅ Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <Topbar 
            onToggleSidebar={toggleSidebar} 
            sidebarOpen={sidebarOpen}
          />
          
          {/* Main Content */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-black">
            <div className="container mx-auto px-6 py-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default AdminLayout;

