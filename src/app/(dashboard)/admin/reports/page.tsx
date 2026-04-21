'use client';

import { AlertTriangle, UserX, Flag, Check } from 'lucide-react';

const mockReports = [
  { id: 'REP-01', reporter: 'ClientX', target: 'Annonce: Mercedes G63', reason: 'Prix irréaliste (Arnaque)', status: 'open', date: 'Maintentant' },
  { id: 'REP-02', reporter: 'Ahmed B', target: 'Utilisateur: SellerXYZ', reason: 'Ne répond jamais', status: 'reviewed', date: 'Hier' },
];

export default function AdminReports() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <div>
        <h1 className="text-2xl font-bold font-cormorant text-white">Signalements (Reports)</h1>
        <p className="text-white/50 text-sm mt-1">Gérez les signalements des utilisateurs pour maintenir la qualité de la plateforme.</p>
      </div>

      <div className="bg-[#111116] border border-rose-500/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm text-white/70">
          <thead className="bg-rose-500/5 border-b border-rose-500/10 text-xs uppercase text-white/60">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Signalé par</th>
              <th className="px-6 py-4">Cible</th>
              <th className="px-6 py-4">Raison</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {mockReports.map(report => (
              <tr key={report.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4 font-medium text-rose-400">{report.id}</td>
                <td className="px-6 py-4">{report.reporter}</td>
                <td className="px-6 py-4 font-semibold text-white">{report.target}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={14} className="text-amber-500" />
                    {report.reason}
                  </div>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button className="text-[11px] bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded uppercase font-bold tracking-wider transition">Examiner</button>
                  {report.status === 'open' && (
                    <button className="text-[11px] bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-white px-3 py-1.5 rounded uppercase font-bold tracking-wider transition"><Check size={14} className="inline mr-1"/> Classer</button>
                  )}
                </td>
              </tr>
            ))}
            {mockReports.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-white/30">
                  <Flag className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  Aucun signalement en attente.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
