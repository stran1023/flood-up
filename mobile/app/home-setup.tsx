import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';
import { doc, updateDoc } from 'firebase/firestore';
import { geohashForLocation } from 'geofire-common';
import { auth, db } from '../lib/firebase';

export default function HomeSetupScreen() {
  const router = useRouter();
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const isEdit = edit === '1';

  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [locating, setLocating] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleUseLocation() {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Location permission is required to set your home area.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLat(pos.coords.latitude);
      setLng(pos.coords.longitude);
    } catch {
      Alert.alert('Error', 'Could not get your location. Please try again.');
    } finally {
      setLocating(false);
    }
  }

  async function handleSave() {
    if (lat === null || lng === null) {
      Alert.alert('No location', 'Please tap "Use my location" first.');
      return;
    }
    const user = auth.currentUser;
    if (!user) return;

    setSaving(true);
    try {
      const homeGeohash = geohashForLocation([lat, lng], 7);
      await updateDoc(doc(db, 'users', user.uid), { homeLat: lat, homeLng: lng, homeGeohash });
      // onSnapshot in useAuth fires before this resolves (optimistic local commit),
      // so needsHomeSetup is already false by the time _layout.tsx re-evaluates.
      router.replace('/(tabs)');
    } catch {
      Alert.alert('Error', 'Failed to save home location. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {isEdit ? 'Edit home location' : 'Set your home area'}
        </Text>
        <Text style={styles.subtitle}>
          We use this to send you flood alerts near your home.
        </Text>
      </View>

      <View style={styles.card}>
        <TouchableOpacity
          style={[styles.locateBtn, locating && styles.btnDisabled]}
          onPress={handleUseLocation}
          disabled={locating || saving}
        >
          {locating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.locateBtnText}>Use my location</Text>
          )}
        </TouchableOpacity>

        {lat !== null && lng !== null && (
          <View style={styles.coordRow}>
            <Text style={styles.coordLabel}>Selected location</Text>
            <Text style={styles.coordValue}>
              {lat.toFixed(5)}, {lng.toFixed(5)}
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[styles.saveBtn, (lat === null || saving) && styles.btnDisabled]}
        onPress={handleSave}
        disabled={lat === null || saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveBtnText}>Save home location</Text>
        )}
      </TouchableOpacity>

      {isEdit && (
        <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 24, gap: 20 },
  header: { marginTop: 16, gap: 8 },
  title: { fontSize: 24, fontWeight: '800', color: '#1a1a1a' },
  subtitle: { fontSize: 14, color: '#666', lineHeight: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    gap: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  locateBtn: {
    backgroundColor: '#4A90E2',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  locateBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  coordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e0e0e0',
  },
  coordLabel: { fontSize: 13, color: '#888' },
  coordValue: { fontSize: 13, fontWeight: '600', color: '#1a1a1a' },
  saveBtn: {
    backgroundColor: '#E24B4A',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  btnDisabled: { opacity: 0.45 },
  cancelBtn: { alignItems: 'center', paddingVertical: 8 },
  cancelText: { color: '#888', fontSize: 14 },
});
