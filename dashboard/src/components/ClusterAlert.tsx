import type { FloodReport } from '../types';
import { distanceBetween } from 'geofire-common';

const CLUSTER_RADIUS_KM = 1;
const CLUSTER_THRESHOLD = 5;

function findLargestCluster(reports: FloodReport[]): FloodReport[] {
  let best: FloodReport[] = [];

  for (const anchor of reports) {
    const cluster = reports.filter(r =>
      distanceBetween([r.lat, r.lng], [anchor.lat, anchor.lng]) <= CLUSTER_RADIUS_KM
    );
    if (cluster.length > best.length) best = cluster;
  }

  return best;
}

interface Props {
  reports: FloodReport[];
}

export function ClusterAlert({ reports }: Props) {
  const confirmed = reports.filter(r => r.status === 'confirmed');
  const cluster = findLargestCluster(confirmed);

  if (cluster.length < CLUSTER_THRESHOLD) return null;

  const depths = cluster.map(r => r.depth);
  const worst = (['chest', 'waist', 'knee', 'ankle'] as const).find(d => depths.includes(d)) ?? 'ankle';

  return (
    <div style={{
      background: '#7f1d1d',
      border: '1px solid #ef4444',
      borderRadius: 8,
      padding: '12px 16px',
      marginBottom: 16,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
    }}>
      <span style={{ fontSize: 20 }}>⚠️</span>
      <div>
        <strong style={{ color: '#fca5a5' }}>Cluster Alert</strong>
        <div style={{ fontSize: 13, color: '#fecaca', marginTop: 2 }}>
          {cluster.length} confirmed reports within {CLUSTER_RADIUS_KM} km — worst depth:{' '}
          <strong>{worst}</strong>
        </div>
      </div>
    </div>
  );
}
