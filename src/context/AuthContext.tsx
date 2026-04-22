'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!auth || !db) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser && db) {
        try {
          const docRef = doc(db, 'users', fbUser.uid);
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            setUser(snap.data() as User);
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const login = async (email: string, password: string) => {
    if (!auth) throw new Error('Firebase not initialized');
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email: string, password: string, name: string) => {
    if (!auth || !db) throw new Error('Firebase not initialized');
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    const userData: User = {
      uid: cred.user.uid,
      email,
      displayName: name,
      role: 'user',
      isPro: false,
      isVerified: false,
      totalListings: 0,
      suspended: false,
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'users', cred.user.uid), { ...userData });
    setUser(userData);
  };

  const loginWithGoogle = async () => {
    if (!auth || !db) throw new Error('Firebase not initialized');
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    const docRef = doc(db, 'users', cred.user.uid);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      const userData: User = {
        uid: cred.user.uid,
        email: cred.user.email!,
        displayName: cred.user.displayName || 'Utilisateur',
        photoURL: cred.user.photoURL || undefined,
        role: 'user',
        isPro: false,
        isVerified: false,
        totalListings: 0,
        suspended: false,
        createdAt: new Date().toISOString(),
      };
      await setDoc(docRef, userData);
      setUser(userData);
    } else {
      setUser(snap.data() as User);
    }
  };

  const logout = async () => {
    if (!auth) return;
    await signOut(auth);
    setUser(null);
  };

  const resetPassword = async (email: string) => {
    if (!auth) throw new Error('Firebase not initialized');
    await sendPasswordResetEmail(auth, email);
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, login, register, loginWithGoogle, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
