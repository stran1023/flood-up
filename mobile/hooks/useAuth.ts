import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
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
  const [needsHomeSetup, setNeedsHomeSetup] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    let unsubDoc: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, async firebaseUser => {
      if (unsubDoc) { unsubDoc(); unsubDoc = null; }

      setProfileLoaded(false);
      setUser(firebaseUser);

      if (firebaseUser) {
        await ensureUserDoc(firebaseUser);
        let firstSnap = true;
        unsubDoc = onSnapshot(doc(db, 'users', firebaseUser.uid), snap => {
          const data = snap.data();
          setNeedsHomeSetup(!data?.homeGeohash);
          setRole(data?.role ?? 'resident');
          if (firstSnap) {
            firstSnap = false;
            setProfileLoaded(true);
          }
        });
      } else {
        setNeedsHomeSetup(false);
        setRole(null);
        setProfileLoaded(true);
      }
    });

    return () => {
      unsubAuth();
      if (unsubDoc) unsubDoc();
    };
  }, []);

  // loading = true until auth resolves AND first profile snapshot arrives
  return { user, loading: user === undefined || !profileLoaded, needsHomeSetup, role };
}
