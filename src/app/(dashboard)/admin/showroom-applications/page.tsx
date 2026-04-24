'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { auth } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, deleteField } from 'firebase/firestore';
import { 
  Building2,
  CheckCircle2,
  XCircle,
  Search,
  FileText,
  Clock,
  MapPin,
  Mail,
  Phone,
  Loader2
} from 'lucide-react';
import { m as motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { ShowroomApplication, ShowroomTier } from '@/types';

const TIER_LIMITS = {
  bronze: { daily: 20, name: 'Bronze' },
  silver: { daily: 50, name: 'Silver' },
  gold: { daily: 999, name: 'Gold' },
};

export default function AdminShowroomApplications() {
  const [applications, setApplications] = useState<ShowroomApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db!, 'showroomApplications'),
      where('status', '==', statusFilter),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setApplications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ShowroomApplication)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [statusFilter]);

  const handleApprove = async (application: ShowroomApplication, tier: ShowroomTier) => {
    setProcessingId(application.id);
    
    try {
      // Get admin ID token
      const idToken = await auth?.currentUser?.getIdToken();
      if (!idToken) {
        throw new Error('Session expired. Please login again.');
      }

      // Call create-user API to create the Firebase Auth account
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          email: application.email,
          password: application.tempPassword,
          displayName: application.ownerName,
          role: 'showroom',
          phone: application.phone,
          wilaya: application.wilaya,
          showroomName: application.showroomName,
          showroomTier: tier,
          showroomAddress: application.address,
          showroomWilaya: application.showroomWilaya,
          showroomApplicationId: application.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error creating account');
      }

      const userId = result.uid;

      // Update application status
      await updateDoc(doc(db!, 'showroomApplications', application.id), {
        status: 'approved',
        tier,
        userId,
        reviewedAt: new Date().toISOString(),
        tempPassword: deleteField(), // Clear temp password for security
      });

      toast.success(`Showroom approved — Tier ${tier.charAt(0).toUpperCase() + tier.slice(1)}`);
      setApplications(prev => prev.filter(a => a.id !== application.id));
    } catch (error) {
      console.error('Error approving application:', error);
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (application: ShowroomApplication) => {
    setProcessingId(application.id);
    
    try {
      await updateDoc(doc(db!, 'showroomApplications', application.id), {
        status: 'rejected',
        reviewedAt: new Date().toISOString(),
      });
      toast.success('Application rejected');
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast.error('Error rejecting application');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredApps = applications.filter(app => {
    const matchesSearch = 
      app.showroomName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.phone?.includes(searchTerm);
    return matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-[#111111] p-8 rounded-2xl border border-[#2A2A2A] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-full bg-[#C9A84C]/5 blur-[60px] rounded-full" />
        <div className="relative z-10">
          <h1 className="text-2xl font-serif text-white font-bold flex items-center gap-3">
            <Building2 className="text-[#C9A84C]" />
            Showroom Applications
          </h1>
          <p className="text-white/50 text-sm mt-2">
            Manage professional showroom creation requests
          </p>

          <div className="flex flex-wrap gap-6 mt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A84C] w-64"
              />
            </div>

            <div className="flex gap-2">
              {(['pending', 'approved', 'rejected'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wider transition-all ${
                    statusFilter === status
                      ? 'bg-[#C9A84C] text-[#111]'
                      : 'bg-[#0A0A0A] text-white/50 hover:text-white border border-[#2A2A2A]'
                  }`}
                >
                  {status === 'pending' ? 'Pending' : status === 'approved' ? 'Approved' : 'Rejected'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-[#C9A84C] animate-spin" />
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="bg-[#111111] rounded-2xl border border-[#2A2A2A] p-12 text-center">
          <FileText className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/40">No applications found</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredApps.map((application) => (
            <motion.div
              key={application.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-6"
            >
              <div className="flex flex lg:flex-row lg:items-start gap-6">
                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#C9A84C]/10 flex items-center justify-center">
                      <Building2 className="text-[#C9A84C]" size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">{application.showroomName}</h3>
                      <div className="flex items-center gap-4 text-white/40 text-sm mt-1">
                        <span className="flex items-center gap-1">
                          <Mail size={14} /> {application.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone size={14} /> {application.phone}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="bg-[#0A0A0A] rounded-xl p-4">
                      <span className="text-white/30 text-[10px] uppercase font-bold tracking-wider">Address</span>
                      <p className="text-white text-sm mt-1 flex items-center gap-1">
                        <MapPin size={14} className="text-[#C9A84C]" />
                        {application.address}
                      </p>
                    </div>
                    <div className="bg-[#0A0A0A] rounded-xl p-4">
                      <span className="text-white/30 text-[10px] uppercase font-bold tracking-wider">Wilaya</span>
                      <p className="text-white text-sm mt-1">{application.wilaya}</p>
                    </div>
                    <div className="bg-[#0A0A0A] rounded-xl p-4">
                      <span className="text-white/30 text-[10px] uppercase font-bold tracking-wider">Status</span>
                      <p className="text-white text-sm mt-1 capitalize flex items-center gap-1">
                        {application.status === 'pending' && <Clock size={14} className="text-yellow-500" />}
                        {application.status === 'approved' && <CheckCircle2 size={14} className="text-green-500" />}
                        {application.status === 'rejected' && <XCircle size={14} className="text-red-500" />}
                        {application.status}
                      </p>
                    </div>
                    <div className="bg-[#0A0A0A] rounded-xl p-4">
                      <span className="text-white/30 text-[10px] uppercase font-bold tracking-wider">Date</span>
                      <p className="text-white text-sm mt-1">
                        {application.createdAt ? new Date(application.createdAt).toLocaleDateString('fr-DZ') : '-'}
                      </p>
                    </div>
                  </div>

                  {application.documents && (
                    <div className="bg-[#0A0A0A] rounded-xl p-4">
                      <span className="text-white/30 text-[10px] uppercase font-bold tracking-wider">Documents</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {Object.entries(application.documents).map(([key, url]) => (
                          url && (
                            <a
                              key={key}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 bg-[#C9A84C]/10 text-[#C9A84C] rounded-lg text-xs font-bold uppercase hover:bg-[#C9A84C]/20 transition-colors"
                            >
                              {key}
                            </a>
                          )
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {application.status === 'pending' && (
                  <div className="flex flex-col gap-3 lg:w-64">
                    <button
                      onClick={() => handleApprove(application, 'bronze')}
                      disabled={processingId === application.id}
                      className="w-full bg-[#C9A84C] text-[#111] font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#E8C96A] transition-colors disabled:opacity-50"
                    >
                      {processingId === application.id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <CheckCircle2 size={18} />
                      )}
                      Approve
                    </button>

                    <div className="grid grid-cols-3 gap-2">
                      {(['bronze', 'silver', 'gold'] as const).map((tier) => (
                        <button
                          key={tier}
                          onClick={() => handleApprove(application, tier)}
                          disabled={processingId === application.id}
                          className={`py-2 rounded-lg text-xs font-bold uppercase ${
                            tier === 'bronze'
                              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                              : tier === 'silver'
                              ? 'bg-gray-400/20 text-gray-300 border border-gray-400/30'
                              : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          } hover:opacity-80 transition-opacity disabled:opacity-50`}
                        >
                          {TIER_LIMITS[tier].name} ({TIER_LIMITS[tier].daily}/day)
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => handleReject(application)}
                      disabled={processingId === application.id}
                      className="w-full bg-red-500/10 text-red-500 border border-red-500/20 font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                    >
                      <XCircle size={18} />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}