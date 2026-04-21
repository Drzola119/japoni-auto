'use client';

export const dynamic = 'force-dynamic';

import { Users, Car, AlertTriangle, ShieldCheck, TrendingUp, Clock } from 'lucide-react';

const kpis = [
  { label: 'Utilisateurs', value: '1,248', icon: <Users size={24} />, change: '+12%', color: 'from-[#0ea5e9] to-[#38bdf8]' },
  { label: 'Vendeurs Pro', value: '142', icon: <ShieldCheck size={24} />, change: '+5%', color: 'from-[#10b981] to-[#34d399]' },
  { label: 'Annonces Actives', value: '3,890', icon: <Car size={24} />, change: '+18%', color: 'from-[#C9A84C] to-[#E8C96A]' },
  { label: 'Signalements', value: '12', icon: <AlertTriangle size={24} />, change: '-2%', color: 'from-rose-500 to-red-400' },
];

const recentActivities = [
  { id: 1, user: 'Ahmed B.', action: 'a publié une annonce', target: 'Mercedes-Benz Classe G', time: 'Il y a 10 min' },
  { id: 2, user: 'Karim Auto', action: 'a demandé la vérification pro', target: 'Compte Vendeur', time: 'Il y a 45 min' },
  { id: 3, user: 'Yacine S.', action: 'a signalé une annonce', target: 'Annonce Suspecte #884', time: 'Il y a 2 heures' },
];

export default function AdminOverview() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-cormorant text-white tracking-wide">Vue d&apos;ensemble</h1>
        <p className="text-white/50 text-sm mt-1">Gérez la plateforme Japoni Auto d&apos;un coup d&apos;œil.</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <div key={index} className="bg-[#111116] border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${kpi.color} opacity-5 rounded-full blur-2xl -mr-10 -mt-10 transition-opacity group-hover:opacity-10`} />
            <div className="flex justify-between items-start mb-4">
              <div className="text-white/50 text-sm font-medium">{kpi.label}</div>
              <div className="text-white/20 group-hover:text-[#C9A84C] transition-colors">{kpi.icon}</div>
            </div>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-semibold text-white">{kpi.value}</div>
              <div className={`text-xs font-semibold ${kpi.change.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'} bg-white/5 px-2 py-1 rounded-md`}>
                {kpi.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Placeholder */}
        <div className="lg:col-span-2 bg-[#111116] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-semibold text-white">Évolution des annonces</h2>
            <select className="bg-[#0a0a0f] border border-white/10 text-white/70 text-sm rounded-lg px-3 py-1.5 outline-none">
              <option>Ces 30 jours</option>
              <option>Ces 7 jours</option>
            </select>
          </div>
          <div className="flex items-center justify-center h-[280px] border border-dashed border-white/10 rounded-xl bg-white/[0.02]">
            <div className="text-center">
              <TrendingUp className="w-8 h-8 text-white/20 mx-auto mb-3" />
              <p className="text-sm text-white/40">Graphique des tendances (Intégration Recharts recommandée)</p>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-[#111116] border border-white/5 rounded-2xl p-6 flex flex-col">
          <h2 className="text-lg font-semibold text-white mb-6">Activité Récente</h2>
          <div className="flex-1 space-y-6">
            {recentActivities.map((act) => (
              <div key={act.id} className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[#1a1a20] border border-white/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-[#C9A84C]">{act.user.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-sm text-white/90">
                    <span className="font-semibold">{act.user}</span> {act.action} <span className="font-medium text-[#C9A84C]">{act.target}</span>
                  </p>
                  <div className="flex items-center gap-1 mt-1 text-[11px] text-white/40 font-medium">
                    <Clock size={12} /> {act.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full text-center text-[13px] font-medium text-[#C9A84C] mt-6 py-2 border border-[#C9A84C]/20 rounded-lg hover:bg-[#C9A84C]/10 transition-colors">
            Voir tout l&apos;historique
          </button>
        </div>
      </div>
      
    </div>
  );
}
