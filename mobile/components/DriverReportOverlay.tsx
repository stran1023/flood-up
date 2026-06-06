import { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, SafeAreaView,
} from 'react-native';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import * as Location from 'expo-location';
import { db, auth } from '../lib/firebase';
import { encodeGeohash } from '../lib/geo';
import { DEPTH_CONFIG } from '../constants/depth';
import type { Depth } from '../types';

function getAccountAgeDays(): number {
  const created = auth.currentUser?.metadata.creationTime;
  if (!created) return 0;
  return Math.floor((Date.now() - new Date(created).getTime()) / 86_400_000);
}

export function DriverReportOverlay() {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  async function submit(depth: Depth) {
    if (!auth.currentUser || submitting) return;
    setSubmitting(true);
    try {
      // Fresh GPS fix — drivers move between reports
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      const now = Timestamp.now();
      await addDoc(collection(db, 'reports'), {
        lat, lng,
        geohash: encodeGeohash(lat, lng),
        depth,
        reportedAt: now,
        expiresAt: Timestamp.fromMillis(now.toMillis() + 6 * 60 * 60 * 1000),
        userId: auth.currentUser!.uid,
        accountAgeDays: getAccountAgeDays(),
        upvotes: 0,
        downvotes: 0,
        status: 'pending',
        corroborationCount: 1,
        trustScore: 60,
      });

      setOpen(false);
      setConfirmed(true);
      setTimeout(() => setConfirmed(false), 2500);
    } catch {
      // Fail silently — driver is driving; no modal dialogs
    } finally {
      setSubmitting(false);
    }
  }

  return (
    // pointerEvents="box-none" lets map touches through when overlay is closed
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {open && (
        <View style={styles.backdrop} pointerEvents="auto">
          <SafeAreaView style={styles.sheet}>
            <Text style={styles.sheetTitle}>How deep is the water?</Text>

            {submitting ? (
              <View style={styles.spinnerRow}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.spinnerText}>Submitting…</Text>
              </View>
            ) : (
              (Object.keys(DEPTH_CONFIG) as Depth[]).map(depth => {
                const { label, color } = DEPTH_CONFIG[depth];
                return (
                  <TouchableOpacity
                    key={depth}
                    style={[styles.depthButton, { backgroundColor: color }]}
                    onPress={() => submit(depth)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.depthLabel}>{label}</Text>
                  </TouchableOpacity>
                );
              })
            )}

            <TouchableOpacity style={styles.cancelButton} onPress={() => setOpen(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </View>
      )}

      {/* Persistent FAB — always visible for drivers */}
      <SafeAreaView style={styles.fabContainer} pointerEvents="box-none">
        <TouchableOpacity
          style={[styles.fab, confirmed && styles.fabConfirmed]}
          onPress={() => setOpen(o => !o)}
          activeOpacity={0.85}
        >
          <Text style={styles.fabText}>
            {confirmed ? '✓  Reported' : '⚠  Report Flood'}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    gap: 12,
  },
  sheetTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  depthButton: {
    paddingVertical: 22,
    borderRadius: 14,
    alignItems: 'center',
  },
  depthLabel: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  spinnerRow: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  spinnerText: {
    color: '#fff',
    fontSize: 15,
  },
  cancelButton: {
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  cancelText: {
    color: '#aaa',
    fontSize: 15,
    fontWeight: '600',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: 24,
  },
  fab: {
    backgroundColor: '#E24B4A',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  fabConfirmed: {
    backgroundColor: '#4CAF50',
  },
  fabText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 17,
    letterSpacing: 0.3,
  },
});
