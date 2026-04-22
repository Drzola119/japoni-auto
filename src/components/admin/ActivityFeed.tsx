'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { UserPlus, PlusCircle, CheckCircle, AlertCircle, ShoppingCart, Activity } from 'lucide-react';
import { m as motion } from 'framer-motion';

interface ActivityLog {
  id: string;
  type: 'user_register' | 'listing_added' | 'listing_approved' | 'report' | 'listing_sold';
  message: string;
  createdAt: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  useEffect(() => {
    const q = query(collection(db!, 'activity_logs'), orderBy('createdAt', 'desc'), limit(10));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setActivities(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ActivityLog)));
      } else {
        // Fallback dummy data if no collection exists yet
        setActivities([
          { id: '1', type: 'user_register', message: 'Nouveau vendeur inscrit: Ahmed K.', createdAt: new Date() },
          { id: '2', type: 'listing_added', message: 'Nouvelle annonce: Toyota Corolla 2023', createdAt: new Date(Date.now() - 1000 * 60 * 15) },
          { id: '3', type: 'listing_approved', message: 'Annonce approuvée par Admin', createdAt: new Date(Date.now() - 1000 * 60 * 45) },
          { id: '4', type: 'report', message: 'Signalement reçu pour une annonce suspecte', createdAt: new Date(Date.now() - 1000 * 60 * 120) },
        ]);
      }
    });

    return () => unsubscribe();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'user_register': return { icon: UserPlus, color: 'text-blue-500', bg: 'bg-blue-500/10' };
      case 'listing_added': return { icon: PlusCircle, color: 'text-[#C9A84C]', bg: 'bg-[#C9A84C]/10' };
      case 'listing_approved': return { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' };
      case 'report': return { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10' };
      case 'listing_sold': return { icon: ShoppingCart, color: 'text-purple-500', bg: 'bg-purple-500/10' };
      default: return { icon: Activity, color: 'text-[#A0A0A0]', bg: 'bg-[#1A1A1A]' };
    }
  };

  return (
    <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-serif text-lg font-semibold border-l-2 border-[#C9A84C] pl-3">
          Activité Récente
        </h3>
      </div>

      <div className="space-y-6 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-[1px] before:bg-[#2A2A2A]">
        {activities.map((activity, i) => {
          const { icon: Icon, color, bg } = getIcon(activity.type);
          return (
            <motion.div 
              key={activity.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-4 relative z-10"
            >
              <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center shrink-0 border border-[#2A2A2A]`}>
                <Icon size={16} className={color} />
              </div>
              <div>
                <p className="text-sm text-[#F5F0E8] font-medium leading-tight">{activity.message}</p>
                <p className="text-[10px] text-[#555555] mt-1 italic font-medium uppercase tracking-wider">
                  Il y a quelques instants
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
