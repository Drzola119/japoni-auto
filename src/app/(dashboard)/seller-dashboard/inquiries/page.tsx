'use client';

import { MessageSquare, Send, Car } from 'lucide-react';
import { useState } from 'react';

const mockInquiries = [
  { id: 1, buyerName: 'Samir L.', car: 'Mercedes G63 AMG', message: 'Je vous propose 42 millions, paiement ce weekend.', date: 'Il y a 10 min', unread: true },
  { id: 2, buyerName: 'Rafik M.', car: 'Range Rover Sport', message: 'Bonjour, est-ce que la voiture est visible demain matin ?', date: 'Hier', unread: false },
  { id: 3, buyerName: 'Lyes B.', car: 'Audi RSQ8', message: 'Dernier prix s\'il vous plaît ?', date: '10 Mars', unread: false },
];

export default function Inquiries() {
  const [selected, setSelected] = useState(mockInquiries[0]);

  return (
    <div className="animate-in fade-in duration-500 h-[calc(100vh-12rem)] max-w-6xl flex flex-col">
      
      <div className="mb-6 flex-shrink-0">
        <h1 className="text-2xl font-bold font-cormorant text-white">Messagerie</h1>
        <p className="text-white/50 text-sm mt-1">Discutez avec les acheteurs potentiels de vos véhicules.</p>
      </div>

      <div className="bg-[#111116] border border-white/5 rounded-2xl flex-1 flex overflow-hidden">
        
        {/* Left pane - thread list */}
        <div className="w-1/3 border-r border-white/5 flex flex-col hidden sm:flex">
          <div className="p-4 border-b border-white/5 bg-white/[0.02]">
            <h2 className="font-semibold text-white text-sm uppercase tracking-wider">Discussions</h2>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-white/5">
            {mockInquiries.map(inquiry => (
              <button 
                key={inquiry.id}
                onClick={() => setSelected(inquiry)}
                className={`w-full text-left p-4 hover:bg-white/[0.02] transition-colors ${selected.id === inquiry.id ? 'bg-white/[0.04]' : ''}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className={`font-semibold text-sm ${inquiry.unread ? 'text-white' : 'text-white/80'}`}>{inquiry.buyerName}</div>
                  <div className="text-[10px] text-white/40">{inquiry.date}</div>
                </div>
                <div className="text-[11px] text-[#C9A84C] font-semibold mb-2 flex items-center gap-1"><Car size={12}/> {inquiry.car}</div>
                <p className="text-xs text-white/60 line-clamp-1">{inquiry.message}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Right pane - chat view */}
        <div className="flex-1 flex flex-col bg-[#0a0a0f]/50">
          {/* Chat header */}
          <div className="p-4 border-b border-white/5 bg-[#111116] flex items-center gap-4 flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-bold text-[#C9A84C]">
              {selected.buyerName.charAt(0)}
            </div>
            <div>
              <div className="font-semibold text-white/90 text-sm">{selected.buyerName}</div>
              <div className="text-[11px] text-white/50 flex items-center gap-1">Concernant: <span className="text-[#C9A84C]">{selected.car}</span></div>
            </div>
          </div>
          
          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="flex gap-4 max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#C9A84C] text-xs font-bold shrink-0">
                {selected.buyerName.charAt(0)}
              </div>
              <div>
                <div className="bg-[#111116] border border-white/5 rounded-2xl rounded-tl-sm p-4 text-sm text-white/90">
                  {selected.message}
                </div>
                <div className="text-[10px] text-white/30 mt-1">{selected.date}</div>
              </div>
            </div>
          </div>
          
          {/* Chat input */}
          <div className="p-4 bg-[#111116] border-t border-white/5 flex-shrink-0">
            <div className="relative">
              <textarea 
                placeholder="Écrivez votre réponse..." 
                className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-[#C9A84C] resize-none"
                rows={1}
              ></textarea>
              <button className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-[#C9A84C]/20 text-[#C9A84C] flex items-center justify-center hover:bg-[#C9A84C] hover:text-black transition-colors">
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
