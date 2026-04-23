'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  collection, getDocs, query, where,
  orderBy, doc, updateDoc, serverTimestamp, Timestamp
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import { logAdminAction } from '@/lib/auditLog'
import { QueueCardSkeleton } from '@/components/admin/Skeletons'
import {
  CheckCircle2, XCircle, ChevronLeft, ChevronRight,
  Zap, Car, MapPin, Fuel, Gauge, Calendar,
  Clock, User, AlertTriangle, CheckCheck,
  Keyboard, X, ArrowLeft, RotateCcw,
  Image as ImageIcon, Hash, MessageSquare,
  TrendingUp, Timer
} from 'lucide-react'

interface PendingListing {
  id: string
  title?: string
  make?: string
  model?: string
  year?: number | string
  price?: number
  mileage?: number
  wilaya?: string
  fuel?: string
  transmission?: string
  description?: string
  photos?: string[]
  images?: string[]
  imageUrls?: string[]
  coverImage?: string
  userId?: string
  sellerName?: string
  sellerEmail?: string
  createdAt?: Timestamp | null
  status?: string
}

type DecisionType = 'approved' | 'rejected' | null

interface Decision {
  listingId: string
  type: DecisionType
  timestamp: Date
}

function getMainImage(listing: PendingListing): string | null {
  if (listing.photos?.length) return listing.photos[0]
  if (listing.images?.length) return listing.images[0]
  if (listing.imageUrls?.length) return listing.imageUrls[0]
  if (listing.coverImage) return listing.coverImage
  return null
}

function getAllImages(listing: PendingListing): string[] {
  if (listing.photos?.length) return listing.photos
  if (listing.images?.length) return listing.images
  if (listing.imageUrls?.length) return listing.imageUrls
  if (listing.coverImage) return [listing.coverImage]
  return []
}

function getTitle(listing: PendingListing): string {
  if (listing.title) return listing.title
  const parts = [listing.year, listing.make, listing.model].filter(Boolean)
  return parts.join(' ') || 'Annonce sans titre'
}

function timeAgo(date: Date): string {
  const diff = (Date.now() - date.getTime()) / 1000
  if (diff < 3600) return `il y a ${Math.floor(diff/60)} min`
  if (diff < 86400) return `il y a ${Math.floor(diff/3600)}h`
  return `il y a ${Math.floor(diff/86400)}j`
}

const REJECT_REASONS = [
  'Photos insuffisantes ou floues',
  'Prix irréaliste',
  'Description trop courte',
  'Informations incomplètes',
  'Contenu inapproprié',
  'Doublon détecté',
  'Véhicule non conforme',
  'Photos non authentiques',
]

