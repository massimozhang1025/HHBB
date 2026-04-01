import { useEffect, useState } from 'react';
import { propertiesAPI } from '../../services/api';

export default function AdminProperties() {
  const [properties, setProperties] = useState([]);
  useEffect(() => { propertiesAPI.getAll().then(r => setProperties(r.data.properties)).catch(() => {}); }, []);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold text-surface-900">Properties</h2>
        <button className="px-4 py-2 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700">+ Add Property</button>
      </div>
      <div className="bg-white rounded-2xl shadow-soft border border-surface-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-50">
            <tr><th className="py-3 px-4 text-left font-medium text-surface-500">Name</th><th className="py-3 px-4 text-left font-medium text-surface-500">City</th><th className="py-3 px-4 text-left font-medium text-surface-500">Rooms</th><th className="py-3 px-4 text-left font-medium text-surface-500">Status</th></tr>
          </thead>
          <tbody>
            {properties.map(p => (
              <tr key={p.id} className="border-t border-surface-100 hover:bg-surface-50">
                <td className="py-3 px-4 font-medium text-surface-900">{p.name}</td>
                <td className="py-3 px-4 text-surface-600">{p.city}</td>
                <td className="py-3 px-4 text-surface-600">{p.rooms?.length || 0}</td>
                <td className="py-3 px-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${p.is_active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>{p.is_active ? 'Active' : 'Inactive'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
