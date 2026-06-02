import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { encodeGeohash } from '../lib/geo';
import { DepthPicker } from './DepthPicker';
import { ConfirmToast } from './ConfirmToast';
import type { Depth } from '../types';

interface Props {
  location: { lat: number; lng: number } | null;
  driverMode?: boolean;
}

export function ReportSheet({ location, driverMode }: Props) {
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
        accountAgeDays: 0,
        upvotes: 0,
        downvotes: 0,
        status: 'pending',
        corroborationCount: 1,
        trustScore: 60,
      });
      setSubmitted(true);
      setDepth(null);
      setTimeout(() => setSubmitted(false), 3000);
    } catch {
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
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
        <Text style={styles.buttonText}>
          {submitting ? 'Submitting…' : 'Submit Report'}
        </Text>
      </TouchableOpacity>

      {submitted && <ConfirmToast />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
