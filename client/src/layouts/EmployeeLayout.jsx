import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { HiOutlineHome, HiOutlineBuildingStorefront, HiOutlineStar, HiOutlineArrowRightOnRectangle, HiOutlineBars3 } from 'react-icons/hi2';
import { useState } from 'react';
import useAuthStore from '../store/authStore';

const navItems = [
  { path: '/staff', icon: HiOutlineHome, label: 'Dashboard' },
  { path: '/staff/rooms', icon: HiOutlineBuildingStorefront, label: 'Room Management' },
  { path: '/staff/points', icon: HiOutlineStar, label: 'My Points' }
];

export default function EmployeeLayout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-50 flex">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-surface-900 transform transition-transform duration-200 lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-surface-800">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">HH</span>
              </div>
              <span className="font-display text-lg font-bold text-white">HHBB Staff</span>
            </Link>
            <div className="mt-4 px-3 py-2 rounded-lg bg-surface-800">
              <p className="text-sm font-semibold text-surface-200 truncate">{user?.full_name}</p>
              <p className="text-xs text-surface-400 capitalize">{user?.employee?.position || 'Employee'}</p>
            </div>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            {navItems.map(item => {
              const active = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? 'bg-primary-600/20 text-primary-400' : 'text-surface-400 hover:bg-surface-800 hover:text-surface-200'}`}>
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="p-3 border-t border-surface-800">
            <button onClick={() => { logout(); navigate('/'); }}
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-surface-500 hover:bg-danger-600/20 hover:text-danger-400 transition-all">
              <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/20 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-surface-200/60 px-4 lg:px-8 h-16 flex items-center">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg text-surface-600 hover:bg-surface-100 mr-3">
            <HiOutlineBars3 className="w-6 h-6" />
          </button>
          <h1 className="font-display text-lg font-bold text-surface-900">Staff Portal</h1>
        </header>
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
