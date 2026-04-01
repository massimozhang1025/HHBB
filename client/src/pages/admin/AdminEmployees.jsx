import { useEffect, useState } from 'react';
import { analyticsAPI, pointsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { HiOutlineTrophy, HiOutlinePlusCircle, HiOutlineMinusCircle, HiOutlineXMark, HiOutlineArrowsUpDown } from 'react-icons/hi2';

export default function AdminEmployees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pointModal, setPointModal] = useState(null);
  const [pointForm, setPointForm] = useState({ points: '', type: 'manual_bonus', reason: '' });
  const [adjusting, setAdjusting] = useState(false);
  const [pointHistory, setPointHistory] = useState(null);

  const loadEmployees = () => {
    setLoading(true);
    analyticsAPI.getEmployeeRanking()
      .then(r => setEmployees(r.data.employees))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadEmployees(); }, []);

  const handleAdjustPoints = async () => {
    if (!pointForm.points || !pointForm.reason) {
      toast.error('Points and reason are required');
      return;
    }
    setAdjusting(true);
    try {
      const pts = pointForm.type === 'penalty' ? -Math.abs(parseInt(pointForm.points)) : Math.abs(parseInt(pointForm.points));
      await pointsAPI.adjustPoints({
        employee_id: pointModal.id,
        points: pts,
        type: pointForm.type,
        reason: pointForm.reason
      });
      toast.success(`${pts > 0 ? '+' : ''}${pts} points applied`);
      setPointModal(null);
      setPointForm({ points: '', type: 'manual_bonus', reason: '' });
      loadEmployees();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to adjust points');
    } finally {
      setAdjusting(false);
    }
  };

  const loadHistory = async (empId) => {
    try {
      const res = await pointsAPI.getEmployeePoints(empId, { limit: 20 });
      setPointHistory(res.data);
    } catch {
      toast.error('Failed to load history');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="animate-fade-in">
      <h2 className="font-display text-2xl font-bold text-surface-900 mb-6">
        Employees <span className="text-surface-400 text-lg font-normal">({employees.length})</span>
      </h2>

      {/* Employee Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {employees.map((emp, idx) => (
          <div key={emp.id} className="bg-white rounded-2xl shadow-soft border border-surface-100 overflow-hidden hover:shadow-card transition-all">
            {/* Rank Badge */}
            <div className={`h-2 ${idx === 0 ? 'bg-gradient-to-r from-yellow-400 to-amber-500' : idx === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-400' : idx === 2 ? 'bg-gradient-to-r from-amber-600 to-amber-700' : 'bg-surface-200'}`} />
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    {idx < 3 && <HiOutlineTrophy className={`w-5 h-5 ${idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-gray-400' : 'text-amber-600'}`} />}
                    <h3 className="font-semibold text-surface-900">{emp.user?.full_name}</h3>
                  </div>
                  <p className="text-xs text-surface-400 mt-0.5">{emp.user?.email}</p>
                </div>
                <span className="text-xs px-2.5 py-1 bg-primary-50 text-primary-700 rounded-full font-medium capitalize">{emp.position}</span>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-surface-500">{emp.property?.name}</span>
              </div>

              <div className="bg-surface-50 rounded-xl p-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-surface-500">Total Points</span>
                  <span className="font-display text-2xl font-bold text-primary-600">{emp.total_points}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => { setPointModal(emp); setPointForm({ points: '', type: 'manual_bonus', reason: '' }); }}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition-colors"
                >
                  <HiOutlinePlusCircle className="w-4 h-4" /> Bonus
                </button>
                <button
                  onClick={() => { setPointModal(emp); setPointForm({ points: '', type: 'penalty', reason: '' }); }}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-red-100 text-red-700 text-xs font-semibold hover:bg-red-200 transition-colors"
                >
                  <HiOutlineMinusCircle className="w-4 h-4" /> Penalty
                </button>
                <button
                  onClick={() => loadHistory(emp.id)}
                  className="px-3 py-2 rounded-xl border border-surface-200 text-surface-500 text-xs hover:bg-surface-50 transition-colors"
                  title="View history"
                >
                  <HiOutlineArrowsUpDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Point Adjustment Modal */}
      {pointModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setPointModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-lg font-bold text-surface-900">
                {pointForm.type === 'penalty' ? '⚠️ Deduct Points' : '🎁 Award Points'}
              </h3>
              <button onClick={() => setPointModal(null)} className="p-1 hover:bg-surface-100 rounded-lg"><HiOutlineXMark className="w-5 h-5" /></button>
            </div>
            
            <p className="text-sm text-surface-500 mb-4">
              Employee: <span className="font-semibold text-surface-800">{pointModal.user?.full_name}</span> · Current: <span className="font-bold text-primary-600">{pointModal.total_points} pts</span>
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Type</label>
                <select
                  value={pointForm.type}
                  onChange={e => setPointForm({ ...pointForm, type: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                >
                  <option value="manual_bonus">🎁 Manual Bonus</option>
                  <option value="penalty">⚠️ Penalty</option>
                  <option value="adjustment">🔧 Adjustment</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Points</label>
                <input
                  type="number" min="1"
                  value={pointForm.points}
                  onChange={e => setPointForm({ ...pointForm, points: e.target.value })}
                  placeholder={pointForm.type === 'penalty' ? 'Points to deduct' : 'Points to award'}
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Reason</label>
                <textarea
                  value={pointForm.reason}
                  onChange={e => setPointForm({ ...pointForm, reason: e.target.value })}
                  placeholder="e.g. Outstanding service in April"
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setPointModal(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-surface-200 text-surface-600 text-sm font-semibold hover:bg-surface-50 transition-colors">Cancel</button>
              <button
                onClick={handleAdjustPoints}
                disabled={adjusting}
                className={`flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors disabled:opacity-50 ${pointForm.type === 'penalty' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
              >
                {adjusting ? 'Processing...' : pointForm.type === 'penalty' ? 'Deduct Points' : 'Award Points'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Point History Modal */}
      {pointHistory && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setPointHistory(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-display text-lg font-bold text-surface-900">Point History</h3>
                <p className="text-sm text-surface-500">{pointHistory.employee?.name} · <span className="font-bold text-primary-600">{pointHistory.employee?.total_points} pts</span></p>
              </div>
              <button onClick={() => setPointHistory(null)} className="p-1 hover:bg-surface-100 rounded-lg"><HiOutlineXMark className="w-5 h-5" /></button>
            </div>

            <div className="space-y-2">
              {pointHistory.logs.map(log => (
                <div key={log.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 border border-surface-100">
                  <span className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${log.points_change > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {log.points_change > 0 ? '+' : ''}{log.points_change}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-800 truncate">{log.reason}</p>
                    <p className="text-xs text-surface-400">{log.type.replace('_', ' ')} · Balance: {log.balance_after}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
