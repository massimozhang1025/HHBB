import { useEffect, useState } from 'react';
import { analyticsAPI } from '../../services/api';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { HiOutlineCalendarDays, HiOutlineBanknotes, HiOutlineBuildingOffice2, HiOutlineUsers, HiOutlineSquares2X2, HiOutlineGift } from 'react-icons/hi2';

export default function AdminDashboard() {
  const [kpi, setKpi] = useState(null);
  const [trends, setTrends] = useState([]);

  useEffect(() => {
    analyticsAPI.getDashboard().then(res => setKpi(res.data.kpi)).catch(() => {});
    analyticsAPI.getBookingTrends({ period: '30d' }).then(res => setTrends(res.data.trends)).catch(() => {});
  }, []);

  const kpiCards = kpi ? [
    { icon: HiOutlineCalendarDays, label: 'Total Bookings', value: kpi.totalBookings, sub: `+${kpi.recentBookings} this month`, color: 'primary' },
    { icon: HiOutlineBanknotes, label: 'Total Revenue', value: `€${kpi.totalRevenue?.toLocaleString()}`, sub: `€${kpi.recentRevenue?.toLocaleString()} this month`, color: 'success' },
    { icon: HiOutlineSquares2X2, label: 'Occupancy Rate', value: `${kpi.occupancyRate}%`, sub: `${kpi.occupiedRooms}/${kpi.totalRooms} rooms`, color: 'warning' },
    { icon: HiOutlineBuildingOffice2, label: 'Properties', value: kpi.totalProperties, sub: 'Active locations', color: 'accent' },
    { icon: HiOutlineUsers, label: 'Employees', value: kpi.totalEmployees, sub: 'Active staff', color: 'primary' },
    { icon: HiOutlineGift, label: 'Active Referrals', value: kpi.activeReferrals, sub: 'Pending completion', color: 'success' }
  ] : [];

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold text-surface-900">Dashboard</h2>
        <p className="text-surface-500 text-sm mt-1">Overview of your hotel management system</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiCards.map(card => (
          <div key={card.label} className="bg-white rounded-2xl shadow-soft border border-surface-100 p-5 hover:shadow-card transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-surface-500 mb-1">{card.label}</p>
                <p className="text-2xl font-display font-bold text-surface-900">{card.value}</p>
                <p className="text-xs text-surface-400 mt-1">{card.sub}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl bg-${card.color}-50 flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 text-${card.color}-600`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl shadow-soft border border-surface-100 p-6">
        <h3 className="font-semibold text-surface-900 mb-4">Booking Trends (30 days)</h3>
        {trends.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trends}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-surface-400 text-sm">
            No data available. Start the backend and create some bookings.
          </div>
        )}
      </div>
    </div>
  );
}
