import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineMagnifyingGlass, HiOutlineMapPin, HiOutlineCalendarDays, HiOutlineUserGroup, HiOutlineHomeModern, HiOutlineCurrencyEuro } from 'react-icons/hi2';
import { roomsAPI, propertiesAPI, bookingsAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

export default function SearchPage() {
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const [rooms, setRooms] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookingModal, setBookingModal] = useState(null);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [filters, setFilters] = useState({
    property_id: new URLSearchParams(window.location.search).get('property_id') || '',
    type: '',
    check_in: '',
    check_out: '',
    capacity: ''
  });

  useEffect(() => {
    propertiesAPI.getAll().then(res => setProperties(res.data.properties)).catch(() => {});
    handleSearch();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.property_id) params.property_id = filters.property_id;
      if (filters.type) params.type = filters.type;
      if (filters.check_in) params.check_in = filters.check_in;
      if (filters.check_out) params.check_out = filters.check_out;
      if (filters.capacity) params.capacity = filters.capacity;
      const res = await roomsAPI.search(params);
      setRooms(res.data.rooms);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookRoom = (room) => {
    if (!token) {
      toast.error('Please sign in to book a room');
      navigate('/login');
      return;
    }
    if (!filters.check_in || !filters.check_out) {
      toast.error('Please select check-in and check-out dates first');
      return;
    }
    setBookingModal(room);
  };

  const confirmBooking = async () => {
    if (!bookingModal) return;
    setBookingInProgress(true);
    try {
      const nights = Math.ceil(
        (new Date(filters.check_out) - new Date(filters.check_in)) / (1000 * 60 * 60 * 24)
      );
      await bookingsAPI.create({
        room_id: bookingModal.id,
        check_in: filters.check_in,
        check_out: filters.check_out,
        guests: parseInt(filters.capacity) || 1
      });
      toast.success(`Booking confirmed! ${nights} night(s) at €${(bookingModal.price_per_night * nights).toFixed(0)}`);
      setBookingModal(null);
      handleSearch(); // Refresh availability
    } catch (err) {
      toast.error(err.response?.data?.error || 'Booking failed');
    } finally {
      setBookingInProgress(false);
    }
  };

  const roomTypeLabel = { single: 'Single', double: 'Double', suite: 'Suite', family: 'Family' };
  const roomTypeColors = {
    single: 'bg-blue-50 text-blue-700',
    double: 'bg-green-50 text-green-700',
    suite: 'bg-purple-50 text-purple-700',
    family: 'bg-orange-50 text-orange-700'
  };

  const nights = (filters.check_in && filters.check_out)
    ? Math.max(1, Math.ceil((new Date(filters.check_out) - new Date(filters.check_in)) / 86400000))
    : null;

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Search Header */}
      <div className="bg-white border-b border-surface-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-3">
            <select
              value={filters.property_id}
              onChange={e => setFilters({ ...filters, property_id: e.target.value })}
              className="px-4 py-2.5 rounded-xl border border-surface-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            >
              <option value="">All Properties</option>
              {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select
              value={filters.type}
              onChange={e => setFilters({ ...filters, type: e.target.value })}
              className="px-4 py-2.5 rounded-xl border border-surface-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            >
              <option value="">All Room Types</option>
              {Object.entries(roomTypeLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <input
              type="date" value={filters.check_in}
              onChange={e => setFilters({ ...filters, check_in: e.target.value })}
              className="px-4 py-2.5 rounded-xl border border-surface-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            />
            <input
              type="date" value={filters.check_out}
              onChange={e => setFilters({ ...filters, check_out: e.target.value })}
              className="px-4 py-2.5 rounded-xl border border-surface-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            />
            <input
              type="number" min="1" max="10" value={filters.capacity}
              onChange={e => setFilters({ ...filters, capacity: e.target.value })}
              placeholder="Guests"
              className="w-24 px-4 py-2.5 rounded-xl border border-surface-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            />
            <button
              onClick={handleSearch}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors"
            >
              <HiOutlineMagnifyingGlass className="w-4 h-4" />
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-bold text-surface-900">
            {loading ? 'Searching...' : `${rooms.length} rooms available`}
          </h2>
          {nights && (
            <span className="text-sm text-surface-500 bg-surface-100 px-3 py-1 rounded-full">
              {nights} night{nights > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 rounded-2xl bg-surface-200 animate-pulse" />
            ))}
          </div>
        ) : rooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map(room => (
              <div key={room.id} className="bg-white rounded-2xl shadow-soft border border-surface-100 overflow-hidden hover:shadow-card hover:translate-y-[-2px] transition-all duration-300">
                <div className="h-40 bg-gradient-to-br from-primary-300 to-accent-300 relative">
                  <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${roomTypeColors[room.type]}`}>
                      {roomTypeLabel[room.type]}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1 rounded-full bg-white/90 text-surface-700 text-xs font-semibold">
                      Room {room.room_number}
                    </span>
                  </div>
                  {nights && (
                    <div className="absolute bottom-3 right-3">
                      <span className="px-3 py-1 rounded-full bg-black/50 text-white text-xs font-semibold backdrop-blur-sm">
                        Total: €{(parseFloat(room.price_per_night) * nights).toFixed(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-1.5 text-surface-500 text-sm mb-2">
                    <HiOutlineMapPin className="w-4 h-4" />
                    <span>{room.property?.name || 'Property'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-surface-600 mb-4">
                    <span className="flex items-center gap-1">
                      <HiOutlineUserGroup className="w-4 h-4" />
                      Up to {room.capacity}
                    </span>
                    {room.floor && <span>Floor {room.floor}</span>}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-surface-100">
                    <div>
                      <span className="font-display text-2xl font-bold text-primary-600">€{parseFloat(room.price_per_night).toFixed(0)}</span>
                      <span className="text-surface-400 text-xs">/night</span>
                    </div>
                    <button
                      onClick={() => handleBookRoom(room)}
                      className="px-5 py-2 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <HiOutlineCalendarDays className="w-16 h-16 mx-auto mb-4 text-surface-300" />
            <h3 className="text-lg font-semibold text-surface-700 mb-2">No rooms found</h3>
            <p className="text-surface-500">Try adjusting your search filters.</p>
          </div>
        )}
      </div>

      {/* Booking Confirmation Modal */}
      {bookingModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setBookingModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in" onClick={e => e.stopPropagation()}>
            <h3 className="font-display text-xl font-bold text-surface-900 mb-4">Confirm Booking</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between py-2 border-b border-surface-100">
                <span className="text-sm text-surface-500 flex items-center gap-2"><HiOutlineHomeModern className="w-4 h-4" /> Property</span>
                <span className="text-sm font-medium text-surface-900">{bookingModal.property?.name}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-surface-100">
                <span className="text-sm text-surface-500">Room</span>
                <span className="text-sm font-mono font-medium text-surface-900">{bookingModal.room_number} · {roomTypeLabel[bookingModal.type]}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-surface-100">
                <span className="text-sm text-surface-500 flex items-center gap-2"><HiOutlineCalendarDays className="w-4 h-4" /> Dates</span>
                <span className="text-sm font-medium text-surface-900">{filters.check_in} → {filters.check_out}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-surface-100">
                <span className="text-sm text-surface-500">Nights</span>
                <span className="text-sm font-medium text-surface-900">{nights}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-surface-100">
                <span className="text-sm text-surface-500 flex items-center gap-2"><HiOutlineCurrencyEuro className="w-4 h-4" /> Rate</span>
                <span className="text-sm font-medium text-surface-900">€{parseFloat(bookingModal.price_per_night).toFixed(0)}/night</span>
              </div>
              <div className="flex items-center justify-between py-3 bg-primary-50 rounded-xl px-4 -mx-1">
                <span className="font-semibold text-primary-800">Total</span>
                <span className="font-display text-2xl font-bold text-primary-600">€{(parseFloat(bookingModal.price_per_night) * nights).toFixed(0)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setBookingModal(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-surface-200 text-surface-600 text-sm font-semibold hover:bg-surface-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmBooking}
                disabled={bookingInProgress}
                className="flex-1 px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors disabled:opacity-60"
              >
                {bookingInProgress ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
