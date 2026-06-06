import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

async function ensureUserDoc(user: User): Promise<void> {
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      fcmTokens: [],
      reportCount: 0,
      trustScore: 0,
      createdAt: serverTimestamp(),
      role: 'resident',
    });
  }
}

export function useAuth() {
  // undefined = still loading; null = signed out; User = signed in
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    return onAuthStateChanged(auth, async firebaseUser => {
      if (firebaseUser) {
        await ensureUserDoc(firebaseUser);
      }
      setUser(firebaseUser);
    });
  }, []);

  return { user, loading: user === undefined };
}
