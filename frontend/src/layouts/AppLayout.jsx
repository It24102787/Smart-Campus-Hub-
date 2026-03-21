import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  MapPin,
  AlertCircle,
  Wrench,
  Activity,
  GraduationCap,
  LogOut,
  Menu,
  X,
  User as UserIcon
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const SidebarLink = ({ to, icon: Icon, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) => cn(
      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
      isActive
        ? "bg-primary text-white shadow-lg shadow-primary/30"
        : "text-slate-600 hover:bg-slate-100"
    )}
  >
    <Icon size={20} />
    <span className="font-medium">{children}</span>
  </NavLink>
);

const AppLayout = () => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const role = user?.role || (Array.isArray(user?.roles) ? user.roles[0] : null);
  const isTutor = role === 'TUTOR';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transition-transform duration-300 lg:static lg:translate-x-0",
        !isSidebarOpen && "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-6">
            <h1 className="text-xl font-bold text-primary flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">S</div>
              SmartCampus
            </h1>
          </div>

          <nav className="flex-1 px-4 space-y-1">
            {isTutor ? (
              <SidebarLink to="/support/tutor-dashboard" icon={GraduationCap}>Tutor Dashboard</SidebarLink>
            ) : (
              <>
                <SidebarLink to="/dashboard" icon={LayoutDashboard}>Dashboard</SidebarLink>
                <SidebarLink to="/study-spots" icon={MapPin}>Study Spots</SidebarLink>
                <SidebarLink to="/issues" icon={AlertCircle}>Issue Reporter</SidebarLink>
                <SidebarLink to="/equipment" icon={Wrench}>Equipment</SidebarLink>
                <SidebarLink to="/environment" icon={Activity}>Environment</SidebarLink>
                <SidebarLink to="/support" icon={GraduationCap}>Academic Support</SidebarLink>
              </>
            )}
          </nav>

          <div className="p-4 border-t border-slate-100">
            <div className="flex items-center gap-3 px-4 py-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                <UserIcon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8">
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg lg:hidden"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="flex items-center gap-4 ml-auto">
            <div className="text-sm text-slate-500 hidden sm:block">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
