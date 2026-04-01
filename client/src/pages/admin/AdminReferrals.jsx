import { useEffect, useState } from 'react';
import { referralsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineArrowPath, HiOutlineGift } from 'react-icons/hi2';

const statusColors = {
  pending:      'bg-amber-50 text-amber-700 border-amber-200',
  booking_made: 'bg-blue-50 text-blue-700 border-blue-200',
  checked_in:   'bg-green-50 text-green-700 border-green-200',
  completed:    'bg-emerald-50 text-emerald-700 border-emerald-200',
  expired:      'bg-surface-100 text-surface-500 border-surface-200'
};

export default function AdminReferrals() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewForm, setReviewForm] = useState({ status: 'approved', points: 10, notes: '' });
  const [reviewing, setReviewing] = useState(false);

  const loadClaims = () => {
    setLoading(true);
    referralsAPI.getPendingClaims()
      .then(r => setClaims(r.data.claims))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadClaims(); }, []);

  const handleReview = async () => {
    setReviewing(true);
    try {
      await referralsAPI.reviewClaim(reviewModal.id, {
        status: reviewForm.status,
        points: reviewForm.status === 'approved' ? parseInt(reviewForm.points) : 0,
        notes: reviewForm.notes
      });
      toast.success(`Claim ${reviewForm.status}`);
      setReviewModal(null);
      loadClaims();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Review failed');
    } finally {
      setReviewing(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold text-surface-900">
          Referral Claims <span className="text-surface-400 text-lg font-normal">({claims.length} pending)</span>
        </h2>
        <button onClick={loadClaims} className="p-2 rounded-xl border border-surface-200 hover:bg-surface-50 transition-colors">
          <HiOutlineArrowPath className="w-5 h-5 text-surface-500" />
        </button>
      </div>

      {claims.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-soft border border-surface-100">
          <HiOutlineGift className="w-16 h-16 mx-auto mb-4 text-surface-300" />
          <h3 className="text-lg font-semibold text-surface-700 mb-2">No pending claims</h3>
          <p className="text-surface-500">All referral claims have been processed.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {claims.map(claim => (
            <div key={claim.id} className="bg-white rounded-2xl shadow-soft border border-surface-100 p-5">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Employee Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 font-medium">Employee</span>
                    <h3 className="font-semibold text-surface-900">{claim.employee?.user?.full_name}</h3>
                  </div>
                  <p className="text-xs text-surface-400 mb-3">{claim.employee?.user?.email}</p>

                  {/* Referral Details */}
                  {claim.referral && (
                    <div className="bg-surface-50 rounded-xl p-3 space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-surface-500">Referrer</span>
                        <span className="font-medium text-surface-800">{claim.referral.referrer?.full_name}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-surface-500">Referred</span>
                        <span className="font-medium text-surface-800">{claim.referral.referred?.full_name}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-surface-500">Referral Status</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusColors[claim.referral.status] || statusColors.pending}`}>
                          {claim.referral.status?.replace('_', ' ')}
                        </span>
                      </div>
                      {claim.referral.booking && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-surface-500">Booking</span>
                          <span className="font-medium text-surface-800">
                            {claim.referral.booking.check_in} → {claim.referral.booking.check_out} · {claim.referral.booking.status}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 md:flex-col">
                  <button
                    onClick={() => { setReviewModal(claim); setReviewForm({ status: 'approved', points: 10, notes: '' }); }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors"
                  >
                    <HiOutlineCheckCircle className="w-4 h-4" /> Approve
                  </button>
                  <button
                    onClick={() => { setReviewModal(claim); setReviewForm({ status: 'rejected', points: 0, notes: '' }); }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-100 text-red-700 text-sm font-semibold hover:bg-red-200 transition-colors"
                  >
                    <HiOutlineXCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setReviewModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in" onClick={e => e.stopPropagation()}>
            <h3 className="font-display text-lg font-bold text-surface-900 mb-4">
              {reviewForm.status === 'approved' ? '✅ Approve Claim' : '❌ Reject Claim'}
            </h3>

            {reviewForm.status === 'approved' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-surface-700 mb-1">Points to Award</label>
                <input
                  type="number" min="1"
                  value={reviewForm.points}
                  onChange={e => setReviewForm({ ...reviewForm, points: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                />
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-surface-700 mb-1">Notes (optional)</label>
              <textarea
                value={reviewForm.notes}
                onChange={e => setReviewForm({ ...reviewForm, notes: e.target.value })}
                placeholder="Add a note..."
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setReviewModal(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-surface-200 text-surface-600 text-sm font-semibold hover:bg-surface-50 transition-colors">Cancel</button>
              <button
                onClick={handleReview}
                disabled={reviewing}
                className={`flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors disabled:opacity-50 ${reviewForm.status === 'rejected' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
              >
                {reviewing ? 'Processing...' : reviewForm.status === 'approved' ? 'Approve & Award' : 'Reject Claim'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
