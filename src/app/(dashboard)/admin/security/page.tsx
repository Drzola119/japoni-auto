'use client';

import { Activity, ShieldAlert, KeyRound, Smartphone } from 'lucide-react';

const mockLogs = [
  { id: 1, action: 'Connexion administrateur', ip: '154.121.xx.xx', location: 'Alger, DZ', time: 'Maintentant', status: 'success' },
  { id: 2, action: 'Modification de rôle (Amine F -> Vendeur)', ip: '154.121.xx.xx', location: 'Alger, DZ', time: 'Il y a 2h', status: 'success' },
  { id: 3, action: 'Tentative de connexion échouée', ip: '197.100.xx.xx', location: 'Oran, DZ', time: 'Il y a 5h', status: 'warning' },
  { id: 4, action: 'Suppression d\'annonce (AN-887)', ip: '154.121.xx.xx', location: 'Alger, DZ', time: 'Hier', status: 'success' },
];

export default function AdminSecurity() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <div>
        <h1 className="text-2xl font-bold font-cormorant text-white">Centre de Sécurité</h1>
        <p className="text-white/50 text-sm mt-1">Audit des logs et surveillance des accès administratifs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 bg-[#111116] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="text-[#C9A84C]" />
            <h2 className="text-lg font-semibold text-white">Journal d&apos;Audit (Audit Logs)</h2>
          </div>
          
          <div className="space-y-4">
            {mockLogs.map(log => (
              <div key={log.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-white/5 rounded-xl bg-white/[0.01]">
                <div className="flex items-start gap-3">
                  <div className={`mt-1 w-2 h-2 rounded-full ${log.status === 'success' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <div>
                    <h3 className="font-semibold text-white/90 text-sm">{log.action}</h3>
                    <p className="text-xs text-white/40 mt-1">{log.ip} • {log.location}</p>
                  </div>
                </div>
                <div className="mt-2 sm:mt-0 text-xs text-white/50 text-right">
                  {log.time}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#111116] border border-rose-500/20 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-5">
              <ShieldAlert className="w-32 h-32 text-rose-500" />
            </div>
            <h3 className="text-sm font-semibold text-rose-400 mb-2">Activité Suspecte</h3>
            <p className="text-2xl font-bold text-white">0</p>
            <p className="text-xs text-white/50 mt-1">Aucune anomalie détectée ce mois</p>
          </div>

          <div className="bg-[#111116] border border-white/5 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white/80 mb-4">Accès Rapides</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                <span className="flex items-center gap-2 text-sm text-white/80"><KeyRound size={16}/> Changer mon mot de passe</span>
              </button>
              <button className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                <span className="flex items-center gap-2 text-sm text-white/80"><Smartphone size={16}/> Configurer le 2FA</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
