import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  HiOutlineChartBarSquare, HiOutlineBuildingOffice2, HiOutlineSquares2X2,
  HiOutlineCalendarDays, HiOutlineUsers, HiOutlineGift,
  HiOutlineArrowRightOnRectangle, HiOutlineBars3
} from 'react-icons/hi2';
import { useState } from 'react';
import useAuthStore from '../store/authStore';

const navItems = [
  { path: '/admin', icon: HiOutlineChartBarSquare, label: 'Dashboard' },
  { path: '/admin/properties', icon: HiOutlineBuildingOffice2, label: 'Properties' },
  { path: '/admin/rooms', icon: HiOutlineSquares2X2, label: 'Rooms' },
  { path: '/admin/bookings', icon: HiOutlineCalendarDays, label: 'Bookings' },
  { path: '/admin/employees', icon: HiOutlineUsers, label: 'Employees' },
  { path: '/admin/referrals', icon: HiOutlineGift, label: 'Referrals' }
];

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-50 flex">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-surface-950 to-surface-900 transform transition-transform duration-200 lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-surface-800">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow-primary">
                <span className="text-white font-bold text-sm">HH</span>
              </div>
              <div>
                <span className="font-display text-lg font-bold text-white block leading-tight">HHBB</span>
                <span className="text-xs text-primary-400 font-medium">Admin Portal</span>
              </div>
            </Link>
          </div>
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navItems.map(item => {
              const active = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? 'bg-primary-600/20 text-primary-400 shadow-glow-primary' : 'text-surface-400 hover:bg-surface-800 hover:text-surface-200'}`}>
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="p-3 border-t border-surface-800">
            <div className="px-4 py-2 mb-2">
              <p className="text-sm font-semibold text-surface-300 truncate">{user?.full_name}</p>
              <p className="text-xs text-surface-500">Administrator</p>
            </div>
            <button onClick={() => { logout(); navigate('/'); }}
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-surface-500 hover:bg-danger-600/20 hover:text-danger-400 transition-all">
              <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-surface-200/60 px-4 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg text-surface-600 hover:bg-surface-100 mr-3">
              <HiOutlineBars3 className="w-6 h-6" />
            </button>
            <h1 className="font-display text-lg font-bold text-surface-900">
              {navItems.find(n => n.path === location.pathname)?.label || 'Admin'}
            </h1>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