export default function QueuePage() {
  const { user } = useAuth()
  const [listings, setListings] = useState<PendingListing[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [decisions, setDecisions] = useState<Decision[]>([])
  const [photoIndex, setPhotoIndex] = useState(0)
  const [showReject, setShowReject] = useState(false)
  const [selectedReasons, setSelectedReasons] = useState<string[]>([])
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [sessionStart, setSessionStart] = useState<Date | null>(null)
  const [undoTarget, setUndoTarget] = useState<string | null>(null)
  const [flash, setFlash] = useState<'approve' | 'reject' | null>(null)
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const loadListings = useCallback(async () => {
    if (!db) return
    setLoading(true)
    try {
      const q = query(
        collection(db, 'listings'),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'asc')
      )
      const snap = await getDocs(q)
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as PendingListing))
      setListings(data)
      setCurrentIndex(0)
      setPhotoIndex(0)
      setSessionStart(new Date())
    } catch (e) {
      console.error('Queue load error:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadListings() }, [loadListings])

  const current = listings[currentIndex] || null
  const total = listings.length
  const done = decisions.length
  const photos = current ? getAllImages(current) : []

  const triggerFlash = (type: 'approve' | 'reject') => {
    setFlash(type)
    setTimeout(() => setFlash(null), 600)
  }

  const approve = useCallback(async () => {
    if (!current || !db || processing) return
    setProcessing(true)
    triggerFlash('approve')

    try {
      await updateDoc(doc(db, 'listings', current.id), {
        status: 'approved',
        approvedAt: serverTimestamp(),
        approvedBy: user?.uid || null,
      })

      if (user) {
        await logAdminAction(
          'listing_approved',
          user.uid,
          user.displayName || user.email || 'Admin',
          {
            id: current.id,
            type: 'listing',
            name: getTitle(current),
          }
        )
      }

      setDecisions(prev => [{
        listingId: current.id,
        type: 'approved',
        timestamp: new Date(),
      }, ...prev])

      setUndoTarget(current.id)
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
      undoTimerRef.current = setTimeout(() => setUndoTarget(null), 5000)

      setListings(prev => prev.filter(l => l.id !== current.id))
      setPhotoIndex(0)
    } catch (e) {
      console.error('Approve error:', e)
    } finally {
      setProcessing(false)
    }
  }, [current, processing, user])

  const reject = useCallback(async (reasons: string[] = []) => {
    if (!current || !db || processing) return
    setProcessing(true)
    triggerFlash('reject')
    setShowReject(false)
    setSelectedReasons([])

    try {
      await updateDoc(doc(db, 'listings', current.id), {
        status: 'rejected',
        rejectedAt: serverTimestamp(),
        rejectedBy: user?.uid || null,
        rejectionReasons: reasons,
      })

      if (user) {
        await logAdminAction(
          'listing_rejected',
          user.uid,
          user.displayName || user.email || 'Admin',
          {
            id: current.id,
            type: 'listing',
            name: getTitle(current),
            details: { reasons },
          }
        )
      }

      setDecisions(prev => [{
        listingId: current.id,
        type: 'rejected',
        timestamp: new Date(),
      }, ...prev])

      setUndoTarget(current.id)
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
      undoTimerRef.current = setTimeout(() => setUndoTarget(null), 5000)

      setListings(prev => prev.filter(l => l.id !== current.id))
      setPhotoIndex(0)
    } catch (e) {
      console.error('Reject error:', e)
    } finally {
      setProcessing(false)
    }
  }, [current, processing, user])

  const quickReject = useCallback(() => {
    if (showReject) {
      reject(selectedReasons)
    } else {
      setShowReject(true)
    }
  }, [showReject, reject, selectedReasons])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      switch (e.key.toLowerCase()) {
        case 'a':
          if (!showReject) { e.preventDefault(); approve() }
          break
        case 'r':
          e.preventDefault()
          quickReject()
          break
        case 'escape':
          setShowReject(false)
          setSelectedReasons([])
          break
        case 'arrowleft':
          e.preventDefault()
          if (currentIndex > 0) {
            setCurrentIndex(i => i - 1)
            setPhotoIndex(0)
          }
          break
        case 'arrowright':
          e.preventDefault()
          if (currentIndex < total - 1) {
            setCurrentIndex(i => i + 1)
            setPhotoIndex(0)
          }
          break
        case 'arrowup':
          e.preventDefault()
          setPhotoIndex(i => Math.max(0, i - 1))
          break
        case 'arrowdown':
          e.preventDefault()
          setPhotoIndex(i => Math.min(photos.length - 1, i + 1))
          break
        case '?':
          setShowShortcuts(s => !s)
          break
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [approve, quickReject, showReject, currentIndex, total, photos.length])

  const sessionSeconds = sessionStart
    ? Math.floor((Date.now() - sessionStart.getTime()) / 1000)
    : 0
  const avgSeconds = done > 0 ? Math.round(sessionSeconds / done) : 0
  const approvedCount = decisions.filter(d => d.type === 'approved').length
  const rejectedCount = decisions.filter(d => d.type === 'rejected').length

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-6 w-40 bg-[#1A1A1A] rounded-lg animate-pulse"/>
            <div className="h-3.5 w-56 bg-[#1A1A1A] rounded animate-pulse"/>
          </div>
        </div>
        <QueueCardSkeleton />
      </div>
    )
  }

  if (!loading && listings.length === 0 && done === 0) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5 }}>
            <div className="w-24 h-24 rounded-full bg-[#2ECC71]/10 flex items-center justify-center mx-auto mb-6">
              <CheckCheck size={40} className="text-[#2ECC71]"/>
            </div>
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-2">
            File vide — tout est traité ! 🎉
          </h2>
          <p className="text-[#A0A0A0] text-sm max-w-sm mb-8">
            Aucune annonce en attente d&apos;approbation pour le moment.
            Revenez plus tard ou actualisez pour vérifier de nouvelles soumissions.
          </p>
          <button onClick={loadListings}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#C9A84C] text-black font-semibold text-sm hover:bg-[#E8C96A] transition-all">
            <RotateCcw size={16}/> Actualiser la file
          </button>
        </div>
      </div>
    )
  }

  if (!loading && listings.length === 0 && done > 0) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.4 }}>
            <div className="w-24 h-24 rounded-full bg-[#C9A84C]/10 flex items-center justify-center mx-auto mb-6">
              <Zap size={40} className="text-[#C9A84C]"/>
            </div>
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-2">Session terminée !</h2>
          <p className="text-[#A0A0A0] text-sm max-w-sm mb-8">
            Vous avez traité {done} annonce{done > 1 ? 's' : ''} en {Math.floor(sessionSeconds / 60)}m {sessionSeconds % 60}s.
          </p>
          <div className="grid grid-cols-3 gap-4 w-full max-w-sm mb-8">
            {[
              { val: done, label: 'Traitées', color: '#C9A84C' },
              { val: approvedCount, label: 'Approuvées', color: '#2ECC71' },
              { val: rejectedCount, label: 'Rejetées', color: '#E74C3C' },
            ].map(({ val, label, color }, i) => (
              <div key={i} className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-4 text-center">
                <p className="text-2xl font-bold" style={{ color }}>{val}</p>
                <p className="text-xs text-[#A0A0A0] mt-1">{label}</p>
              </div>
            ))}
          </div>
          <button onClick={loadListings}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#C9A84C] text-black font-semibold text-sm hover:bg-[#E8C96A] transition-all">
            <RotateCcw size={16}/> Nouvelle session
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-5">

      <AnimatePresence>
        {flash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className={`fixed inset-0 z-[100] pointer-events-none ${
              flash === 'approve'
                ? 'bg-[#2ECC71]/08'
                : 'bg-[#E74C3C]/08'
            }`}
          />
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-white flex items-center gap-2">
            <Zap size={20} className="text-[#C9A84C]"/>
            File d&apos;Approbation Rapide
          </h1>
          <p className="text-sm text-[#A0A0A0] mt-0.5">
            {total} annonce{total > 1 ? 's' : ''} en attente ·
            Appuyez sur <kbd className="px-1.5 py-0.5 rounded bg-[#1A1A1A] border border-[#2A2A2A] text-[10px] text-[#C9A84C] mx-1">A</kbd>
            approuver ·
            <kbd className="px-1.5 py-0.5 rounded bg-[#1A1A1A] border border-[#2A2A2A] text-[10px] text-[#E74C3C] mx-1">R</kbd>
            rejeter
          </p>
        </div>
        <div className="flex items-center gap-2">
          {done > 0 && (
            <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl text-xs text-[#A0A0A0]">
              <span className="flex items-center gap-1 text-[#2ECC71]">
                <CheckCircle2 size={12}/> {approvedCount}
              </span>
              <span className="text-[#333]">|</span>
              <span className="flex items-center gap-1 text-[#E74C3C]">
                <XCircle size={12}/> {rejectedCount}
              </span>
              <span className="text-[#333]">|</span>
              <span className="flex items-center gap-1">
                <Timer size={12}/> ~{avgSeconds}s/ann.
              </span>
            </div>
          )}
          <button onClick={() => setShowShortcuts(s => !s)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-[#1A1A1A] border border-[#2A2A2A] text-[#A0A0A0] hover:border-[#C9A84C]/40 transition-all">
            <Keyboard size={13}/> Raccourcis
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-[#A0A0A0]">
          <span>{currentIndex + 1} / {total + done} annonces</span>
          <span>{Math.round(((done) / (total + done)) * 100)}% traité</span>
        </div>
        <div className="h-1.5 bg-[#1A1A1A] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#C9A84C] to-[#2ECC81] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(done / (total + done)) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      <AnimatePresence>
        {showShortcuts && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-[#111111] border border-[#C9A84C]/20 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Keyboard size={14} className="text-[#C9A84C]"/>
                Raccourcis Clavier
              </h3>
              <button onClick={() => setShowShortcuts(false)}
                className="text-[#555] hover:text-white transition-colors">
                <X size={16}/>
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { key: 'A', desc: 'Approuver', color: '#2ECC71' },
                { key: 'R', desc: 'Rejeter', color: '#E74C3C' },
                { key: '← →', desc: 'Annonce préc./suiv.', color: '#C9A84C' },
                { key: '↑ ↓', desc: 'Photo préc./suiv.', color: '#3498DB' },
                { key: 'ESC', desc: 'Fermer', color: '#A0A0A0' },
                { key: '?', desc: 'Afficher racc.', color: '#A0A0A0' },
              ].map(({ key, desc, color }) => (
                <div key={key} className="flex items-center gap-2 p-2 rounded-lg bg-[#1A1A1A]">
                  <kbd className="px-2 py-1 rounded bg-[#111111] border border-[#2A2A2A] text-xs font-bold flex-shrink-0"
                    style={{ color }}>
                    {key}
                  </kbd>
                  <span className="text-xs text-[#A0A0A0]">{desc}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {undoTarget && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 bg-[#1A1A1A] border border-[#C9A84C]/20 rounded-2xl shadow-2xl text-sm">
            <span className="text-[#A0A0A0]">
              {decisions[0]?.type === 'approved' ? '✅ Approuvée' : '❌ Rejetée'}
            </span>
            <div className="h-4 w-px bg-[#333]"/>
            <span className="text-[10px] text-[#555]">undo in 5s</span>
          </motion.div>
        )}
      </AnimatePresence>

      {current && (
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={`bg-[#111111] border rounded-2xl overflow-hidden transition-all duration-200 ${
              flash === 'approve' ? 'border-[#2ECC71]/60 shadow-[0_0_40px_rgba(46,204,113,0.15)]' :
              flash === 'reject' ? 'border-[#E74C3C]/60 shadow-[0_0_40px_rgba(231,76,60,0.15)]' :
              'border-[#2A2A2A]'
            }`}>
            <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px]">

              <div className="relative bg-[#0A0A0A] flex flex-col">
                <div className="relative flex-1 min-h-[300px] lg:min-h-0">
                  {photos.length > 0 ? (
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={photoIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="absolute inset-0">
                        <img
                          src={photos[photoIndex]}
                          alt={getTitle(current)}
                          className="w-full h-full object-cover"
                          onError={e => {
                            (e.target as HTMLImageElement).src =
                              'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%231A1A1A" width="400" height="300"/%3E%3Ctext fill="%23333" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle"%3EImage non disponible%3C/text%3E%3C/svg%3E'
                          }}
                        />
                      </motion.div>
                    </AnimatePresence>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-[#333]">
                      <ImageIcon size={40} className="mb-2"/>
                      <p className="text-xs">Aucune photo</p>
                    </div>
                  )}

                  {photos.length > 1 && (
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-xs text-white flex items-center gap-1.5">
                      <ImageIcon size={11}/>
                      {photoIndex + 1} / {photos.length}
                    </div>
                  )}

                  {photos.length > 1 && (
                    <>
                      <button
                        onClick={() => setPhotoIndex(i => Math.max(0, i - 1))}
                        disabled={photoIndex === 0}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white disabled:opacity-30 hover:bg-black/80 transition-all">
                        <ChevronLeft size={16}/>
                      </button>
                      <button
                        onClick={() => setPhotoIndex(i => Math.min(photos.length - 1, i + 1))}
                        disabled={photoIndex === photos.length - 1}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white disabled:opacity-30 hover:bg-black/80 transition-all">
                        <ChevronRight size={16}/>
                      </button>
                    </>
                  )}
                </div>

                {photos.length > 1 && (
                  <div className="flex gap-1.5 p-3 bg-[#0D0D0D] overflow-x-auto">
                    {photos.map((photo, i) => (
                      <button
                        key={i}
                        onClick={() => setPhotoIndex(i)}
                        className={`w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                          i === photoIndex
                            ? 'border-[#C9A84C]'
                            : 'border-transparent opacity-50 hover:opacity-100'
                        }`}>
                        <img src={photo} alt="" className="w-full h-full object-cover"/>
                      </button>
                    ))}
                  </div>
                )}

                <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm text-[10px] text-[#A0A0A0] font-mono flex items-center gap-1">
                  <Hash size={9}/> {current.id.slice(0, 8)}
                </div>
              </div>

              <div className="flex flex-col p-6 gap-5">

                <div>
                  <h2 className="text-xl font-bold text-white leading-tight">
                    {getTitle(current)}
                  </h2>
                  {current.price && (
                    <p className="text-2xl font-black text-[#C9A84C] mt-1">
                      {current.price.toLocaleString('fr-DZ')} DA
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    current.wilaya && { icon: <MapPin size={13}/>, label: 'Wilaya', val: current.wilaya },
                    current.year && { icon: <Calendar size={13}/>, label: 'Année', val: String(current.year) },
                    current.mileage && { icon: <Gauge size={13}/>, label: 'Kilométrage', val: `${Number(current.mileage).toLocaleString()} km` },
                    current.fuel && { icon: <Fuel size={13}/>, label: 'Carburant', val: current.fuel },
                    current.transmission && { icon: <Car size={13}/>, label: 'Transmission', val: current.transmission },
                    current.sellerName && { icon: <User size={13}/>, label: 'Vendeur', val: current.sellerName },
                  ].filter(Boolean).map((spec, i) => spec && (
                    <div key={i} className="flex items-center gap-2 px-3 py-2 bg-[#1A1A1A] rounded-xl">
                      <span className="text-[#C9A84C] flex-shrink-0">{spec.icon}</span>
                      <div className="min-w-0">
                        <p className="text-[10px] text-[#555]">{spec.label}</p>
                        <p className="text-xs text-white font-medium truncate">{spec.val}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 text-xs text-[#555] px-1">
                  {current.createdAt && (
                    <span className="flex items-center gap-1">
                      <Clock size={11}/>
                      Soumis {timeAgo(current.createdAt.toDate())}
                    </span>
                  )}
                  {photos.length > 0 && (
                    <span className="flex items-center gap-1">
                      <ImageIcon size={11}/>
                      {photos.length} photo{photos.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {current.description && (
                  <div className="flex-1">
                    <p className="text-[10px] text-[#555] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <MessageSquare size={10}/> Description
                    </p>
                    <p className="text-xs text-[#A0A0A0] leading-relaxed line-clamp-4">
                      {current.description}
                    </p>
                  </div>
                )}

                <div className="flex-1"/>

                <AnimatePresence>
                  {showReject && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden">
                      <div className="bg-[#1A0A0A] border border-[#E74C3C]/20 rounded-xl p-4 space-y-3">
                        <p className="text-xs font-semibold text-[#E74C3C] flex items-center gap-1.5">
                          <AlertTriangle size={12}/> Raison(s) du rejet (optionnel)
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {REJECT_REASONS.map(reason => (
                            <button
                              key={reason}
                              onClick={() => setSelectedReasons(prev =>
                                prev.includes(reason)
                                  ? prev.filter(r => r !== reason)
                                  : [...prev, reason]
                              )}
                              className={`px-2.5 py-1.5 rounded-lg text-[11px] border transition-all ${
                                selectedReasons.includes(reason)
                                  ? 'bg-[#E74C3C]/20 border-[#E74C3C]/50 text-[#E74C3C]'
                                  : 'bg-[#1A1A1A] border-[#2A2A2A] text-[#A0A0A0] hover:border-[#E74C3C]/30'
                              }`}>
                              {reason}
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => reject(selectedReasons)}
                            className="flex-1 py-2 rounded-lg bg-[#E74C3C] text-white text-xs font-bold hover:bg-[#C0392B] transition-all">
                            Confirmer le rejet
                          </button>
                          <button
                            onClick={() => { setShowReject(false); setSelectedReasons([]) }}
                            className="px-4 py-2 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] text-[#A0A0A0] text-xs hover:border-[#555] transition-all">
                            Annuler
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!showReject && (
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={quickReject}
                      disabled={processing}
                      className="group flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-[#E74C3C]/10 border-2 border-[#E74C3C]/30 text-[#E74C3C] font-bold text-base hover:bg-[#E74C3C]/20 hover:border-[#E74C3C]/60 hover:shadow-[0_0_30px_rgba(231,76,60,0.2)] disabled:opacity-50 transition-all">
                      <XCircle size={20} className="group-hover:scale-110 transition-transform"/>
                      Rejeter
                      <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-[#E74C3C]/10 border border-[#E74C3C]/20">R</kbd>
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={approve}
                      disabled={processing}
                      className="group flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-[#2ECC71]/10 border-2 border-[#2ECC71]/30 text-[#2ECC71] font-bold text-base hover:bg-[#2ECC71]/20 hover:border-[#2ECC71]/60 hover:shadow-[0_0_30px_rgba(46,204,113,0.2)] disabled:opacity-50 transition-all">
                      <CheckCircle2 size={20} className="group-hover:scale-110 transition-transform"/>
                      Approuver
                      <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-[#2ECC71]/10 border border-[#2ECC71]/20">A</kbd>
                    </motion.button>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-[#555]">
                  <button
                    onClick={() => { setCurrentIndex(i => Math.max(0, i - 1)); setPhotoIndex(0) }}
                    disabled={currentIndex === 0}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-[#1A1A1A] disabled:opacity-30 transition-all">
                    <ArrowLeft size={12}/> Précédente
                  </button>
                  <span>{currentIndex + 1} / {total}</span>
                  <button
                    onClick={() => { setCurrentIndex(i => Math.min(total - 1, i + 1)); setPhotoIndex(0) }}
                    disabled={currentIndex === total - 1}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-[#1A1A1A] disabled:opacity-30 transition-all">
                    Suivante <ChevronRight size={12}/>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {listings.length > 1 && (
        <div className="space-y-2">
          <p className="text-xs text-[#555] flex items-center gap-1.5">
            <TrendingUp size={11}/>
            Prochaines dans la file
          </p>
          <div className="grid grid-cols-3 gap-3">
            {listings.slice(1, 4).map((listing, i) => {
              const img = getMainImage(listing)
              return (
                <button
                  key={listing.id}
                  onClick={() => { setCurrentIndex(i + 1); setPhotoIndex(0) }}
                  className="relative bg-[#111111] border border-[#2A2A2A] rounded-xl overflow-hidden hover:border-[#C9A84C]/30 transition-all group text-left">
                  {img ? (
                    <img src={img} alt="" className="w-full h-20 object-cover opacity-60 group-hover:opacity-80 transition-opacity"/>
                  ) : (
                    <div className="w-full h-20 bg-[#1A1A1A] flex items-center justify-center">
                      <Car size={20} className="text-[#333]"/>
                    </div>
                  )}
                  <div className="p-2">
                    <p className="text-xs text-white truncate font-medium">{getTitle(listing)}</p>
                    {listing.price && (
                      <p className="text-[10px] text-[#C9A84C]">
                        {listing.price.toLocaleString('fr-DZ')} DA
                      </p>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

    </div>
  )
}