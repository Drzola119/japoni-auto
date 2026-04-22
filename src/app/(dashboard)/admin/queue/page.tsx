'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  collection, query, where, orderBy, limit, onSnapshot,
  doc, updateDoc, serverTimestamp, addDoc
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import { logAdminAction } from '@/lib/auditLog'
import {
  Inbox, CheckCircle2, XCircle, Eye, LayoutGrid, List,
  Car, MapPin, Calendar, Gauge, Fuel, BadgeCheck, Clock, AlertTriangle,
  ArrowUpDown
} from 'lucide-react'

interface Listing {
  id: string
  title: string
  price?: number
  images?: string[]
  make?: string
  model?: string
  year?: number
  wilaya?: string
  fuel?: string
  mileage?: number
  description?: string
  sellerId?: string
  sellerName?: string
  sellerVerified?: boolean
  sellerListingsCount?: number
  createdAt?: { toDate: () => Date }
  status?: string
  isPremium?: boolean
}

interface NotificationData {
  userId: string
  title: string
  message: string
  type: string
  read: boolean
  createdAt: unknown
  listingId?: string
}

const REJECTION_REASONS = [
  'Photos de mauvaise qualité',
  'Prix non réaliste',
  'Informations incorrectes',
  'Annonce en double',
  'Véhicule non autorisé',
  'Description insuffisante'
]

function timeAgo(date: Date): string {
  const diff = (Date.now() - date.getTime()) / 1000
  if (diff < 60) return `${Math.floor(diff)}s`
  if (diff < 3600) return `${Math.floor(diff / 60)}min`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return `${Math.floor(diff / 86400)}j`
}

function formatPrice(price: number): string {
  return price.toLocaleString('fr-DZ') + ' DA'
}

