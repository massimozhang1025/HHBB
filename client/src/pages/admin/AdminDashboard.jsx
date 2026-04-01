import { useEffect, useState } from 'react';
import { analyticsAPI } from '../../services/api';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import {
  HiOutlineCalendarDays, HiOutlineBanknotes, HiOutlineBuildingOffice2,
  HiOutlineUsers, HiOutlineSquares2X2, HiOutlineGift,
  HiOutlineChartBar, HiOutlineArrowTrendingUp
} from 'react-icons/hi2';

const CHART_COLORS = [
  '#3b82f6', // primary blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#f43f5e', // rose
  '#06b6d4', // cyan
];

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-900 text-white px-4 py-3 rounded-xl shadow-elevated text-sm">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: entry.color }} />
          <span className="text-surface-300">{entry.name}:</span>
          <span className="font-semibold">
            {entry.name.toLowerCase().includes('revenue')
              ? `€${Number(entry.value).toLocaleString()}`
              : entry.value}
          </span>
        </p>
      ))}
    </div>
  );
};

export default function AdminDashboard() {
  const [kpi, setKpi] = useState(null);
  const [trends, setTrends] = useState([]);
  const [propertyPerf, setPropertyPerf] = useState([]);
  const [employeeRank, setEmployeeRank] = useState([]);
  const [trendPeriod, setTrendPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsAPI.getDashboard().then(r => setKpi(r.data.kpi)).catch(() => {}),
      analyticsAPI.getBookingTrends({ period: trendPeriod }).then(r => setTrends(r.data.trends)).catch(() => {}),
      analyticsAPI.getPropertyPerformance().then(r => setPropertyPerf(r.data.properties)).catch(() => {}),
      analyticsAPI.getEmployeeRanking().then(r => setEmployeeRank(r.data.employees)).catch(() => {})
    ]).finally(() => setLoading(false));
  }, [trendPeriod]);

  // Compute room status distribution for Pie chart
  const roomStatusData = kpi ? [
    { name: 'Available', value: kpi.totalRooms - kpi.occupiedRooms, color: '#10b981' },
    { name: 'Occupied', value: kpi.occupiedRooms, color: '#3b82f6' },
  ].filter(d => d.value > 0) : [];

  // Prepare property performance for Horizontal Bar
  const propertyChartData = propertyPerf.map(p => ({
    name: p.name?.length > 12 ? p.name.slice(0, 12) + '…' : p.name,
    fullName: p.name,
    bookings: parseInt(p.booking_count) || 0,
    revenue: parseFloat(p.total_revenue) || 0,
  }));

  // Prepare employee leaderboard for Bar chart (top 8)
  const empChartData = employeeRank.slice(0, 8).map(e => ({
    name: e.user?.full_name?.split(' ')[0] || 'Staff',
    fullName: e.user?.full_name || 'Staff',
    points: e.total_points || 0,
    property: e.property?.name || '',
  }));

  const kpiCards = kpi ? [
    { icon: HiOutlineCalendarDays, label: 'Total Bookings', value: kpi.totalBookings, sub: `+${kpi.recentBookings} this month`, color: 'primary' },
    { icon: HiOutlineBanknotes, label: 'Total Revenue', value: `€${kpi.totalRevenue?.toLocaleString()}`, sub: `€${kpi.recentRevenue?.toLocaleString()} this month`, color: 'success' },
    { icon: HiOutlineSquares2X2, label: 'Occupancy Rate', value: `${kpi.occupancyRate}%`, sub: `${kpi.occupiedRooms}/${kpi.totalRooms} rooms`, color: 'warning' },
    { icon: HiOutlineBuildingOffice2, label: 'Properties', value: kpi.totalProperties, sub: 'Active locations', color: 'accent' },
    { icon: HiOutlineUsers, label: 'Employees', value: kpi.totalEmployees, sub: 'Active staff', color: 'primary' },
    { icon: HiOutlineGift, label: 'Active Referrals', value: kpi.activeReferrals, sub: 'Pending completion', color: 'success' }
  ] : [];

  if (loading && !kpi) {
    return (
      <div className="animate-fade-in flex flex-col gap-4 p-8">
        {[1,2,3].map(row => (
          <div key={row} className="grid grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="h-28 bg-surface-100 animate-pulse rounded-2xl" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-surface-900 flex items-center gap-2">
            <HiOutlineChartBar className="w-7 h-7 text-primary-500" />
            Analytics Dashboard
          </h2>
          <p className="text-surface-500 text-sm mt-1">Real-time KPIs and business insights</p>
        </div>
      </div>

      {/* ═══════════════ KPI Cards ═══════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiCards.map(card => (
          <div key={card.label} className="bg-white rounded-2xl shadow-soft border border-surface-100 p-5 hover:shadow-card transition-all duration-300 hover:-translate-y-0.5">
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

      {/* ═══════════════ Chart Row 1: Revenue Trends + Room Status ═══════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue & Booking Trends (Area + Bar combo) */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-soft border border-surface-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-surface-900 flex items-center gap-2">
              <HiOutlineArrowTrendingUp className="w-5 h-5 text-primary-500" />
              Booking & Revenue Trends
            </h3>
            <div className="flex gap-1 bg-surface-100 rounded-lg p-0.5">
              {['7d', '30d', '90d'].map(p => (
                <button
                  key={p}
                  onClick={() => setTrendPeriod(p)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    trendPeriod === p
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-surface-500 hover:text-surface-700'
                  }`}
                >
                  {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : '90 Days'}
                </button>
              ))}
            </div>
          </div>

          {trends.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradBookings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickFormatter={v => {
                    const d = new Date(v);
                    return `${d.getDate()}/${d.getMonth() + 1}`;
                  }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => `€${v}`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  height={36}
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '12px', color: '#64748b' }}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#3b82f6"
                  fill="url(#gradRevenue)"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 2, fill: '#fff' }}
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="count"
                  name="Bookings"
                  stroke="#10b981"
                  fill="url(#gradBookings)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-surface-400">
              <HiOutlineChartBar className="w-10 h-10 mb-2 opacity-40" />
              <p className="text-sm">No trend data yet. Create bookings to see analytics.</p>
            </div>
          )}
        </div>

        {/* Room Status Pie Chart */}
        <div className="bg-white rounded-2xl shadow-soft border border-surface-100 p-6">
          <h3 className="font-semibold text-surface-900 mb-5">Room Status</h3>
          {roomStatusData.length > 0 ? (
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={roomStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {roomStatusData.map((entry, i) => (
                      <Cell key={`cell-${i}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="bg-surface-900 text-white px-3 py-2 rounded-lg text-sm shadow-elevated">
                          <p className="font-semibold">{d.name}: {d.value} rooms</p>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Legend */}
              <div className="flex gap-6 -mt-2">
                {roomStatusData.map(d => (
                  <div key={d.name} className="flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                    <span className="text-surface-600">{d.name}</span>
                    <span className="font-bold text-surface-900">{d.value}</span>
                  </div>
                ))}
              </div>

              {/* Center stat */}
              {kpi && (
                <div className="mt-4 text-center">
                  <p className="text-3xl font-display font-bold text-surface-900">{kpi.occupancyRate}%</p>
                  <p className="text-xs text-surface-400">Occupancy Rate</p>
                </div>
              )}
            </div>
          ) : (
            <div className="h-56 flex items-center justify-center text-surface-400 text-sm">
              No room data available
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════ Chart Row 2: Property Performance + Employee Leaderboard ═══════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Property Revenue Bar Chart */}
        <div className="bg-white rounded-2xl shadow-soft border border-surface-100 p-6">
          <h3 className="font-semibold text-surface-900 mb-5 flex items-center gap-2">
            <HiOutlineBuildingOffice2 className="w-5 h-5 text-accent-500" />
            Revenue by Property
          </h3>
          {propertyChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={propertyChartData} layout="vertical" barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickFormatter={v => `€${v.toLocaleString()}`}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 12, fill: '#475569', fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  width={110}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-surface-900 text-white px-4 py-3 rounded-xl shadow-elevated text-sm">
                        <p className="font-semibold mb-1">{d.fullName}</p>
                        <p><span className="text-surface-300">Revenue:</span> <span className="font-bold">€{d.revenue.toLocaleString()}</span></p>
                        <p><span className="text-surface-300">Bookings:</span> <span className="font-bold">{d.bookings}</span></p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="revenue" name="Revenue" radius={[0, 8, 8, 0]}>
                  {propertyChartData.map((_, i) => (
                    <Cell key={`bar-${i}`} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-surface-400 text-sm">
              No property data available
            </div>
          )}
        </div>

        {/* Employee Points Leaderboard */}
        <div className="bg-white rounded-2xl shadow-soft border border-surface-100 p-6">
          <h3 className="font-semibold text-surface-900 mb-5 flex items-center gap-2">
            <HiOutlineUsers className="w-5 h-5 text-primary-500" />
            Employee Points Leaderboard
          </h3>
          {empChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={empChartData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#475569', fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-surface-900 text-white px-4 py-3 rounded-xl shadow-elevated text-sm">
                        <p className="font-semibold">{d.fullName}</p>
                        <p className="text-surface-300">{d.property}</p>
                        <p className="mt-1"><span className="font-bold text-lg">{d.points}</span> pts</p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="points" name="Points" radius={[8, 8, 0, 0]}>
                  {empChartData.map((_, i) => (
                    <Cell key={`emp-${i}`} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-surface-400 text-sm">
              No employee data available
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════ Property Summary Table ═══════════════ */}
      {propertyPerf.length > 0 && (
        <div className="bg-white rounded-2xl shadow-soft border border-surface-100 p-6">
          <h3 className="font-semibold text-surface-900 mb-4">Property Performance Summary</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-surface-500 border-b border-surface-100">
                  <th className="pb-3 font-medium">Property</th>
                  <th className="pb-3 font-medium">City</th>
                  <th className="pb-3 font-medium text-right">Bookings</th>
                  <th className="pb-3 font-medium text-right">Revenue</th>
                  <th className="pb-3 font-medium text-right">Avg / Booking</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-50">
                {propertyPerf.map((p, i) => {
                  const bookings = parseInt(p.booking_count) || 0;
                  const revenue = parseFloat(p.total_revenue) || 0;
                  const avg = bookings > 0 ? (revenue / bookings) : 0;
                  return (
                    <tr key={p.id || i} className="hover:bg-surface-50 transition-colors">
                      <td className="py-3 font-medium text-surface-900 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                        {p.name}
                      </td>
                      <td className="py-3 text-surface-500">{p.city || '—'}</td>
                      <td className="py-3 text-right font-semibold text-surface-900">{bookings}</td>
                      <td className="py-3 text-right font-semibold text-primary-600">€{revenue.toLocaleString()}</td>
                      <td className="py-3 text-right text-surface-500">€{avg.toFixed(0)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
