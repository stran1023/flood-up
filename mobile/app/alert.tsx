import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, onSnapshot, updateDoc, increment, type Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { DEPTH_CONFIG } from '../constants/depth';
import type { FloodReport } from '../types';

function timeAgo(ts: Timestamp): string {
  const mins = Math.floor((Date.now() - ts.toMillis()) / 60_000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function AlertScreen() {
  const { reportId } = useLocalSearchParams<{ reportId: string }>();
  const router = useRouter();
  const [report, setReport] = useState<FloodReport | null>(null);

  useEffect(() => {
    if (!reportId) return;
    const unsub = onSnapshot(doc(db, 'reports', reportId), snap => {
      if (snap.exists()) setReport({ id: snap.id, ...snap.data() } as FloodReport);
    });
    return unsub;
  }, [reportId]);

  async function vote(field: 'upvotes' | 'downvotes') {
    if (!reportId) return;
    try {
      await updateDoc(doc(db, 'reports', reportId), { [field]: increment(1) });
      setReport(r => r ? { ...r, [field]: r[field] + 1 } : r);
    } catch {
      Alert.alert('Error', 'Could not record your vote.');
    }
  }

  if (!report) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#E24B4A" />
      </View>
    );
  }

  const config = DEPTH_CONFIG[report.depth];

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <View style={[styles.depthBadge, { backgroundColor: config.color }]}>
        <Text style={styles.depthLabel}>{config.label}</Text>
      </View>

      <View style={styles.meta}>
        <MetaRow label="Reported"   value={timeAgo(report.reportedAt)} />
        <MetaRow label="Status"     value={report.status} />
        <MetaRow label="Reports"    value={`${report.corroborationCount} nearby`} />
        <MetaRow label="Trust"      value={`${report.trustScore} / 100`} />
        <MetaRow label="Location"   value={`${report.lat.toFixed(5)}, ${report.lng.toFixed(5)}`} />
      </View>

      <View style={styles.voteRow}>
        <TouchableOpacity style={[styles.voteButton, styles.voteUp]} onPress={() => vote('upvotes')}>
          <Text style={styles.voteText}>Still flooded  {report.upvotes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.voteButton, styles.voteDown]} onPress={() => vote('downvotes')}>
          <Text style={styles.voteText}>Looks clear  {report.downvotes}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function MetaRow({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.metaRow}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 24, gap: 20 },
  back: { alignSelf: 'flex-start' },
  backText: { color: '#E24B4A', fontSize: 15, fontWeight: '600' },
  depthBadge: {
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: 'center',
  },
  depthLabel: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  meta: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden' },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  metaLabel: { fontSize: 14, color: '#888' },
  metaValue: { fontSize: 14, fontWeight: '600', color: '#1a1a1a', textTransform: 'capitalize' },
  voteRow: { flexDirection: 'row', gap: 12 },
  voteButton: { flex: 1, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  voteUp:   { backgroundColor: '#4CAF50' },
  voteDown: { backgroundColor: '#9E9E9E' },
  voteText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
