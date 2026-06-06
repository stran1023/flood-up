import { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, ScrollView, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { encodeGeohash } from '../lib/geo';
import { DepthPicker } from './DepthPicker';
import { ConfirmToast } from './ConfirmToast';
import type { Depth } from '../types';

function getAccountAgeDays(): number {
  const created = auth.currentUser?.metadata.creationTime;
  if (!created) return 0;
  return Math.floor((Date.now() - new Date(created).getTime()) / 86_400_000);
}

interface Props {
  location: { lat: number; lng: number } | null;
  driverMode?: boolean;
}

export function ReportSheet({ location, driverMode }: Props) {
  const router = useRouter();
  const [depth, setDepth] = useState<Depth | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function submit() {
    if (!depth || !location || !auth.currentUser) return;
    setSubmitting(true);
    try {
      const now = Timestamp.now();
      await addDoc(collection(db, 'reports'), {
        lat: location.lat,
        lng: location.lng,
        geohash: encodeGeohash(location.lat, location.lng),
        depth,
        reportedAt: now,
        expiresAt: Timestamp.fromMillis(now.toMillis() + 6 * 60 * 60 * 1000),
        userId: auth.currentUser.uid,
        accountAgeDays: getAccountAgeDays(),
        upvotes: 0,
        downvotes: 0,
        status: 'pending',
        corroborationCount: 1,
        trustScore: 60,
      });

      setDepth(null);
      setSubmitted(true);
      // Show toast for 2 s then go to map so user sees the pin appear
      setTimeout(() => {
        setSubmitted(false);
        router.replace('/(tabs)');
      }, 2000);
    } catch {
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    // Wrapper View so ConfirmToast (position:absolute) is anchored to the
    // screen bounds, not the ScrollView content container.
    <View style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Report a flood</Text>

        <View style={styles.locationRow}>
          <Text style={styles.locationLabel}>Location</Text>
          <Text style={styles.locationValue}>
            {location
              ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`
              : 'Acquiring GPS…'}
          </Text>
        </View>

        <Text style={styles.sectionLabel}>How deep is the water?</Text>
        <DepthPicker selected={depth} onSelect={setDepth} large={driverMode} />

        <TouchableOpacity
          style={[styles.button, (!depth || !location || submitting) && styles.buttonDisabled]}
          onPress={submit}
          disabled={!depth || !location || submitting}
          activeOpacity={0.8}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Submit Report</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {submitted && <ConfirmToast />}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  container: {
    padding: 24,
    gap: 20,
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  locationRow: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 14,
    gap: 4,
  },
  locationLabel: {
    fontSize: 11,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  locationValue: {
    fontSize: 14,
    color: '#333',
    fontVariant: ['tabular-nums'],
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  button: {
    backgroundColor: '#E24B4A',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
