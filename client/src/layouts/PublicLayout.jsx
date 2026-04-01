import { Outlet, Link, useNavigate } from 'react-router-dom';
import { HiOutlineGlobeAlt, HiOutlineUser, HiOutlineBars3 } from 'react-icons/hi2';
import { useState } from 'react';
import useAuthStore from '../store/authStore';

export default function PublicLayout() {
  const { user, token, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handlePortal = () => {
    if (!token) return navigate('/login');
    if (user?.role === 'admin') return navigate('/admin');
    if (user?.role === 'employee') return navigate('/staff');
    return navigate('/customer');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* ═══════ Navbar ═══════ */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-surface-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:shadow-primary-500/40 transition-shadow">
                <span className="text-white font-bold text-sm">HH</span>
              </div>
              <span className="font-display text-xl font-bold bg-gradient-to-r from-surface-900 to-surface-600 bg-clip-text text-transparent">
                HHBB
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              <Link to="/" className="px-4 py-2 rounded-lg text-sm font-medium text-surface-600 hover:text-surface-900 hover:bg-surface-100 transition-all">
                Properties
              </Link>
              <Link to="/search" className="px-4 py-2 rounded-lg text-sm font-medium text-surface-600 hover:text-surface-900 hover:bg-surface-100 transition-all">
                Search Rooms
              </Link>
            </div>

            {/* Actions */}
            <div className="hidden md:flex items-center gap-3">
              {token ? (
                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePortal}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-50 text-primary-700 text-sm font-medium hover:bg-primary-100 transition-colors"
                  >
                    <HiOutlineUser className="w-4 h-4" />
                    {user?.full_name?.split(' ')[0] || 'Portal'}
                  </button>
                  <button
                    onClick={() => { logout(); navigate('/'); }}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-surface-500 hover:text-danger-600 hover:bg-danger-50 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-xl text-sm font-medium text-surface-600 hover:text-surface-900 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-semibold shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:translate-y-[-1px] active:translate-y-0 transition-all"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-surface-600 hover:bg-surface-100"
            >
              <HiOutlineBars3 className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileOpen && (
            <div className="md:hidden pb-4 border-t border-surface-100 mt-2 pt-3 animate-slide-down">
              <div className="flex flex-col gap-1">
                <Link to="/" onClick={() => setMobileOpen(false)} className="px-4 py-2.5 rounded-lg text-sm font-medium text-surface-700 hover:bg-surface-100">Properties</Link>
                <Link to="/search" onClick={() => setMobileOpen(false)} className="px-4 py-2.5 rounded-lg text-sm font-medium text-surface-700 hover:bg-surface-100">Search Rooms</Link>
                <hr className="my-2 border-surface-100" />
                {token ? (
                  <>
                    <button onClick={() => { handlePortal(); setMobileOpen(false); }} className="px-4 py-2.5 rounded-lg text-sm font-medium text-primary-600 hover:bg-primary-50 text-left">My Portal</button>
                    <button onClick={() => { logout(); navigate('/'); setMobileOpen(false); }} className="px-4 py-2.5 rounded-lg text-sm font-medium text-danger-600 hover:bg-danger-50 text-left">Logout</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMobileOpen(false)} className="px-4 py-2.5 rounded-lg text-sm font-medium text-surface-700 hover:bg-surface-100">Sign In</Link>
                    <Link to="/register" onClick={() => setMobileOpen(false)} className="px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 text-center">Get Started</Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-surface-900 text-surface-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                  <span className="text-white font-bold text-xs">HH</span>
                </div>
                <span className="font-display text-lg font-bold text-white">HHBB Hotels</span>
              </div>
              <p className="text-sm leading-relaxed">
                Boutique hotel experience across Italy's most beautiful destinations.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">Quick Links</h4>
              <div className="flex flex-col gap-2 text-sm">
                <Link to="/" className="hover:text-white transition-colors">Properties</Link>
                <Link to="/search" className="hover:text-white transition-colors">Search Rooms</Link>
                <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">Contact</h4>
              <div className="flex flex-col gap-2 text-sm">
                <span>info@hhbb.com</span>
                <span>+39 041 520 0600</span>
                <span>Venice · Verona · Lake Garda</span>
              </div>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-surface-800 text-sm text-center text-surface-500">
            © {new Date().getFullYear()} HHBB Hotels. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
