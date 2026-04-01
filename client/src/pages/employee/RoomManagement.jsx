import { useEffect, useState } from 'react';
import { roomsAPI, bookingsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { HiOutlineArrowPath, HiOutlineBolt, HiOutlineFunnel } from 'react-icons/hi2';

const statusConfig = {
  available:   { color: 'bg-green-50 border-green-300 text-green-800', dot: 'bg-green-500', label: 'Available', next: 'occupied' },
  occupied:    { color: 'bg-red-50 border-red-300 text-red-800', dot: 'bg-red-500', label: 'Occupied', next: 'cleaning' },
  cleaning:    { color: 'bg-yellow-50 border-yellow-300 text-yellow-800', dot: 'bg-yellow-500', label: 'Cleaning', next: 'available' },
  maintenance: { color: 'bg-surface-100 border-surface-400 text-surface-600', dot: 'bg-surface-500', label: 'Maintenance', next: 'available' }
};

const typeIcons = { single: '🛏️', double: '🛏️🛏️', suite: '👑', family: '👨‍👩‍👧‍👦' };

export default function RoomManagement() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [propertyFilter, setPropertyFilter] = useState('');

  const loadRooms = () => {
    setLoading(true);
    roomsAPI.search({}).then(res => setRooms(res.data.rooms)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { loadRooms(); }, []);

  const handleStatusChange = async (roomId, newStatus) => {
    try {
      await roomsAPI.updateStatus(roomId, newStatus);
      toast.success(`Room status → ${newStatus}`);
      loadRooms();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update');
    }
  };

  const handleAutoCheckIn = async () => {
    try {
      const res = await bookingsAPI.autoCheckIn({});
      toast.success(res.data.message);
      loadRooms();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Auto check-in failed');
    }
  };

  // Count stats
  const stats = rooms.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  // Get unique properties
  const properties = [...new Set(rooms.map(r => r.property?.name).filter(Boolean))];

  // Apply filters
  let filtered = rooms;
  if (filter) filtered = filtered.filter(r => r.status === filter);
  if (propertyFilter) filtered = filtered.filter(r => r.property?.name === propertyFilter);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h2 className="font-display text-2xl font-bold text-surface-900">Room Management</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleAutoCheckIn}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors"
          >
            <HiOutlineBolt className="w-4 h-4" /> Auto Check-In
          </button>
          <button onClick={loadRooms} className="p-2 rounded-xl border border-surface-200 hover:bg-surface-50 transition-colors">
            <HiOutlineArrowPath className="w-5 h-5 text-surface-500" />
          </button>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {Object.entries(statusConfig).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => setFilter(filter === key ? '' : key)}
            className={`rounded-xl p-3 text-center border-2 transition-all ${filter === key ? 'ring-2 ring-primary-400 border-primary-400' : cfg.color}`}
          >
            <span className={`inline-block w-2.5 h-2.5 rounded-full ${cfg.dot} mr-1.5`} />
            <span className="text-sm font-semibold">{cfg.label}</span>
            <p className="font-display text-2xl font-bold mt-1">{stats[key] || 0}</p>
          </button>
        ))}
      </div>

      {/* Property Filter */}
      {properties.length > 1 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setPropertyFilter('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!propertyFilter ? 'bg-primary-600 text-white' : 'bg-white border border-surface-200 text-surface-600 hover:bg-surface-50'}`}
          >
            All Properties
          </button>
          {properties.map(p => (
            <button
              key={p}
              onClick={() => setPropertyFilter(propertyFilter === p ? '' : p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${propertyFilter === p ? 'bg-primary-600 text-white' : 'bg-white border border-surface-200 text-surface-600 hover:bg-surface-50'}`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Room Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
        {filtered.map(room => {
          const config = statusConfig[room.status];
          return (
            <div
              key={room.id}
              className={`rounded-xl border-2 p-3 text-center cursor-pointer hover:shadow-card hover:scale-105 transition-all duration-200 ${config.color}`}
              onClick={() => handleStatusChange(room.id, config.next)}
            >
              <p className="font-mono font-bold text-lg leading-none">{room.room_number}</p>
              <p className="text-xs mt-1.5">{typeIcons[room.type] || '🏠'}</p>
              <div className="flex items-center justify-center gap-1 mt-2">
                <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                <span className="text-[10px] font-semibold">{config.label}</span>
              </div>
              <p className="text-[9px] mt-1 opacity-50">F{room.floor} · €{parseFloat(room.price_per_night).toFixed(0)}</p>
              <p className="text-[9px] mt-0.5 opacity-40">→ {statusConfig[config.next]?.label}</p>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-surface-400">
          No rooms match your filters
        </div>
      )}
    </div>
  );
}
