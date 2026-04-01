import { useEffect, useState } from 'react';
import { bookingsAPI } from '../../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { HiOutlineFunnel, HiOutlineArrowPath, HiOutlineCheckCircle, HiOutlineArrowRightOnRectangle, HiOutlineXCircle, HiOutlineBolt } from 'react-icons/hi2';

const statusConfig = {
  confirmed:   { color: 'bg-blue-50 text-blue-700 border-blue-200', icon: '📋', label: 'Confirmed' },
  checked_in:  { color: 'bg-green-50 text-green-700 border-green-200', icon: '✅', label: 'Checked In' },
  checked_out: { color: 'bg-surface-100 text-surface-600 border-surface-200', icon: '🏁', label: 'Checked Out' },
  cancelled:   { color: 'bg-red-50 text-red-600 border-red-200', icon: '❌', label: 'Cancelled' }
};

const nextAction = {
  confirmed:   [
    { status: 'checked_in', label: 'Check In', icon: HiOutlineCheckCircle, color: 'bg-green-600 hover:bg-green-700 text-white' },
    { status: 'cancelled', label: 'Cancel', icon: HiOutlineXCircle, color: 'bg-red-100 hover:bg-red-200 text-red-700' }
  ],
  checked_in:  [
    { status: 'checked_out', label: 'Check Out', icon: HiOutlineArrowRightOnRectangle, color: 'bg-surface-700 hover:bg-surface-800 text-white' }
  ],
  checked_out: [],
  cancelled:   []
};

export default function AdminBookings() {
  const [data, setData] = useState({ bookings: [], pagination: {} });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [actionInProgress, setActionInProgress] = useState(null);

  const loadBookings = (filter) => {
    setLoading(true);
    const params = { limit: 100 };
    if (filter) params.status = filter;
    bookingsAPI.getAll(params)
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadBookings(statusFilter); }, [statusFilter]);

  const handleStatusChange = async (bookingId, newStatus) => {
    setActionInProgress(bookingId);
    try {
      await bookingsAPI.updateStatus(bookingId, newStatus);
      toast.success(`Booking ${newStatus.replace('_', ' ')} successfully`);
      loadBookings(statusFilter);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleAutoCheckIn = async () => {
    try {
      const res = await bookingsAPI.autoCheckIn({});
      toast.success(res.data.message);
      loadBookings(statusFilter);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Auto check-in failed');
    }
  };

  const statusCounts = data.bookings.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h2 className="font-display text-2xl font-bold text-surface-900">
          Bookings <span className="text-surface-400 text-lg font-normal">({data.pagination.total || 0})</span>
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={handleAutoCheckIn}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors"
          >
            <HiOutlineBolt className="w-4 h-4" />
            Auto Check-In Today
          </button>
          <button
            onClick={() => loadBookings(statusFilter)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-surface-200 text-surface-600 text-sm hover:bg-surface-50 transition-colors"
          >
            <HiOutlineArrowPath className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setStatusFilter('')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${!statusFilter ? 'bg-primary-600 text-white shadow' : 'bg-white border border-surface-200 text-surface-600 hover:bg-surface-50'}`}
        >
          All
        </button>
        {Object.entries(statusConfig).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${statusFilter === key ? 'bg-primary-600 text-white shadow' : 'bg-white border border-surface-200 text-surface-600 hover:bg-surface-50'}`}
          >
            <span>{cfg.icon}</span>
            {cfg.label}
          </button>
        ))}
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl shadow-soft border border-surface-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-50">
              <tr>
                <th className="py-3 px-4 text-left font-medium text-surface-500">Guest</th>
                <th className="py-3 px-4 text-left font-medium text-surface-500">Property</th>
                <th className="py-3 px-4 text-left font-medium text-surface-500">Room</th>
                <th className="py-3 px-4 text-left font-medium text-surface-500">Check-in / Check-out</th>
                <th className="py-3 px-4 text-left font-medium text-surface-500">Total</th>
                <th className="py-3 px-4 text-left font-medium text-surface-500">Status</th>
                <th className="py-3 px-4 text-left font-medium text-surface-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="py-12 text-center text-surface-400">Loading...</td></tr>
              ) : data.bookings.length === 0 ? (
                <tr><td colSpan="7" className="py-12 text-center text-surface-400">No bookings found</td></tr>
              ) : data.bookings.map(b => {
                const cfg = statusConfig[b.status];
                const actions = nextAction[b.status] || [];
                const isToday = b.check_in && new Date(b.check_in).toISOString().split('T')[0] <= new Date().toISOString().split('T')[0];
                return (
                  <tr key={b.id} className={`border-t border-surface-100 hover:bg-surface-50 transition-colors ${b.status === 'confirmed' && isToday ? 'bg-amber-50/50' : ''}`}>
                    <td className="py-3 px-4">
                      <p className="font-medium text-surface-900">{b.user?.full_name}</p>
                      <p className="text-xs text-surface-400">{b.user?.email}</p>
                    </td>
                    <td className="py-3 px-4 text-surface-600">{b.property?.name}</td>
                    <td className="py-3 px-4 font-mono font-medium">{b.room?.room_number}</td>
                    <td className="py-3 px-4 text-surface-600 text-xs">
                      <div>{format(new Date(b.check_in), 'MMM d, yyyy')}</div>
                      <div className="text-surface-400">{format(new Date(b.check_out), 'MMM d, yyyy')}</div>
                    </td>
                    <td className="py-3 px-4 font-display font-bold text-primary-600">€{parseFloat(b.total_price).toFixed(0)}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.color}`}>
                        {cfg.icon} {cfg.label}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        {actions.map(action => {
                          const Icon = action.icon;
                          return (
                            <button
                              key={action.status}
                              onClick={() => handleStatusChange(b.id, action.status)}
                              disabled={actionInProgress === b.id}
                              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${action.color} disabled:opacity-50`}
                            >
                              <Icon className="w-3.5 h-3.5" />
                              {action.label}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
