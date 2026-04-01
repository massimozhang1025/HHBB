import { useEffect, useState } from 'react';
import { pointsAPI } from '../../services/api';
import { HiOutlineStar, HiOutlineArrowTrendingUp, HiOutlineArrowTrendingDown, HiOutlineTrophy } from 'react-icons/hi2';

export default function MyPoints() {
  const [data, setData] = useState({ total_points: 0, logs: [] });
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      pointsAPI.getMyPoints().catch(() => ({ data: { total_points: 0, logs: [] } })),
      pointsAPI.getLeaderboard().catch(() => ({ data: { leaderboard: [] } }))
    ]).then(([ptRes, lbRes]) => {
      setData(ptRes.data);
      setLeaderboard(lbRes.data.leaderboard || []);
    }).finally(() => setLoading(false));
  }, []);

  // Stats from logs
  const earned = data.logs.filter(l => l.points_change > 0).reduce((sum, l) => sum + l.points_change, 0);
  const deducted = data.logs.filter(l => l.points_change < 0).reduce((sum, l) => sum + Math.abs(l.points_change), 0);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="animate-fade-in">
      <h2 className="font-display text-2xl font-bold text-surface-900 mb-6">My Points</h2>

      {/* Points Hero */}
      <div className="bg-gradient-to-r from-primary-600 to-accent-600 rounded-2xl p-8 text-white mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <HiOutlineStar className="w-7 h-7" />
          </div>
          <div>
            <p className="text-primary-100 text-sm">Total Points</p>
            <p className="text-4xl font-display font-bold">{data.total_points}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <p className="text-white/70 text-xs">Total Earned</p>
            <p className="font-bold text-lg text-green-300">+{earned}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <p className="text-white/70 text-xs">Total Deducted</p>
            <p className="font-bold text-lg text-red-300">-{deducted}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Point History */}
        <div className="lg:col-span-2">
          <h3 className="font-semibold text-surface-900 mb-4">📜 Point History</h3>
          <div className="space-y-2">
            {data.logs.length === 0 ? (
              <p className="text-surface-500 text-sm py-8 text-center">No point activity yet.</p>
            ) : data.logs.map(log => (
              <div key={log.id} className="bg-white rounded-xl border border-surface-100 p-4 flex items-center gap-4 hover:shadow-soft transition-shadow">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${log.points_change >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                  {log.points_change >= 0 ? <HiOutlineArrowTrendingUp className="w-5 h-5 text-green-600" /> : <HiOutlineArrowTrendingDown className="w-5 h-5 text-red-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-900 truncate">{log.reason}</p>
                  <p className="text-xs text-surface-500 capitalize">{log.type.replace(/_/g, ' ')}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`font-bold ${log.points_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {log.points_change > 0 ? '+' : ''}{log.points_change}
                  </p>
                  <p className="text-xs text-surface-400">Balance: {log.balance_after}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div>
          <h3 className="font-semibold text-surface-900 mb-4">🏆 Leaderboard</h3>
          <div className="bg-white rounded-2xl border border-surface-100 overflow-hidden shadow-soft">
            {leaderboard.map((entry, idx) => (
              <div key={idx} className={`flex items-center gap-3 px-4 py-3 ${idx < leaderboard.length - 1 ? 'border-b border-surface-50' : ''} ${entry.points === data.total_points ? 'bg-primary-50' : ''}`}>
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                  idx === 1 ? 'bg-gray-100 text-gray-600' :
                  idx === 2 ? 'bg-amber-100 text-amber-700' :
                  'bg-surface-100 text-surface-500'
                }`}>
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-900 truncate">{entry.name}</p>
                  <p className="text-xs text-surface-400 capitalize">{entry.position}</p>
                </div>
                <span className="font-display font-bold text-sm text-primary-600">{entry.points}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
