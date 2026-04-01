import { useEffect, useState } from 'react';
import { bookingsAPI } from '../../services/api';
import { format, isPast, isFuture, isToday } from 'date-fns';
import toast from 'react-hot-toast';
import { HiOutlineXCircle, HiOutlineCalendarDays, HiOutlineCheckCircle } from 'react-icons/hi2';

const statusConfig = {
  confirmed:   { bg: 'bg-blue-50 text-blue-700 border-blue-200', icon: '📋', label: 'Confirmed' },
  checked_in:  { bg: 'bg-green-50 text-green-700 border-green-200', icon: '✅', label: 'Checked In' },
  checked_out: { bg: 'bg-surface-100 text-surface-600 border-surface-200', icon: '🏁', label: 'Checked Out' },
  cancelled:   { bg: 'bg-red-50 text-red-600 border-red-200', icon: '❌', label: 'Cancelled' }
};

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);

  const loadBookings = () => {
    setLoading(true);
    bookingsAPI.getMyBookings()
      .then(res => setBookings(res.data.bookings))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadBookings(); }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setCancelling(bookingId);
    try {
      await bookingsAPI.cancel(bookingId);
      toast.success('Booking cancelled');
      loadBookings();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Cancel failed');
    } finally {
      setCancelling(null);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;

  // Split into upcoming and past
  const upcoming = bookings.filter(b => ['confirmed', 'checked_in'].includes(b.status));
  const past = bookings.filter(b => ['checked_out', 'cancelled'].includes(b.status));

  return (
    <div className="animate-fade-in">
      <h2 className="font-display text-2xl font-bold text-surface-900 mb-6">My Bookings</h2>

      {bookings.length === 0 ? (
        <div className="text-center py-16">
          <HiOutlineCalendarDays className="w-16 h-16 mx-auto mb-4 text-surface-300" />
          <h3 className="text-lg font-semibold text-surface-700 mb-2">No bookings yet</h3>
          <a href="/search" className="text-primary-600 font-semibold hover:underline">Search rooms →</a>
        </div>
      ) : (
        <>
          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-surface-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <HiOutlineCalendarDays className="w-4 h-4" /> Upcoming ({upcoming.length})
              </h3>
              <div className="space-y-4">
                {upcoming.map(b => {
                  const cfg = statusConfig[b.status];
                  const checkInDate = new Date(b.check_in);
                  const isCheckInToday = isToday(checkInDate);
                  return (
                    <div key={b.id} className={`bg-white rounded-xl shadow-soft border overflow-hidden ${isCheckInToday ? 'border-amber-300 ring-2 ring-amber-100' : 'border-surface-100'}`}>
                      {isCheckInToday && (
                        <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-white text-xs font-semibold text-center py-1">
                          🔔 Check-in Today!
                        </div>
                      )}
                      <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-surface-900">{b.property?.name}</h3>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.bg}`}>{cfg.icon} {cfg.label}</span>
                          </div>
                          <p className="text-sm text-surface-500">Room {b.room?.room_number} · {b.room?.type}</p>
                          <p className="text-sm text-surface-500 mt-1">
                            {format(new Date(b.check_in), 'MMM d')} → {format(new Date(b.check_out), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="font-display text-xl font-bold text-primary-600">€{parseFloat(b.total_price).toFixed(0)}</p>
                          {b.status === 'confirmed' && (
                            <button
                              onClick={() => handleCancel(b.id)}
                              disabled={cancelling === b.id}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-xs font-semibold hover:bg-red-200 transition-colors disabled:opacity-50"
                            >
                              <HiOutlineXCircle className="w-3.5 h-3.5" />
                              {cancelling === b.id ? 'Cancelling...' : 'Cancel'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Past */}
          {past.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-surface-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <HiOutlineCheckCircle className="w-4 h-4" /> Past ({past.length})
              </h3>
              <div className="space-y-3">
                {past.map(b => {
                  const cfg = statusConfig[b.status];
                  return (
                    <div key={b.id} className="bg-white rounded-xl shadow-soft border border-surface-100 p-5 flex flex-col sm:flex-row sm:items-center gap-4 opacity-70">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-surface-900">{b.property?.name}</h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.bg}`}>{cfg.icon} {cfg.label}</span>
                        </div>
                        <p className="text-sm text-surface-500">Room {b.room?.room_number} · {b.room?.type}</p>
                        <p className="text-sm text-surface-500 mt-1">
                          {format(new Date(b.check_in), 'MMM d')} → {format(new Date(b.check_out), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-xl font-bold text-surface-400">€{parseFloat(b.total_price).toFixed(0)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
