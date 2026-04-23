import {
  collection, addDoc, serverTimestamp,
  getDocs, query, where, orderBy,
  limit, Timestamp, increment,
  doc, setDoc, getDoc
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

export interface SearchEvent {
  id?: string
  term: string
  category: 'make' | 'wilaya' | 'price_range' | 'model' | 'keyword' | 'combined'
  make?: string | null
  model?: string | null
  wilaya?: string | null
  minPrice?: number | null
  maxPrice?: number | null
  resultsCount?: number
  userId?: string | null
  createdAt?: Timestamp | null
}

export interface SearchTrendItem {
  term: string
  category: string
  count: number
  trend: 'up' | 'down' | 'stable'
  trendPct: number
  lastSeen: Date
}

const debounceMap = new Map<string, ReturnType<typeof setTimeout>>()

export async function trackSearch(params: {
  make?: string
  model?: string
  wilaya?: string
  minPrice?: number
  maxPrice?: number
  keyword?: string
  resultsCount?: number
  userId?: string
}): Promise<void> {
  if (!db || typeof window === 'undefined') return

  const parts: string[] = []
  if (params.make) parts.push(params.make)
  if (params.model) parts.push(params.model)
  if (params.wilaya) parts.push(params.wilaya)
  if (params.keyword) parts.push(params.keyword)
  if (params.minPrice || params.maxPrice) {
    const min = params.minPrice ? `${(params.minPrice/1000000).toFixed(1)}M` : '0'
    const max = params.maxPrice ? `${(params.maxPrice/1000000).toFixed(1)}M` : '+'
    parts.push(`${min}–${max} DA`)
  }

  const term = parts.join(' · ').trim()
  if (!term || term.length < 2) return

  let category: SearchEvent['category'] = 'keyword'
  const hasFilters = [params.make, params.model, params.wilaya].filter(Boolean).length
  if (hasFilters >= 2) category = 'combined'
  else if (params.make) category = 'make'
  else if (params.wilaya) category = 'wilaya'
  else if (params.minPrice || params.maxPrice) category = 'price_range'
  else if (params.model) category = 'model'

  const debounceKey = `${term}_${params.userId || 'anon'}`
  const existing = debounceMap.get(debounceKey)
  if (existing) clearTimeout(existing)

  debounceMap.set(debounceKey, setTimeout(async () => {
    debounceMap.delete(debounceKey)
    try {
      await addDoc(collection(db!, 'search_events'), {
        term,
        category,
        make: params.make || null,
        model: params.model || null,
        wilaya: params.wilaya || null,
        minPrice: params.minPrice || null,
        maxPrice: params.maxPrice || null,
        resultsCount: params.resultsCount ?? null,
        userId: params.userId || null,
        createdAt: serverTimestamp(),
      })

      const termKey = term.toLowerCase().replace(/[^a-z0-9\s·\-]/g, '').slice(0, 100)
      const aggRef = doc(db!, 'search_aggregates', termKey)
      const aggSnap = await getDoc(aggRef)

      if (aggSnap.exists()) {
        await setDoc(aggRef, {
          term,
          category,
          count: increment(1),
          lastSeen: serverTimestamp(),
        }, { merge: true })
      } else {
        await setDoc(aggRef, {
          term,
          category,
          count: 1,
          lastSeen: serverTimestamp(),
          make: params.make || null,
          wilaya: params.wilaya || null,
          createdAt: serverTimestamp(),
        })
      }
    } catch (e) {
      console.warn('Search tracking failed silently:', e)
    }
  }, 1500))
}

export async function getTopSearches(options: {
  limitCount?: number
  days?: number
  category?: SearchEvent['category'] | 'all'
} = {}): Promise<SearchTrendItem[]> {
  if (!db) return []

  const { limitCount = 10, days = 7, category = 'all' } = options

  try {
    const since = new Date()
    since.setDate(since.getDate() - days)

    const constraints = [
      where('createdAt', '>=', Timestamp.fromDate(since)),
      orderBy('createdAt', 'desc'),
      limit(500),
    ]

    const snap = await getDocs(query(collection(db, 'search_events'), ...constraints))

    const counts = new Map<string, {
      term: string; category: string; count: number; lastSeen: Date
    }>()

    snap.docs.forEach(d => {
      const data = d.data() as SearchEvent
      if (category !== 'all' && data.category !== category) return

      const key = data.term.toLowerCase()
      const existing = counts.get(key)
      const date = data.createdAt?.toDate() || new Date()

      if (existing) {
        existing.count++
        if (date > existing.lastSeen) existing.lastSeen = date
      } else {
        counts.set(key, {
          term: data.term,
          category: data.category,
          count: 1,
          lastSeen: date,
        })
      }
    })

    const sorted = Array.from(counts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limitCount)

    const prevSince = new Date(since)
    prevSince.setDate(prevSince.getDate() - days)

    const prevSnap = await getDocs(query(
      collection(db, 'search_events'),
      where('createdAt', '>=', Timestamp.fromDate(prevSince)),
      where('createdAt', '<', Timestamp.fromDate(since)),
      orderBy('createdAt', 'desc'),
      limit(500)
    ))

    const prevCounts = new Map<string, number>()
    prevSnap.docs.forEach(d => {
      const data = d.data() as SearchEvent
      const key = data.term.toLowerCase()
      prevCounts.set(key, (prevCounts.get(key) || 0) + 1)
    })

    return sorted.map(item => {
      const prevCount = prevCounts.get(item.term.toLowerCase()) || 0
      const trendPct = prevCount === 0
        ? 100
        : Math.round(((item.count - prevCount) / prevCount) * 100)

      return {
        ...item,
        trend: trendPct > 5 ? 'up' : trendPct < -5 ? 'down' : 'stable',
        trendPct: Math.abs(trendPct),
      }
    })
  } catch (e) {
    console.error('getTopSearches error:', e)
    return []
  }
}

export async function getSearchCount(days = 7): Promise<number> {
  if (!db) return 0
  try {
    const since = new Date()
    since.setDate(since.getDate() - days)
    const snap = await getDocs(query(
      collection(db, 'search_events'),
      where('createdAt', '>=', Timestamp.fromDate(since)),
      limit(1000)
    ))
    return snap.size
  } catch {
    return 0
  }
}