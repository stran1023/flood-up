import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { FloodReport } from '../types';

export function useReports() {
  const [reports, setReports] = useState<FloodReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'reports'),
      where('status', 'in', ['pending', 'confirmed']),
      where('expiresAt', '>', Timestamp.now())
    );

    const unsubscribe = onSnapshot(q, snapshot => {
      setReports(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as FloodReport)));
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { reports, loading };
}
