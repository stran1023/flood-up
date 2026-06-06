import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { FloodReport } from '../types';

export function useAllReports(count = 60) {
  const [reports, setReports] = useState<FloodReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'reports'),
      orderBy('reportedAt', 'desc'),
      limit(count)
    );
    const unsub = onSnapshot(q, snap => {
      setReports(snap.docs.map(d => ({ id: d.id, ...d.data() } as FloodReport)));
      setLoading(false);
    });
    return unsub;
  }, [count]);

  return { reports, loading };
}
