import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { referralsAPI } from '../../services/api';
import { HiOutlineClipboardDocument, HiOutlineCheckCircle } from 'react-icons/hi2';

export default function MyReferrals() {
  const [data, setData] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    referralsAPI.getMyCode().then(res => setData(res.data)).catch(() => {});
    referralsAPI.getMyReferrals().then(res => setReferrals(res.data.referrals)).catch(() => {});
  }, []);

  const copyCode = () => {
    navigator.clipboard.writeText(data?.referral_code || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusSteps = { pending: 1, booking_made: 2, checked_in: 3, completed: 4 };

  return (
    <div className="animate-fade-in space-y-8">
      <h2 className="font-display text-2xl font-bold text-surface-900">My Referrals</h2>

      {/* Referral Code Card */}
      <div className="bg-gradient-to-br from-primary-600 to-accent-600 rounded-2xl p-8 text-white">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">Your Referral Code</h3>
            <p className="text-primary-100 text-sm mb-4">Share your code with friends — when they book, you earn rewards!</p>
            <div className="flex items-center gap-3">
              <div className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-xl font-mono text-2xl font-bold tracking-widest">
                {data?.referral_code || '...'}
              </div>
              <button onClick={copyCode} className="p-3 bg-white/20 rounded-xl hover:bg-white/30 transition-colors">
                {copied ? <HiOutlineCheckCircle className="w-5 h-5" /> : <HiOutlineClipboardDocument className="w-5 h-5" />}
              </button>
            </div>
          </div>
          {data?.referral_code && (
            <div className="bg-white p-4 rounded-2xl">
              <QRCodeSVG value={data.qr_data} size={120} bgColor="white" fgColor="#1e293b" />
            </div>
          )}
        </div>
      </div>

      {/* Referral History */}
      <div>
        <h3 className="font-semibold text-lg text-surface-900 mb-4">Referral History</h3>
        {referrals.length === 0 ? (
          <p className="text-surface-500 text-sm">No referrals yet. Share your code to get started!</p>
        ) : (
          <div className="space-y-3">
            {referrals.map(r => (
              <div key={r.id} className="bg-white rounded-xl shadow-soft border border-surface-100 p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-surface-900">{r.referred?.full_name || 'Unknown'}</span>
                  <span className="text-xs text-surface-500">{r.referred?.email}</span>
                </div>
                {/* 3-step progress */}
                <div className="flex items-center gap-2">
                  {['Shared', 'Booked', 'Checked In', 'Complete'].map((step, i) => (
                    <div key={step} className="flex items-center gap-2 flex-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${statusSteps[r.status] > i ? 'bg-primary-500 text-white' : 'bg-surface-200 text-surface-500'}`}>
                        {i + 1}
                      </div>
                      <span className={`text-xs ${statusSteps[r.status] > i ? 'text-primary-600 font-medium' : 'text-surface-400'}`}>{step}</span>
                      {i < 3 && <div className={`flex-1 h-0.5 ${statusSteps[r.status] > i + 1 ? 'bg-primary-500' : 'bg-surface-200'}`} />}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
