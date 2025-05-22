import React from 'react';
import { NavLink } from 'react-router-dom';
import { X, Home, Camera, UserPlus, Users, ClipboardList } from 'lucide-react';

interface SidebarProps {
  open: boolean;
  pinned: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, pinned, onClose }) => {
  return (
    <>
      {/* Overlay */}
      {open && !pinned && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed top-0 left-0 bottom-0 w-64 bg-white/80 backdrop-blur-lg shadow-xl border-r border-white/20 transform ${
          open || pinned ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out z-30 ${
          pinned ? 'md:translate-x-0 md:z-0' : 'md:-translate-x-full'
        } md:mt-16`}
      >
        <div className="p-4 flex justify-between items-center border-b md:hidden">
          <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600">
            FaceAttend
          </h2>
          <button
            className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
            onClick={onClose}
          >
            <X size={24} />
          </button>
        </div>
        <nav className="mt-4 px-2 space-y-1">
          <NavItem to="/" icon={<Home size={20} />} label="Dashboard" onClick={onClose} />
          <NavItem to="/scan" icon={<Camera size={20} />} label="Take Attendance" onClick={onClose} />
          <NavItem to="/register" icon={<UserPlus size={20} />} label="Register Student" onClick={onClose} />
          <NavItem to="/students" icon={<Users size={20} />} label="Manage Students" onClick={onClose} />
          <NavItem to="/history" icon={<ClipboardList size={20} />} label="Attendance History" onClick={onClose} />
        </nav>
      </div>
    </>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, onClick }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `sidebar-item ${isActive ? 'sidebar-item-active' : 'sidebar-item-inactive'}`
      }
      onClick={onClick}
    >
      <span className="mr-3">{icon}</span>
      {label}
    </NavLink>
  );
};

export default Sidebar;