export default function QueuePage() {
  const { user } = useAuth()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards')
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'make'>('date')
  const [focusedIndex, setFocusedIndex] = useState(0)
  
  const [rejectModal, setRejectModal] = useState<{ open: boolean; listing: Listing | null }>({ open: false, listing: null })
  const [detailModal, setDetailModal] = useState<{ open: boolean; listing: Listing | null }>({ open: false, listing: null })
  const [rejectReasons, setRejectReasons] = useState<string[]>([])
  const [rejectNote, setRejectNote] = useState('')
  const [processing, setProcessing] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [stats, setStats] = useState({ pending: 0, approvedToday: 0, rejectedToday: 0, avgTime: 15 })
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (!db) return
    const q = query(
      collection(db, 'listings'),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'asc'),
      limit(100)
    )
    const unsub = onSnapshot(q, (snap) => {
      const ls = snap.docs.map(d => ({ id: d.id, ...d.data() } as Listing))
      setListings(ls)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    setStats(prev => ({ ...prev, pending: listings.length }))
  }, [listings.length])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (rejectModal.open || detailModal.open) {
        if (e.key === 'Escape') {
          setRejectModal({ open: false, listing: null })
          setDetailModal({ open: false, listing: null })
        }
        return
      }
      if (listings.length === 0) return
      
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setFocusedIndex(i => Math.min(i + 1, listings.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setFocusedIndex(i => Math.max(i - 1, 0))
      } else if (e.key === 'a' || e.key === 'A') {
        e.preventDefault()
        const listing = listings[focusedIndex]
        if (listing) handleApprove(listing)
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault()
        const listing = listings[focusedIndex]
        if (listing) setRejectModal({ open: true, listing })
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [listings, focusedIndex, rejectModal.open, detailModal.open])

  useEffect(() => {
    cardRefs.current[focusedIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [focusedIndex])

  const sortedListings = useMemo(() => {
    const sorted = [...listings]
    if (sortBy === 'price') sorted.sort((a, b) => (b.price || 0) - (a.price || 0))
    else if (sortBy === 'make') sorted.sort((a, b) => (a.make || '').localeCompare(b.make || ''))
    else sorted.sort((a, b) => {
      const ad = a.createdAt?.toDate()?.getTime() || 0
      const bd = b.createdAt?.toDate()?.getTime() || 0
      return ad - bd
    })
    return sorted
  }, [listings, sortBy])

  const handleApprove = async (listing: Listing) => {
    if (!db || !user) return
    setProcessing(listing.id)
    try {
      await updateDoc(doc(db, 'listings', listing.id), {
        status: 'approved',
        approvedAt: serverTimestamp(),
        approvedBy: user.uid
      })
      await logAdminAction('listing_approved', user.uid, user.displayName || 'Admin', {
        id: listing.id,
        type: 'listing',
        name: listing.title
      })
      setToast(`✅ ${listing.title} approuvée`)
      setTimeout(() => setToast(null), 3000)
    } catch (e) {
      console.error('Approve error:', e)
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async () => {
    if (!db || !user || !rejectModal.listing) return
    setProcessing(rejectModal.listing.id)
    try {
      await updateDoc(doc(db, 'listings', rejectModal.listing.id), {
        status: 'rejected',
        rejectedAt: serverTimestamp(),
        rejectedBy: user.uid,
        rejectionReasons: rejectReasons,
        rejectionNote: rejectNote || null
      })
      if (rejectModal.listing.sellerId) {
        await addDoc(collection(db, 'notifications'), {
          userId: rejectModal.listing!.sellerId,
          title: 'Annonce rejetée',
          message: `Votre annonce "${rejectModal.listing!.title}" a été rejeté${rejectReasons.length > 0 ? ': ' + rejectReasons.join(', ') : '.'}`,
          type: 'warning',
          read: false,
          createdAt: serverTimestamp()
        } as NotificationData)
      }
      await logAdminAction('listing_rejected', user.uid, user.displayName || 'Admin', {
        id: rejectModal.listing.id,
        type: 'listing',
        name: rejectModal.listing.title,
        details: { reasons: rejectReasons }
      })
      setToast(`❌ ${rejectModal.listing.title} rejetée`)
      setTimeout(() => setToast(null), 3000)
      setRejectModal({ open: false, listing: null })
      setRejectReasons([])
      setRejectNote('')
    } catch (e) {
      console.error('Reject error:', e)
    } finally {
      setProcessing(null)
    }
  }

  const handleBulkApprove = async () => {
    if (!db || !user || listings.length === 0) return
    setProcessing('bulk')
    try {
      for (const listing of listings) {
        await updateDoc(doc(db, 'listings', listing.id), {
          status: 'approved',
          approvedAt: serverTimestamp(),
          approvedBy: user.uid
        })
      }
      await logAdminAction('bulk_approve', user.uid, user.displayName || 'Admin', {
        details: { count: listings.length }
      })
      setToast(`✅ ${listings.length} annonces approuvées`)
      setTimeout(() => setToast(null), 3000)
    } catch (e) {
      console.error('Bulk approve error:', e)
    } finally {
      setProcessing(null)
    }
  }

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="p-6 space-y-6"
    >
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 bg-[#111111] border border-[#2A2A2A] rounded-xl px-4 py-3 shadow-xl"
          >
            <p className="text-sm text-white">{toast}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white flex items-center gap-2">
            <Inbox size={20} className="text-[#F39C12]" />
            File d&apos;Approbation
            <span className="bg-[#F39C12]/20 text-[#F39C12] text-xs px-2 py-0.5 rounded-full">
              {listings.length} en attente
            </span>
          </h1>
          <p className="text-sm text-[#A0A0A0] mt-0.5">
            Traitez les annonces rapidement. Approuvez ou rejetez en un clic.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleBulkApprove}
            disabled={listings.length === 0 || processing === 'bulk'}
            className="px-4 py-2 rounded-xl text-xs font-medium bg-[#2ECC71]/10 border border-[#2ECC71]/30 text-[#2ECC71] hover:bg-[#2ECC71] hover:text-black transition-all disabled:opacity-40"
          >
            Tout Approuver
          </button>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'price' | 'make')}
              className="h-10 pl-9 pr-8 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl text-xs text-[#A0A0A0] appearance-none cursor-pointer"
            >
              <option value="date">Trier par: Date</option>
              <option value="price">Trier par: Prix</option>
              <option value="make">Trier par: Marque</option>
            </select>
            <ArrowUpDown size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555] pointer-events-none" />
          </div>
          <div className="flex bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-1">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded-lg ${viewMode === 'cards' ? 'bg-[#C9A84C] text-black' : 'text-[#A0A0A0]'}`}
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-[#C9A84C] text-black' : 'text-[#A0A0A0]'}`}
            >
              <List size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* STATS BAR */}
      <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-4">
        <div className="flex items-center justify-between gap-4 flex-wrap text-xs">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-[#F39C12]" />
            <span className="text-[#A0A0A0]">En Attente:</span>
            <span className="text-white font-bold">{stats.pending}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-[#2ECC71]" />
            <span className="text-[#A0A0A0]">Approuvées aujourd&apos;hui:</span>
            <span className="text-white font-bold">{stats.approvedToday}</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle size={14} className="text-[#E74C3C]" />
            <span className="text-[#A0A0A0]">Rejetées aujourd&apos;hui:</span>
            <span className="text-white font-bold">{stats.rejectedToday}</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-[#3498DB]" />
            <span className="text-[#A0A0A0]">Temps moyen:</span>
            <span className="text-white font-bold">{stats.avgTime || '—'} min</span>
          </div>
        </div>
      </div>

      {/* CARDS VIEW */}
      {viewMode === 'cards' && (
        <AnimatePresence mode="popLayout">
          {sortedListings.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <CheckCircle2 size={64} className="text-[#C9A84C] mb-4" style={{ animation: 'pulse 2s infinite' }} />
              <h2 className="text-xl text-white font-semibold">File d&apos;attente vide !</h2>
              <p className="text-sm text-[#A0A0A0] mt-2">
                La plateforme est à jour. Aucune annonce en attente d&apos;approbation.
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {sortedListings.map((listing, idx) => {
                const isNew = listing.createdAt?.toDate() && (Date.now() - listing.createdAt.toDate().getTime()) < 3600000
                const submittedAt = listing.createdAt?.toDate()
                return (
                  <motion.div
                    key={listing.id}
                    ref={(el) => { cardRefs.current[idx] = el }}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className={`bg-[#111111] border rounded-2xl overflow-hidden transition-all ${
                      focusedIndex === idx ? 'border-[#C9A84C] ring-2 ring-[#C9A84C]/30' : 'border-[#2A2A2A]'
                    }`}
                    onClick={() => setFocusedIndex(idx)}
                  >
                    {/* IMAGE AREA */}
                    <div className="relative aspect-video bg-[#1A1A1A]">
                      {listing.images && listing.images[0] ? (
                        <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Car size={48} className="text-[#333]" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      {submittedAt && (
                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg">
                          {timeAgo(submittedAt)}
                        </div>
                      )}
                      {isNew && (
                        <div className="absolute top-2 left-2 bg-[#2ECC71]/20 text-[#2ECC71] border border-[#2ECC71]/30 text-xs px-2 py-0.5 rounded-full">
                          NOUVEAU
                        </div>
                      )}
                    </div>

                    {/* CONTENT */}
                    <div className="p-4">
                      <h3 className="text-base font-semibold text-white line-clamp-1">{listing.title}</h3>
                      <div className="flex gap-3 flex-wrap text-xs text-[#A0A0A0] mt-1">
                        {listing.wilaya && (
                          <span className="flex items-center gap-1">
                            <MapPin size={12} /> {listing.wilaya}
                          </span>
                        )}
                        {listing.year && (
                          <span className="flex items-center gap-1">
                            <Calendar size={12} /> {listing.year}
                          </span>
                        )}
                        {listing.fuel && (
                          <span className="flex items-center gap-1">
                            <Fuel size={12} /> {listing.fuel}
                          </span>
                        )}
                        {listing.mileage !== undefined && (
                          <span className="flex items-center gap-1">
                            <Gauge size={12} /> {listing.mileage.toLocaleString()} km
                          </span>
                        )}
                      </div>
                      <p className="text-xl font-bold text-[#C9A84C] mt-2">
                        {listing.price ? formatPrice(listing.price) : '—'}
                      </p>

                      {/* SELLER */}
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#1E1E1E]">
                        <div className="w-8 h-8 rounded-full bg-[#C9A84C]/20 text-[#C9A84C] flex items-center justify-center text-xs font-bold">
                          {(listing.sellerName || 'V')[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white font-medium truncate">{listing.sellerName || 'Vendeur'}</p>
                          <p className="text-xs text-[#A0A0A0]">{listing.sellerListingsCount || 0} annonces</p>
                        </div>
                        {listing.sellerVerified && <BadgeCheck size={16} className="text-[#C9A84C]" />}
                      </div>

                      {/* ACTIONS */}
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => setDetailModal({ open: true, listing })}
                          className="w-11 h-11 bg-[#1A1A1A] border border-[#2A2A2A] text-[#A0A0A0] hover:text-white flex items-center justify-center rounded-xl transition-all"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleApprove(listing)}
                          disabled={processing === listing.id}
                          className="flex-1 h-11 bg-[#2ECC71]/10 border border-[#2ECC71]/30 text-[#2ECC71] hover:bg-[#2ECC71] hover:text-black font-bold flex items-center justify-center gap-2 rounded-xl transition-all disabled:opacity-40"
                        >
                          {processing === listing.id ? (
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <CheckCircle2 size={16} />
                              <span>Approuver</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => setRejectModal({ open: true, listing })}
                          className="w-11 h-11 bg-[#E74C3C]/10 border border-[#E74C3C]/30 text-[#E74C3C] hover:bg-[#E74C3C] hover:text-white flex items-center justify-center rounded-xl transition-all"
                        >
                          <XCircle size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </AnimatePresence>
      )}

      {/* LIST VIEW */}
      {viewMode === 'list' && sortedListings.length > 0 && (
        <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#1E1E1E]">
                <th className="text-left py-3 px-4 text-[#555] font-medium uppercase">Photo</th>
                <th className="text-left py-3 px-4 text-[#555] font-medium uppercase">Titre</th>
                <th className="text-left py-3 px-4 text-[#555] font-medium uppercase">Vendeur</th>
                <th className="text-left py-3 px-4 text-[#555] font-medium uppercase">Prix</th>
                <th className="text-left py-3 px-4 text-[#555] font-medium uppercase">Wilaya</th>
                <th className="text-left py-3 px-4 text-[#555] font-medium uppercase">Soumis</th>
                <th className="text-right py-3 px-4 text-[#555] font-medium uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedListings.map((listing, idx) => (
                <motion.tr
                  key={listing.id}
                  className={`border-b border-[#1E1E1E] hover:bg-[#1A1A1A] cursor-pointer ${
                    focusedIndex === idx ? 'bg-[#1A1A1A]' : ''
                  }`}
                  onClick={() => setFocusedIndex(idx)}
                >
                  <td className="py-3 px-4">
                    <div className="w-12 h-8 bg-[#1A1A1A] rounded-lg overflow-hidden">
                      {listing.images?.[0] ? (
                        <img src={listing.images[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Car size={16} className="text-[#333] m-auto mt-2" />
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-white font-medium max-w-[200px] truncate">{listing.title}</td>
                  <td className="py-3 px-4 text-[#A0A0A0]">{listing.sellerName || '—'}</td>
                  <td className="py-3 px-4 text-[#C9A84C] font-bold">{listing.price ? formatPrice(listing.price) : '—'}</td>
                  <td className="py-3 px-4 text-[#A0A0A0]">{listing.wilaya || '—'}</td>
                  <td className="py-3 px-4 text-[#A0A0A0]">
                    {listing.createdAt?.toDate ? timeAgo(listing.createdAt.toDate()) : '—'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleApprove(listing) }}
                        className="p-2 bg-[#2ECC71]/10 text-[#2ECC71] hover:bg-[#2ECC71] hover:text-black rounded-lg transition-all"
                      >
                        <CheckCircle2 size={14} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setRejectModal({ open: true, listing }) }}
                        className="p-2 bg-[#E74C3C]/10 text-[#E74C3C] hover:bg-[#E74C3C] hover:text-white rounded-lg transition-all"
                      >
                        <XCircle size={14} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* KEYBOARD HINTS */}
      <div className="text-center text-xs text-[#555]">
        Raccourcis: <span className="text-[#A0A0A0]">[A] Approuver</span> •{' '}
        <span className="text-[#A0A0A0]">[R] Rejeter</span> •{' '}
        <span className="text-[#A0A0A0]">[↑↓] Naviguer</span> •{' '}
        <span className="text-[#A0A0A0]">[Esc] Fermer</span>
      </div>

      {/* REJECTION MODAL */}
      <AnimatePresence>
        {rejectModal.open && rejectModal.listing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setRejectModal({ open: false, listing: null })}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 mb-4">
                <XCircle size={20} className="text-[#E74C3C]" />
                <h2 className="text-lg font-semibold text-white">Rejeter cette annonce</h2>
              </div>
              <p className="text-sm text-[#A0A0A0] mb-4 truncate">{rejectModal.listing.title}</p>

              <p className="text-sm text-white mb-2">Raison du rejet *</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {REJECTION_REASONS.map((reason) => (
                  <button
                    key={reason}
                    onClick={() => setRejectReasons(prev =>
                      prev.includes(reason) ? prev.filter(r => r !== reason) : [...prev, reason]
                    )}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                      rejectReasons.includes(reason)
                        ? 'bg-[#E74C3C]/10 border border-[#E74C3C]/40 text-[#E74C3C]'
                        : 'bg-[#1A1A1A] border border-[#2A2A2A] text-[#A0A0A0] hover:border-[#E74C3C]/40'
                    }`}
                  >
                    {reason}
                  </button>
                ))}
              </div>

              <p className="text-sm text-white mb-2">Message personnalisé au vendeur</p>
              <textarea
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                placeholder="Expliquez pourquoi l'annonce a été rejetée..."
                className="w-full h-24 p-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl text-sm text-white placeholder:text-[#555] resize-none"
              />

              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setRejectModal({ open: false, listing: null })}
                  className="flex-1 h-11 bg-[#1A1A1A] border border-[#2A2A2A] text-[#A0A0A0] hover:text-white rounded-xl transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={handleReject}
                  disabled={rejectReasons.length === 0 || processing === rejectModal.listing.id}
                  className="flex-1 h-11 bg-[#E74C3C] text-white font-bold rounded-xl transition-all disabled:opacity-40"
                >
                  {processing === rejectModal.listing.id ? '...' : 'Confirmer le Rejet'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DETAIL MODAL */}
      <AnimatePresence>
        {detailModal.open && detailModal.listing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setDetailModal({ open: false, listing: null })}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setDetailModal({ open: false, listing: null })}
                className="absolute top-4 right-4 p-2 text-[#A0A0A0] hover:text-white"
              >
                <XCircle size={20} />
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* IMAGES */}
                <div>
                  <div className="aspect-[4/3] bg-[#1A1A1A] rounded-xl overflow-hidden">
                    {detailModal.listing.images?.[0] ? (
                      <img src={detailModal.listing.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Car size={64} className="text-[#333]" />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-2 overflow-x-auto">
                    {detailModal.listing.images?.slice(0, 5).map((img, i) => (
                      <img key={i} src={img} alt="" className="w-16 h-12 object-cover rounded-lg cursor-pointer" />
                    ))}
                  </div>
                </div>

                {/* DETAILS */}
                <div>
                  <h2 className="text-xl font-bold text-white">{detailModal.listing.title}</h2>
                  <p className="text-2xl text-[#C9A84C] font-bold mt-2">
                    {detailModal.listing.price ? formatPrice(detailModal.listing.price) : '—'}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                    <div className="flex items-center gap-2 text-[#A0A0A0]">
                      <MapPin size={14} /> {detailModal.listing.wilaya || '—'}
                    </div>
                    <div className="flex items-center gap-2 text-[#A0A0A0]">
                      <Calendar size={14} /> {detailModal.listing.year || '—'}
                    </div>
                    <div className="flex items-center gap-2 text-[#A0A0A0]">
                      <Fuel size={14} /> {detailModal.listing.fuel || '—'}
                    </div>
                    <div className="flex items-center gap-2 text-[#A0A0A0]">
                      <Gauge size={14} /> {detailModal.listing.mileage?.toLocaleString() || '—'} km
                    </div>
                  </div>

                  <p className="text-sm text-[#A0A0A0] mt-4 leading-relaxed">
                    {detailModal.listing.description || 'Aucune description.'}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mt-6 pt-6 border-t border-[#1E1E1E]">
                <button
                  onClick={() => detailModal.listing && handleApprove(detailModal.listing)}
                  disabled={!detailModal.listing}
                  className="flex-1 h-11 bg-[#2ECC71]/10 border border-[#2ECC71]/30 text-[#2ECC71] hover:bg-[#2ECC71] hover:text-black font-bold rounded-xl transition-all disabled:opacity-40"
                >
                  Approuver
                </button>
                <button
                  onClick={() => { setDetailModal({ open: false, listing: null }); if (detailModal.listing) setRejectModal({ open: true, listing: detailModal.listing }) }}
                  className="flex-1 h-11 bg-[#E74C3C]/10 border border-[#E74C3C]/30 text-[#E74C3C] hover:bg-[#E74C3C] hover:text-white font-bold rounded-xl transition-all"
                >
                  Rejeter
                </button>
                <button
                  onClick={() => setDetailModal({ open: false, listing: null })}
                  className="flex-1 h-11 bg-[#1A1A1A] border border-[#2A2A2A] text-[#A0A0A0] hover:text-white rounded-xl transition-all"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
    </motion.div>
  )
}