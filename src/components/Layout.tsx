import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [sidebarPinned, setSidebarPinned] = React.useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-sky-50 to-purple-50">
      <Navbar 
        onMenuClick={() => setSidebarOpen(true)} 
        sidebarPinned={sidebarPinned}
        onPinToggle={() => setSidebarPinned(!sidebarPinned)}
      />
      <Sidebar 
        open={sidebarOpen} 
        pinned={sidebarPinned}
        onClose={() => setSidebarOpen(false)}
      />
      <main className={`pt-16 px-4 sm:px-6 lg:px-8 pb-8 max-w-7xl mx-auto transition-all duration-300 ${
        sidebarPinned ? 'md:ml-64' : ''
      }`}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;