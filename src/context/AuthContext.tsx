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
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { logUserSession } from '@/lib/sessionTracker';
import { auth, db } from '@/lib/firebase';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
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
            const userData = snap.data() as User;
            
            if (userData.suspended || userData.status === 'suspended') {
              if (auth) await signOut(auth);
              setUser(null);
              window.location.href = '/login?reason=suspended';
              return;
            }
            
            setUser(userData);
            
            const sessionKey = `session_logged_${fbUser.uid}`;
            if (typeof window !== 'undefined' && !sessionStorage.getItem(sessionKey)) {
              sessionStorage.setItem(sessionKey, '1');
              logUserSession(
                fbUser.uid,
                fbUser.email || '',
                fbUser.displayName || '',
                userData.role
              );
            }
          } else {
            // Create new user document if doesn't exist
            const defaultUser: User = {
              uid: fbUser.uid,
              email: fbUser.email || '',
              displayName: fbUser.displayName || 'Utilisateur',
              role: 'buyer', // Default role
              status: 'active',
              createdAt: new Date().toISOString(),
            };
            await setDoc(docRef, defaultUser);
            setUser(defaultUser);
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
    if (!db) throw new Error('Firestore not initialized');

    const credential = await signInWithEmailAndPassword(auth, email, password);
    const userDocRef = doc(db, 'users', credential.user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data() as User;
      if (userData.suspended) {
        await signOut(auth);
        throw new Error('Votre compte a été suspendu. Veuillez contacter l\'administrateur.');
      }
      if (userData.status === 'suspended') {
        await signOut(auth);
        throw new Error('Votre compte a été suspendu. Veuillez contacter l\'administrateur.');
      }
    }
  };

  const register = async (email: string, password: string, name: string, role: UserRole = 'buyer') => {
    if (!auth || !db) throw new Error('Firebase not initialized');
    
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    
    const userData: User = {
      uid: cred.user.uid,
      email,
      displayName: name,
      role,
      status: 'active',
      dailyPostCount: 0,
      lastPostDate: '',
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
        role: 'buyer',
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      await setDoc(docRef, userData);
      setUser(userData);
    } else {
      const userData = snap.data() as User;
      if (userData.suspended) {
        await signOut(auth);
        throw new Error('Votre compte a été suspendu. Veuillez contacter l\'administrateur.');
      }
      if (userData.status === 'suspended') {
        await signOut(auth);
        throw new Error('Votre compte a été suspendu. Veuillez contacter l\'administrateur.');
      }
      setUser(userData);
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

export default AuthContext;