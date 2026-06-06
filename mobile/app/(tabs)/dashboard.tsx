import { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import type { Timestamp } from 'firebase/firestore';
import { useAllReports } from '../../hooks/useAllReports';
import { DEPTH_CONFIG } from '../../constants/depth';
import type { FloodReport, ReportStatus } from '../../types';

// ── time helpers ──────────────────────────────────────────────────────────────

function timeAgo(ts: Timestamp): string {
  const mins = Math.floor((Date.now() - ts.toMillis()) / 60_000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const h = Math.floor(mins / 60);
  if (h < 24)    return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function expiryLabel(ts: Timestamp): { text: string; urgent: boolean } {
  const diff = ts.toMillis() - Date.now();
  if (diff <= 0) {
    const mins = Math.floor(-diff / 60_000);
    if (mins < 60) return { text: `Expired ${mins}m ago`, urgent: false };
    return { text: `Expired ${Math.floor(mins / 60)}h ago`, urgent: false };
  }
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return { text: `Expires in ${mins}m`, urgent: true };
  return { text: `Expires in ${Math.floor(mins / 60)}h`, urgent: false };
}

// ── status badge ──────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<ReportStatus, { bg: string; fg: string; label: string }> = {
  pending:   { bg: '#F3F4F6', fg: '#6B7280', label: 'Pending' },
  confirmed: { bg: '#D1FAE5', fg: '#065F46', label: 'Confirmed' },
  disputed:  { bg: '#FEF3C7', fg: '#92400E', label: 'Disputed' },
  expired:   { bg: '#F3F4F6', fg: '#9CA3AF', label: 'Expired' },
};

function StatusBadge({ status }: { status: ReportStatus }) {
  const s = STATUS_STYLE[status];
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <Text style={[styles.badgeText, { color: s.fg }]}>{s.label}</Text>
    </View>
  );
}

// ── report card ───────────────────────────────────────────────────────────────

function ReportCard({ report, onPress }: { report: FloodReport; onPress: () => void }) {
  const [, tick] = useState(0);
  // Re-render every minute so expiry countdown stays current.
  useEffect(() => {
    const id = setInterval(() => tick(t => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const cfg    = DEPTH_CONFIG[report.depth];
  const expiry = expiryLabel(report.expiresAt);
  const isExpired = report.status === 'expired' || report.expiresAt.toMillis() < Date.now();

  return (
    <TouchableOpacity
      style={[styles.card, isExpired && styles.cardExpired]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {/* Depth colour bar */}
      <View style={[styles.depthBar, { backgroundColor: cfg.color }]} />

      <View style={styles.cardBody}>
        {/* Top row */}
        <View style={styles.row}>
          <Text style={[styles.depthLabel, { color: cfg.color }]}>{cfg.label}</Text>
          <StatusBadge status={report.status} />
        </View>

        {/* Middle row */}
        <View style={styles.row}>
          <Text style={styles.meta}>
            {`${report.corroborationCount} report${report.corroborationCount !== 1 ? 's' : ''}`}
            {'  ·  '}
            {`Trust ${report.trustScore}`}
          </Text>
          <Text style={styles.meta}>{timeAgo(report.reportedAt)}</Text>
        </View>

        {/* Bottom row — expiry */}
        <Text style={[styles.expiry, expiry.urgent && styles.expiryUrgent]}>
          {expiry.text}
        </Text>
      </View>

      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

// ── screen ────────────────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const { reports, loading } = useAllReports();
  const router = useRouter();

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#E24B4A" />
      </View>
    );
  }

  const active  = reports.filter(r => r.status !== 'expired' && r.expiresAt.toMillis() > Date.now());
  const expired = reports.filter(r => r.status === 'expired' || r.expiresAt.toMillis() <= Date.now());

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.content}
      data={reports}
      keyExtractor={r => r.id}
      ListHeaderComponent={() => (
        <View style={styles.summary}>
          <SummaryPill label="Active"   count={active.length}  color="#16a34a" />
          <SummaryPill label="Expired"  count={expired.length} color="#9CA3AF" />
          <SummaryPill label="Total"    count={reports.length} color="#3B82F6" />
        </View>
      )}
      renderItem={({ item }) => (
        <ReportCard
          report={item}
          onPress={() => router.push({ pathname: '/alert', params: { reportId: item.id } })}
        />
      )}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
}

function SummaryPill({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <View style={styles.pill}>
      <Text style={[styles.pillCount, { color }]}>{count}</Text>
      <Text style={styles.pillLabel}>{label}</Text>
    </View>
  );
}

// ── styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list:     { flex: 1, backgroundColor: '#f5f5f5' },
  content:  { padding: 16, gap: 0 },

  summary: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  pill: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  pillCount: { fontSize: 22, fontWeight: '800' },
  pillLabel: { fontSize: 11, color: '#888', marginTop: 2, fontWeight: '500' },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  cardExpired: { opacity: 0.55 },
  depthBar:    { width: 5, alignSelf: 'stretch' },
  cardBody:    { flex: 1, padding: 14, gap: 5 },
  chevron:     { fontSize: 22, color: '#ccc', paddingRight: 14 },

  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  depthLabel: { fontSize: 15, fontWeight: '700' },
  meta:       { fontSize: 12, color: '#888' },
  expiry:     { fontSize: 12, color: '#9CA3AF', fontWeight: '500' },
  expiryUrgent: { color: '#E24B4A', fontWeight: '700' },

  badge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: '700' },

  separator: { height: 8 },
});
