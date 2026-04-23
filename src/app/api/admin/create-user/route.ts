import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb, serverTimestamp } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    // Verify admin authorization
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

    const adminUid = decodedToken.uid;
    const adminDb = getAdminDb();
    
    // Check if caller is admin
    const adminDoc = await adminDb.collection('users').doc(adminUid).get();
    const adminData = adminDoc.data();
    
    if (!adminData || adminData.role !== 'admin') {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 });
    }

    // Get request body - support both buyer/seller and showroom creation
    const { 
      email, 
      password, 
      displayName, 
      role = 'buyer',
      phone,
      wilaya,
      showroomName,
      showroomTier,
      showroomAddress,
      showroomWilaya,
      showroomApplicationId,
    } = await req.json();
    
    if (!email || !password || !displayName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create Firebase Auth user
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName,
      emailVerified: true,
    });

    // Build user document based on role
    const userDoc: Record<string, unknown> = {
      uid: userRecord.uid,
      email,
      displayName,
      role,
      status: 'active',
      dailyPostCount: 0,
      lastPostDate: '',
      createdAt: serverTimestamp(),
    };

    // Add common fields if provided
    if (phone) userDoc.phone = phone;
    if (wilaya) userDoc.wilaya = wilaya;

    // Add showroom-specific fields if role is showroom
    if (role === 'showroom') {
      userDoc.isVerified = true;
      userDoc.showroomTier = showroomTier || 'bronze';
      if (showroomName) userDoc.showroomName = showroomName;
      if (showroomAddress) userDoc.showroomAddress = showroomAddress;
      if (showroomWilaya) userDoc.showroomWilaya = showroomWilaya;
      if (showroomApplicationId) userDoc.showroomApplicationId = showroomApplicationId;
    }

    // Create user document in Firestore
    await adminDb.collection('users').doc(userRecord.uid).set(userDoc);

    return NextResponse.json({
      success: true,
      uid: userRecord.uid,
    });
  } catch (error: unknown) {
    console.error('Error creating user:', error);
    const message = error instanceof Error ? error.message : 'Failed to create user';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}