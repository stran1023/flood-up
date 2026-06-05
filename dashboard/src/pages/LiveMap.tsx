import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { FloodReport } from '../types';
import { ClusterAlert } from '../components/ClusterAlert';
import { ReportTable } from '../components/ReportTable';

export function LiveMap() {
  const [reports, setReports] = useState<FloodReport[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, 'reports'),
      where('status', 'in', ['pending', 'confirmed']),
      where('expiresAt', '>', Timestamp.now())
    );

    const unsub = onSnapshot(q, snap => {
      setReports(snap.docs.map(d => ({ id: d.id, ...d.data() } as FloodReport)));
    });

    return unsub;
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ margin: '0 0 16px', color: '#f1f5f9' }}>
        Live Reports
        <span style={{ marginLeft: 12, fontSize: 14, color: '#64748b', fontWeight: 400 }}>
          {reports.length} active
        </span>
      </h2>

      <ClusterAlert reports={reports} />

      {/* Map placeholder — wire up Google Maps or Mapbox in the live-map feature */}
      <div style={{
        background: '#1e293b',
        borderRadius: 8,
        height: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#475569',
        marginBottom: 24,
        fontSize: 14,
      }}>
        Map view (implement in live-map feature)
      </div>

      <ReportTable reports={reports} />
    </div>
  );
}
