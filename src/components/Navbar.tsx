import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, User, Bell, PanelLeftClose, PanelLeft } from 'lucide-react';

interface NavbarProps {
  onMenuClick: () => void;
  sidebarPinned: boolean;
  onPinToggle: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick, sidebarPinned, onPinToggle }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-10 bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button 
              className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none md:hidden"
              onClick={onMenuClick}
            >
              <Menu size={24} />
            </button>
            <button
              className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none hidden md:block"
              onClick={onPinToggle}
            >
              {sidebarPinned ? <PanelLeftClose size={24} /> : <PanelLeft size={24} />}
            </button>
            <Link to="/" className="flex items-center ml-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600 font-bold text-xl">
                FaceAttend
              </span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none relative">
              <Bell size={20} />
              <span className="absolute top-0 right-0 h-4 w-4 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full text-xs text-white flex items-center justify-center">
                2
              </span>
            </button>
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 flex items-center justify-center text-white">
                <User size={18} />
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700 hidden md:block">Admin</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;