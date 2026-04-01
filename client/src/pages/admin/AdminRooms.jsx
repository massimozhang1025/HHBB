import { useEffect, useState } from 'react';
import { roomsAPI } from '../../services/api';

export default function AdminRooms() {
  const [rooms, setRooms] = useState([]);
  useEffect(() => { roomsAPI.search({}).then(r => setRooms(r.data.rooms)).catch(() => {}); }, []);

  return (
    <div className="animate-fade-in">
      <h2 className="font-display text-2xl font-bold text-surface-900 mb-6">Rooms Management</h2>
      <div className="bg-white rounded-2xl shadow-soft border border-surface-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-50">
              <tr><th className="py-3 px-4 text-left font-medium text-surface-500">Room</th><th className="py-3 px-4 text-left font-medium text-surface-500">Property</th><th className="py-3 px-4 text-left font-medium text-surface-500">Type</th><th className="py-3 px-4 text-left font-medium text-surface-500">Price</th><th className="py-3 px-4 text-left font-medium text-surface-500">Status</th></tr>
            </thead>
            <tbody>
              {rooms.map(r => (
                <tr key={r.id} className="border-t border-surface-100 hover:bg-surface-50">
                  <td className="py-3 px-4 font-mono font-semibold text-surface-900">{r.room_number}</td>
                  <td className="py-3 px-4 text-surface-600">{r.property?.name}</td>
                  <td className="py-3 px-4 capitalize text-surface-600">{r.type}</td>
                  <td className="py-3 px-4 font-semibold text-primary-600">€{parseFloat(r.price_per_night).toFixed(0)}</td>
                  <td className="py-3 px-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${r.status === 'available' ? 'bg-green-50 text-green-700' : r.status === 'occupied' ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-700'}`}>{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
