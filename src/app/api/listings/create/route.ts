import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb, serverTimestamp } from '@/lib/firebase-admin';

const DAILY_LIMITS = {
  seller: 1,
  showroom: {
    bronze: 20,
    silver: 50,
    gold: Infinity,
  },
} as const;

const EXPIRY_DAYS = {
  seller: 30,
  showroom: 60,
  gold: 9999,
} as const;

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const adminAuth = getAdminAuth();
    let decodedToken;
    
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const uid = decodedToken.uid;
    const adminDb = getAdminDb();
    const userRef = adminDb.collection('users').doc(uid);
    const userSnap = await userRef.get();
    const user = userSnap.data();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.status !== 'active') {
      return NextResponse.json({ error: 'Account not active' }, { status: 403 });
    }

    if (user.role !== 'seller' && user.role !== 'showroom') {
      return NextResponse.json({ error: 'Only sellers and showrooms can post listings' }, { status: 403 });
    }

    const today = new Date().toISOString().split('T')[0];

    // Enforce daily limits
    if (user.role === 'seller') {
      if (user.lastPostDate === today && (user.dailyPostCount || 0) >= DAILY_LIMITS.seller) {
        const now = new Date();
        const midnight = new Date();
        midnight.setHours(24, 0, 0, 0);
        const ms = midnight.getTime() - now.getTime();
        const hours = Math.floor(ms / 3600000);
        const minutes = Math.floor((ms % 3600000) / 60000);
        
        return NextResponse.json({
          error: 'DAILY_LIMIT_REACHED',
          message: `Votre annonce gratuite du jour a été utilisée. Prochaine disponible dans ${hours}h ${minutes}m.`,
          nextAvailableIn: { hours, minutes },
        }, { status: 429 });
      }
    }

    if (user.role === 'showroom') {
      const tierLimits = DAILY_LIMITS.showroom;
      const tier = (user.showroomTier || 'bronze') as 'bronze' | 'silver' | 'gold';
      const limit = tierLimits[tier] ?? tierLimits.bronze;
      
      if (limit !== Infinity && user.lastPostDate === today && (user.dailyPostCount || 0) >= limit) {
        return NextResponse.json({
          error: 'DAILY_LIMIT_REACHED',
          message: `Vous avez atteint la limite de ${limit} annonces pour aujourd'hui.`,
        }, { status: 429 });
      }
    }

    // Get listing data from request
    const body = await req.json();
    
    // Calculate expiry date
    const roleExpiryDays = user.role === 'showroom' 
      ? (user.showroomTier === 'gold' ? EXPIRY_DAYS.gold : EXPIRY_DAYS.showroom)
      : EXPIRY_DAYS.seller;
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + roleExpiryDays);

    // Create the listing
    const listingRef = await adminDb.collection('listings').add({
      ...body,
      sellerId: uid,
      sellerEmail: user.email,
      sellerRole: user.role,
      sellerName: user.displayName,
      sellerWilaya: user.wilaya,
      sellerPhone: user.phone,
      sellerWhatsapp: user.whatsapp,
      isVerified: user.isVerified || false,
      isSold: false,
      viewCount: 0,
      favoriteCount: 0,
      isExpired: false,
      expiresAt: expiresAt.toISOString(),
      postedDate: today,
      status: 'approved',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Update user daily counter
    const newPostCount = user.lastPostDate === today 
      ? (user.dailyPostCount || 0) + 1 
      : 1;

    await userRef.update({
      dailyPostCount: newPostCount,
      lastPostDate: today,
    });

    return NextResponse.json({
      success: true,
      listingId: listingRef.id,
    });
  } catch (error: unknown) {
    console.error('Error creating listing:', error);
    const message = error instanceof Error ? error.message : 'Failed to create listing';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}