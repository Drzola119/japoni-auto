import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, QueryConstraint } from 'firebase/firestore';
import { db } from './firebase';

// Helper generic functions to perform CRUD operations
export const fetchDocument = async <T,>(collectionName: string, id: string): Promise<T | null> => {
  const docRef = doc(db, collectionName, id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return docSnap.data() as T;
  }
  return null;
};

export const fetchDocuments = async <T,>(collectionName: string, constraints: QueryConstraint[] = []): Promise<T[]> => {
  const collRef = collection(db, collectionName);
  const q = query(collRef, ...constraints);
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
};

export const createDocument = async <T extends { id?: string }>(collectionName: string, id: string, data: T): Promise<void> => {
  const docRef = doc(db, collectionName, id);
  await setDoc(docRef, data);
};

export const updateDocument = async <T,>(collectionName: string, id: string, data: Partial<T>): Promise<void> => {
  const docRef = doc(db, collectionName, id);
  await updateDoc(docRef, data as Record<string, unknown>);
};

export const deleteDocument = async (collectionName: string, id: string): Promise<void> => {
  const docRef = doc(db, collectionName, id);
  await deleteDoc(docRef);
};
