import { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, ScrollView, ActivityIndicator, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { db, auth, storage } from '../lib/firebase';
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
  const [photo, setPhoto] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function pickPhoto() {
    Alert.alert('Add Photo', 'Choose source', [
      {
        text: 'Camera',
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permission needed', 'Camera access is required to take a photo.');
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true, aspect: [4, 3], quality: 0.8,
          });
          if (!result.canceled) setPhoto(result.assets[0].uri);
        },
      },
      {
        text: 'Photo Library',
        onPress: async () => {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permission needed', 'Photo library access is required.');
            return;
          }
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'], allowsEditing: true, aspect: [4, 3], quality: 0.8,
          });
          if (!result.canceled) setPhoto(result.assets[0].uri);
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  async function submit() {
    if (!depth || !location || !auth.currentUser) return;
    setSubmitting(true);
    try {
      // Upload photo first so the URL is available for the Firestore document
      let photoUrl: string | undefined;
      if (photo) {
        const filename = `reports/${auth.currentUser.uid}_${Date.now()}.jpg`;
        const storageRef = ref(storage, filename);
        const blob = await fetch(photo).then(r => r.blob());
        await uploadBytes(storageRef, blob);
        photoUrl = await getDownloadURL(storageRef);
      }

      const now = Timestamp.now();
      await addDoc(collection(db, 'reports'), {
        lat: location.lat,
        lng: location.lng,
        geohash: encodeGeohash(location.lat, location.lng),
        depth,
        ...(photoUrl !== undefined && { photoUrl }),
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
      setPhoto(null);
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

        <Text style={styles.sectionLabel}>Photo (optional)</Text>
        {photo ? (
          <View style={styles.photoPreview}>
            <Image source={{ uri: photo }} style={styles.thumbnail} resizeMode="cover" />
            <TouchableOpacity style={styles.removePhoto} onPress={() => setPhoto(null)}>
              <Text style={styles.removePhotoText}>✕  Remove photo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.photoButton} onPress={pickPhoto} activeOpacity={0.7}>
            <Text style={styles.photoButtonText}>📷  Add photo</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.button, (!depth || !location || submitting) && styles.buttonDisabled]}
          onPress={submit}
          disabled={!depth || !location || submitting}
          activeOpacity={0.8}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {photo ? 'Submit with photo' : 'Submit Report'}
            </Text>
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
  photoButton: {
    borderWidth: 1.5,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  photoButtonText: {
    fontSize: 15,
    color: '#555',
  },
  photoPreview: {
    gap: 10,
  },
  thumbnail: {
    width: '100%',
    height: 180,
    borderRadius: 12,
  },
  removePhoto: {
    alignSelf: 'center',
  },
  removePhotoText: {
    color: '#E24B4A',
    fontSize: 14,
    fontWeight: '600',
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
