'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  collection, query, where, orderBy, limit, onSnapshot, deleteDoc, doc as docRef
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import {
  Megaphone, Search, Filter, ChevronLeft, ChevronRight,
  Eye, RotateCcw, Trash2, X, CheckCircle2, Clock
} from 'lucide-react'

interface Broadcast {
  id: string
  title: string
  message: string
  type: string
  recipientType: string
  targetWilayas?: string[]
  recipientCount: number
  sentAt?: { toDate: () => Date }
  sentBy: string
  status: 'sent' | 'scheduled' | 'draft'
}

export default function BroadcastHistoryPage() {
  const { user } = useAuth()
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'sent' | 'scheduled'>('all')
  const [page, setPage] = useState(1)
  const [selectedBroadcast, setSelectedBroadcast] = useState<Broadcast | null>(null)
  const [readCounts, setReadCounts] = useState<Record<string, number>>({})

  const PAGE_SIZE = 15

  useEffect(() => {
    if (!db) return
    const q = query(collection(db, 'broadcasts'), orderBy('sentAt', 'desc'), limit(100))
    const unsub = onSnapshot(q, (snap) => {
      setBroadcasts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Broadcast)))
      setLoading(false)
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    if (!db || broadcasts.length === 0) return
    const counts: Record<string, number> = {}
    broadcasts.slice(0, 10).forEach(bc => {
      if (!db) return
      const q = query(collection(db, 'notifications'), where('broadcastId', '==', bc.id))
      const unsub = onSnapshot(q, (snap) => {
        counts[bc.id] = snap.docs.filter(d => d.data().read === true).length
        setReadCounts({ ...counts })
      })
    })
  }, [broadcasts.length])

  const filtered = broadcasts.filter(bc => {
    if (filterStatus !== 'all' && bc.status !== filterStatus) return false
    if (search && !bc.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleDelete = async (id: string) => {
    if (!db) return
    try {
      await deleteDoc(docRef(db, 'broadcasts', id))
      if (selectedBroadcast?.id === id) setSelectedBroadcast(null)
    } catch (e) {
      console.error('Delete error:', e)
    }
  }

  const handleResend = (bc: Broadcast) => {
    // This would navigate to compose page with pre-filled data
    // For now, just show a toast
  }

  const formatDate = (date: Date | undefined) => {
    if (!date) return '—'
    return date.toLocaleDateString('fr-DZ', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/broadcast" className="p-2 bg-[#1A1A1A] rounded-xl text-[#A0A0A0] hover:text-white">
            <ChevronLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-white flex items-center gap-2">
              <Megaphone size={20} className="text-[#C9A84C]" />
              Historique des Diffusions
            </h1>
            <p className="text-sm text-[#A0A0A0] mt-0.5">
              Toutes les diffusions envoyées
            </p>
          </div>
        </div>
        <Link
          href="/admin/broadcast"
          className="px-4 py-2 bg-[#C9A84C] text-black font-medium rounded-xl text-sm"
        >
          Nouvelle Diffusion
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Rechercher par titre..."
              className="w-full h-10 pl-9 pr-4 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl text-sm text-white placeholder:text-[#555] focus:border-[#C9A84C]/50 focus:outline-none"
            />
          </div>
          <div className="flex gap-1">
            {(['all', 'sent', 'scheduled'] as const).map(s => (
              <button
                key={s}
                onClick={() => { setFilterStatus(s); setPage(1) }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filterStatus === s
                    ? 'bg-[#C9A84C] text-black'
                    : 'bg-[#1A1A1A] border border-[#2A2A2A] text-[#A0A0A0] hover:border-[#C9A84C]/40'
                }`}
              >
                {s === 'all' ? 'Tous' : s === 'sent' ? 'Envoyé' : 'Planifié'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#1E1E1E]">
                <th className="text-left py-3 px-4 text-[#555] font-medium uppercase">Titre</th>
                <th className="text-left py-3 px-4 text-[#555] font-medium uppercase">Destinataires</th>
                <th className="text-left py-3 px-4 text-[#555] font-medium uppercase">Type</th>
                <th className="text-left py-3 px-4 text-[#555] font-medium uppercase">Statut</th>
                <th className="text-left py-3 px-4 text-[#555] font-medium uppercase">Envoyé le</th>
                <th className="text-right py-3 px-4 text-[#555] font-medium uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#A0A0A0]">
                    <div className="w-6 h-6 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <Megaphone size={32} className="text-[#333] mx-auto mb-3" />
                    <p className="text-white font-medium">Aucune diffusion trouvée</p>
                  </td>
                </tr>
              ) : (
                paginated.map(bc => {
                  const readCount = readCounts[bc.id] || 0
                  const readRate = bc.recipientCount ? Math.round((readCount / bc.recipientCount) * 100) : 0
                  return (
                    <tr key={bc.id} className="border-b border-[#1E1E1E] hover:bg-[#1A1A1A] transition">
                      <td className="py-3 px-4">
                        <p className="text-white font-medium truncate max-w-[200px]">{bc.title}</p>
                        <p className="text-[10px] text-[#555] truncate max-w-[200px]">{bc.message}</p>
                      </td>
                      <td className="py-3 px-4 text-[#A0A0A0]">
                        {bc.recipientCount}
                        {readRate > 0 && (
                          <span className="text-[10px] ml-2 text-[#2ECC71]">({readRate}% lu)</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                          bc.type === 'info' ? 'bg-[#3498DB]/10 text-[#3498DB]' :
                          bc.type === 'success' ? 'bg-[#2ECC71]/10 text-[#2ECC71]' :
                          bc.type === 'warning' ? 'bg-[#F39C12]/10 text-[#F39C12]' :
                          'bg-[#C9A84C]/10 text-[#C9A84C]'
                        }`}>
                          {bc.type}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                          bc.status === 'sent' ? 'bg-[#2ECC71]/10 text-[#2ECC71]' :
                          bc.status === 'scheduled' ? 'bg-[#F39C12]/10 text-[#F39C12]' :
                          'bg-[#555]/10 text-[#555]'
                        }`}>
                          {bc.status === 'sent' ? 'Envoyé' : bc.status === 'scheduled' ? 'Planifié' : 'Brouillon'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#A0A0A0]">{formatDate(bc.sentAt?.toDate())}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedBroadcast(bc)}
                            className="p-2 text-[#A0A0A0] hover:text-white rounded-lg transition"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => handleResend(bc)}
                            className="p-2 text-[#A0A0A0] hover:text-white rounded-lg transition"
                          >
                            <RotateCcw size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(bc.id)}
                            className="p-2 text-[#E74C3C] hover:text-white rounded-lg transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#1E1E1E]">
            <p className="text-xs text-[#555]">
              {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} sur {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] text-[#A0A0A0] disabled:opacity-40 hover:border-[#C9A84C]/40 transition-all"
              >
                <ChevronLeft size={13} />
              </button>
              <span className="text-xs text-white px-2">{page} / {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] text-[#A0A0A0] disabled:opacity-40 hover:border-[#C9A84C]/40 transition-all"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedBroadcast && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedBroadcast(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-6 max-w-lg w-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">{selectedBroadcast.title}</h2>
                <button onClick={() => setSelectedBroadcast(null)} className="p-2 text-[#A0A0A0] hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-[#1A1A1A] rounded-xl">
                  <p className="text-sm text-white">{selectedBroadcast.message}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-[#555]">Destinataires</p>
                    <p className="text-white font-medium">{selectedBroadcast.recipientCount}</p>
                  </div>
                  <div>
                    <p className="text-[#555]">Lu par</p>
                    <p className="text-white font-medium">
                      {readCounts[selectedBroadcast.id] || 0} ({selectedBroadcast.recipientCount ? Math.round(((readCounts[selectedBroadcast.id] || 0) / selectedBroadcast.recipientCount) * 100) : 0}%)
                    </p>
                  </div>
                  <div>
                    <p className="text-[#555]">Type</p>
                    <p className="text-white font-medium">{selectedBroadcast.type}</p>
                  </div>
                  <div>
                    <p className="text-[#555]">Statut</p>
                    <p className="text-white font-medium">{selectedBroadcast.status}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-[#1E1E1E]">
                  <button
                    onClick={() => { setSelectedBroadcast(null) }}
                    className="flex-1 h-10 bg-[#1A1A1A] border border-[#2A2A2A] text-[#A0A0A0] rounded-xl text-sm"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}