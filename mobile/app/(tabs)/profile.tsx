import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import type { AppUser } from '../../types';

export default function ProfileScreen() {
  const user = auth.currentUser;
  const [profile, setProfile] = useState<AppUser | null>(null);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, 'users', user.uid)).then(snap => {
      if (snap.exists()) setProfile(snap.data() as AppUser);
    });
  }, [user]);

  async function handleSignOut() {
    try {
      await signOut(auth);
    } catch {
      Alert.alert('Error', 'Failed to sign out.');
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.email}>{user?.email ?? 'Anonymous'}</Text>
        <Text style={styles.role}>{profile?.role ?? 'resident'}</Text>
      </View>

      <View style={styles.stats}>
        <StatRow label="Reports submitted" value={profile?.reportCount ?? 0} />
        <StatRow label="Trust score" value={profile?.trustScore ?? 0} />
      </View>

      <TouchableOpacity style={styles.signOut} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign out</Text>
      </TouchableOpacity>
    </View>
  );
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 24, gap: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    gap: 4,
  },
  email: { fontSize: 16, fontWeight: '600', color: '#1a1a1a' },
  role: { fontSize: 13, color: '#888', textTransform: 'capitalize' },
  stats: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  statLabel: { fontSize: 14, color: '#555' },
  statValue: { fontSize: 14, fontWeight: '700', color: '#1a1a1a' },
  signOut: {
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  signOutText: { color: '#E24B4A', fontWeight: '600', fontSize: 15 },
});
