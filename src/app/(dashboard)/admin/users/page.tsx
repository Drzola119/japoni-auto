'use client';

import { useState } from 'react';
import { Search, Filter, MoreVertical, Shield, UserX, CheckCircle, Mail } from 'lucide-react';

const mockUsers = [
  { id: 1, name: 'Karim Benali', email: 'karim@example.com', role: 'seller', status: 'active', verified: true, date: '12 Mars 2026' },
  { id: 2, name: 'Lydia Mansouri', email: 'lydia@example.com', role: 'user', status: 'active', verified: false, date: '10 Mars 2026' },
  { id: 3, name: 'Ahmed Auto', email: 'contact@ahmedauto.dz', role: 'seller', status: 'suspended', verified: false, date: '08 Mars 2026' },
  { id: 4, name: 'Amine F', email: 'amine@example.com', role: 'user', status: 'active', verified: false, date: '05 Mars 2026' },
  { id: 5, name: 'Tarik Admin', email: 'admin@japoniauto.dz', role: 'admin', status: 'active', verified: true, date: '01 Jan 2026' },
];

export default function UsersManagement() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-cormorant text-white">Gestion des Utilisateurs</h1>
          <p className="text-white/50 text-sm mt-1">Supervisez tous les membres de la plateforme.</p>
        </div>
        <button className="bg-white text-[#111] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-white/90">
          Ajouter un utilisateur
        </button>
      </div>

      <div className="bg-[#111116] border border-white/5 rounded-2xl overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/[0.02]">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input 
              type="text" 
              placeholder="Rechercher par nom ou email..." 
              className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-[#C9A84C]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button className="flex items-center gap-2 px-3 py-2 border border-white/10 rounded-lg text-sm text-white/70 hover:text-white bg-[#0a0a0f]">
              <Filter className="w-4 h-4" /> Filtres
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white/70">
            <thead className="bg-white/[0.02] border-b border-white/5 text-xs uppercase font-medium tracking-wider">
              <tr>
                <th className="px-6 py-4">Utilisateur</th>
                <th className="px-6 py-4">Rôle</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4">Vérifié</th>
                <th className="px-6 py-4">Inscription</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {mockUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/[0.01] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#1a1a20] flex items-center justify-center font-semibold text-[#E8C96A]">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{user.name}</div>
                        <div className="text-xs text-white/40">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider ${
                      user.role === 'admin' ? 'bg-purple-500/10 text-purple-400' :
                      user.role === 'seller' ? 'bg-[#C9A84C]/10 text-[#C9A84C]' :
                      'bg-slate-500/10 text-slate-400'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${user.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      <span className="capitalize">{user.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.verified ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <span className="text-white/20">-</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-white/50">{user.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button className="text-white/40 hover:text-white p-1">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
