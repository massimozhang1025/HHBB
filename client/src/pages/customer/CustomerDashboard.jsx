import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineCalendarDays, HiOutlineGift, HiOutlineStar, HiOutlineCurrencyEuro, HiOutlineMoon } from 'react-icons/hi2';
import useAuthStore from '../../store/authStore';
import { bookingsAPI, referralsAPI, authAPI } from '../../services/api';

const tierConfig = {
  bronze:   { color: 'from-amber-600 to-amber-700', icon: '🥉', next: 'Silver', need: 500 },
  silver:   { color: 'from-gray-300 to-gray-500', icon: '🥈', next: 'Gold', need: 2000 },
  gold:     { color: 'from-yellow-300 to-yellow-500', icon: '🥇', next: 'Platinum', need: 5000 },
  platinum: { color: 'from-purple-400 to-indigo-600', icon: '💎', next: null, need: null }
};

export default function CustomerDashboard() {
  const { user, setUser } = useAuthStore();
  const [stats, setStats] = useState({ bookings: 0, referrals: 0 });
  const [loyalty, setLoyalty] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    Promise.all([
      bookingsAPI.getMyBookings().catch(() => ({ data: { bookings: [] } })),
      referralsAPI.getMyCode().catch(() => ({ data: { stats: {} } })),
      authAPI.getMe().catch(() => ({ data: { user: null } }))
    ]).then(([bookRes, refRes, meRes]) => {
      const books = bookRes.data.bookings || [];
      setRecentBookings(books.slice(0, 3));
      setStats({
        bookings: books.length,
        referrals: Object.values(refRes.data.stats || {}).reduce((a, b) => a + b, 0)
      });
      if (meRes.data.user?.loyalty) {
        setLoyalty(meRes.data.user.loyalty);
      }
    });
  }, []);

  const tier = loyalty?.tier || 'bronze';
  const tc = tierConfig[tier];
  const progress = tc.need ? Math.min(100, ((loyalty?.total_spent || 0) / tc.need) * 100) : 100;

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="font-display text-2xl font-bold text-surface-900">Welcome, {user?.full_name?.split(' ')[0]}! 👋</h2>
        <p className="text-surface-500 mt-1">Here's your activity overview</p>
      </div>

      {/* Loyalty Card */}
      <div className={`bg-gradient-to-br ${tc.color} rounded-2xl p-6 text-white mb-8 shadow-lg`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white/70 text-sm">Loyalty Tier</p>
            <h3 className="font-display text-3xl font-bold capitalize flex items-center gap-2 mt-1">
              {tc.icon} {tier}
            </h3>
          </div>
          <div className="text-right">
            <p className="text-white/70 text-sm">Points</p>
            <p className="font-display text-3xl font-bold">{loyalty?.loyalty_points || 0}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
            <p className="text-white/70 text-xs">Bookings</p>
            <p className="font-bold text-lg">{loyalty?.total_bookings || 0}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
            <p className="text-white/70 text-xs">Nights</p>
            <p className="font-bold text-lg">{loyalty?.total_nights || 0}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
            <p className="text-white/70 text-xs">Spent</p>
            <p className="font-bold text-lg">€{parseFloat(loyalty?.total_spent || 0).toFixed(0)}</p>
          </div>
        </div>
        {tc.next && (
          <div>
            <div className="flex items-center justify-between text-xs text-white/70 mb-1.5">
              <span>{tier}</span>
              <span>€{parseFloat(loyalty?.total_spent || 0).toFixed(0)} / €{tc.need}</span>
              <span>{tc.next}</span>
            </div>
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Link to="/customer/bookings" className="group p-5 bg-white rounded-2xl shadow-soft border border-surface-100 hover:shadow-card hover:translate-y-[-2px] transition-all">
          <HiOutlineCalendarDays className="w-8 h-8 text-primary-500 mb-3" />
          <p className="text-sm text-surface-500">My Bookings</p>
          <p className="text-2xl font-bold text-surface-900">{stats.bookings}</p>
        </Link>
        <Link to="/customer/referrals" className="group p-5 bg-white rounded-2xl shadow-soft border border-surface-100 hover:shadow-card hover:translate-y-[-2px] transition-all">
          <HiOutlineGift className="w-8 h-8 text-green-500 mb-3" />
          <p className="text-sm text-surface-500">Referrals Made</p>
          <p className="text-2xl font-bold text-surface-900">{stats.referrals}</p>
        </Link>
        <Link to="/search" className="group p-5 bg-white rounded-2xl shadow-soft border border-surface-100 hover:shadow-card hover:translate-y-[-2px] transition-all">
          <HiOutlineStar className="w-8 h-8 text-amber-500 mb-3" />
          <p className="text-sm text-surface-500">Book a Room</p>
          <p className="text-lg font-bold text-primary-600">Search Now →</p>
        </Link>
      </div>

      {/* Recent Bookings */}
      {recentBookings.length > 0 && (
        <div className="bg-white rounded-2xl shadow-soft border border-surface-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-surface-900">Recent Bookings</h3>
            <Link to="/customer/bookings" className="text-primary-600 text-sm font-medium hover:underline">View all →</Link>
          </div>
          <div className="space-y-3">
            {recentBookings.map(b => (
              <div key={b.id} className="flex items-center gap-4 p-3 rounded-xl bg-surface-50">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-surface-900 text-sm truncate">{b.property?.name}</p>
                  <p className="text-xs text-surface-500">Room {b.room?.room_number} · {b.check_in}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  b.status === 'confirmed' ? 'bg-blue-50 text-blue-700' :
                  b.status === 'checked_in' ? 'bg-green-50 text-green-700' :
                  'bg-surface-100 text-surface-600'
                }`}>
                  {b.status.replace('_', ' ')}
                </span>
                <span className="font-display font-bold text-primary-600">€{parseFloat(b.total_price).toFixed(0)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
