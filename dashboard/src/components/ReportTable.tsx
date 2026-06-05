import { useState } from 'react';
import type { FloodReport } from '../types';
import { DEPTH_COLOR, DEPTH_LABEL, STATUS_COLOR } from '../types';

type SortKey = 'reportedAt' | 'depth' | 'trustScore' | 'status';
type SortDir = 'asc' | 'desc';

const DEPTH_ORDER: Record<string, number> = { ankle: 0, knee: 1, waist: 2, chest: 3 };

function sortReports(reports: FloodReport[], key: SortKey, dir: SortDir): FloodReport[] {
  return [...reports].sort((a, b) => {
    let cmp = 0;
    switch (key) {
      case 'reportedAt': cmp = a.reportedAt.toMillis() - b.reportedAt.toMillis(); break;
      case 'depth':      cmp = DEPTH_ORDER[a.depth] - DEPTH_ORDER[b.depth]; break;
      case 'trustScore': cmp = a.trustScore - b.trustScore; break;
      case 'status':     cmp = a.status.localeCompare(b.status); break;
    }
    return dir === 'asc' ? cmp : -cmp;
  });
}

interface Props {
  reports: FloodReport[];
}

export function ReportTable({ reports }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('reportedAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  const sorted = sortReports(reports, sortKey, sortDir);
  const arrow = (key: SortKey) => key === sortKey ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '';

  const th: React.CSSProperties = {
    padding: '8px 12px',
    textAlign: 'left',
    cursor: 'pointer',
    userSelect: 'none',
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '1px solid #1e293b',
  };

  const td: React.CSSProperties = {
    padding: '10px 12px',
    fontSize: 13,
    borderBottom: '1px solid #1e293b',
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={th} onClick={() => handleSort('reportedAt')}>Time{arrow('reportedAt')}</th>
            <th style={th} onClick={() => handleSort('depth')}>Depth{arrow('depth')}</th>
            <th style={th} onClick={() => handleSort('status')}>Status{arrow('status')}</th>
            <th style={th} onClick={() => handleSort('trustScore')}>Trust{arrow('trustScore')}</th>
            <th style={th}>Corroborations</th>
            <th style={th}>Location</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(r => (
            <tr key={r.id} style={{ background: '#0f172a' }}>
              <td style={td}>{r.reportedAt.toDate().toLocaleTimeString()}</td>
              <td style={td}>
                <span style={{
                  background: DEPTH_COLOR[r.depth],
                  color: '#fff',
                  padding: '2px 8px',
                  borderRadius: 4,
                  fontSize: 12,
                }}>
                  {DEPTH_LABEL[r.depth]}
                </span>
              </td>
              <td style={td}>
                <span style={{ color: STATUS_COLOR[r.status], fontWeight: 600 }}>
                  {r.status}
                </span>
              </td>
              <td style={td}>{r.trustScore}</td>
              <td style={td}>{r.corroborationCount}</td>
              <td style={{ ...td, color: '#64748b', fontFamily: 'monospace', fontSize: 11 }}>
                {r.lat.toFixed(5)}, {r.lng.toFixed(5)}
              </td>
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr>
              <td colSpan={6} style={{ ...td, textAlign: 'center', color: '#475569' }}>
                No active reports
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
