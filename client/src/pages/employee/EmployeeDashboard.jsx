import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bookingsAPI, roomsAPI, pointsAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import { HiOutlineCalendarDays, HiOutlineHomeModern, HiOutlineTrophy, HiOutlineBolt, HiOutlineCheckCircle, HiOutlineArrowRightOnRectangle } from 'react-icons/hi2';

const statusConfig = {
  confirmed:   { bg: 'bg-blue-50 text-blue-700', icon: '📋' },
  checked_in:  { bg: 'bg-green-50 text-green-700', icon: '✅' },
  checked_out: { bg: 'bg-surface-100 text-surface-600', icon: '🏁' }
};

export default function EmployeeDashboard() {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [points, setPoints] = useState({ total_points: 0, logs: [] });
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bookRes, roomRes, ptRes] = await Promise.all([
        bookingsAPI.getAll({ limit: 20 }).catch(() => ({ data: { bookings: [] } })),
        roomsAPI.search({}).catch(() => ({ data: { rooms: [] } })),
        pointsAPI.getMyPoints().catch(() => ({ data: { total_points: 0, logs: [] } }))
      ]);
      setBookings(bookRes.data.bookings || []);
      setRooms(roomRes.data.rooms || []);
      setPoints(ptRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await bookingsAPI.updateStatus(bookingId, newStatus);
      toast.success(`Booking ${newStatus.replace('_', ' ')}`);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    }
  };

  const handleAutoCheckIn = async () => {
    try {
      const res = await bookingsAPI.autoCheckIn({});
      toast.success(res.data.message);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Auto check-in failed');
    }
  };

  // Room stats
  const roomStats = rooms.reduce((acc, r) => { acc[r.status] = (acc[r.status] || 0) + 1; return acc; }, {});
  const today = new Date().toISOString().split('T')[0];
  const todayArrivals = bookings.filter(b => b.check_in && b.check_in.startsWith(today) && b.status === 'confirmed');
  const todayDepartures = bookings.filter(b => b.check_out && b.check_out.startsWith(today) && b.status === 'checked_in');
  const activeGuests = bookings.filter(b => b.status === 'checked_in');

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-surface-900">Operations Dashboard</h2>
          <p className="text-surface-500 text-sm mt-1">Welcome back, {user?.full_name?.split(' ')[0]}! 🏨</p>
        </div>
        <button
          onClick={handleAutoCheckIn}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors"
        >
          <HiOutlineBolt className="w-4 h-4" /> Auto Check-In
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-soft border border-surface-100 p-4">
          <div className="flex items-center gap-2 text-surface-500 text-sm mb-2"><HiOutlineCalendarDays className="w-4 h-4" /> Today Arrivals</div>
          <p className="font-display text-3xl font-bold text-amber-600">{todayArrivals.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-soft border border-surface-100 p-4">
          <div className="flex items-center gap-2 text-surface-500 text-sm mb-2"><HiOutlineArrowRightOnRectangle className="w-4 h-4" /> Today Departures</div>
          <p className="font-display text-3xl font-bold text-surface-600">{todayDepartures.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-soft border border-surface-100 p-4">
          <div className="flex items-center gap-2 text-surface-500 text-sm mb-2"><HiOutlineHomeModern className="w-4 h-4" /> Rooms Available</div>
          <p className="font-display text-3xl font-bold text-green-600">{roomStats.available || 0}<span className="text-surface-400 text-lg">/{rooms.length}</span></p>
        </div>
        <div className="bg-white rounded-xl shadow-soft border border-surface-100 p-4">
          <div className="flex items-center gap-2 text-surface-500 text-sm mb-2"><HiOutlineTrophy className="w-4 h-4" /> My Points</div>
          <p className="font-display text-3xl font-bold text-primary-600">{points.total_points}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Arrivals — actionable */}
        <div className="bg-white rounded-2xl shadow-soft border border-surface-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-surface-900">🛬 Arrivals ({todayArrivals.length})</h3>
            <Link to="/staff/rooms" className="text-primary-600 text-sm font-medium hover:underline">Room Map →</Link>
          </div>
          {todayArrivals.length === 0 ? (
            <p className="text-surface-400 text-sm py-4 text-center">No arrivals today</p>
          ) : todayArrivals.map(b => (
            <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200 mb-2 last:mb-0">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-surface-900 text-sm truncate">{b.user?.full_name}</p>
                <p className="text-xs text-surface-500">Room {b.room?.room_number} · {b.room?.type}</p>
              </div>
              <button
                onClick={() => handleStatusChange(b.id, 'checked_in')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition-colors"
              >
                <HiOutlineCheckCircle className="w-3.5 h-3.5" /> Check In
              </button>
            </div>
          ))}
        </div>

        {/* Active Guests */}
        <div className="bg-white rounded-2xl shadow-soft border border-surface-100 p-6">
          <h3 className="font-semibold text-surface-900 mb-4">🏨 Active Guests ({activeGuests.length})</h3>
          {activeGuests.length === 0 ? (
            <p className="text-surface-400 text-sm py-4 text-center">No guests checked in</p>
          ) : activeGuests.slice(0, 8).map(b => (
            <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl bg-green-50 border border-green-200 mb-2 last:mb-0">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-surface-900 text-sm truncate">{b.user?.full_name}</p>
                <p className="text-xs text-surface-500">Room {b.room?.room_number} · out {b.check_out}</p>
              </div>
              {b.check_out && b.check_out <= today && (
                <button
                  onClick={() => handleStatusChange(b.id, 'checked_out')}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-700 text-white text-xs font-semibold hover:bg-surface-800 transition-colors"
                >
                  Check Out
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Point Activity */}
      {points.logs && points.logs.length > 0 && (
        <div className="bg-white rounded-2xl shadow-soft border border-surface-100 p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-surface-900">🏆 Recent Points</h3>
            <Link to="/staff/points" className="text-primary-600 text-sm font-medium hover:underline">View all →</Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {points.logs.slice(0, 5).map(log => (
              <div key={log.id} className="flex-shrink-0 w-40 p-3 rounded-xl bg-surface-50 border border-surface-100">
                <span className={`text-sm font-bold ${log.points_change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {log.points_change > 0 ? '+' : ''}{log.points_change}
                </span>
                <p className="text-xs text-surface-500 mt-1 line-clamp-2">{log.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
