import { useState } from 'react';
import {
  View, TextInput, TouchableOpacity, Text, ActivityIndicator, StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { RouteResult } from '../hooks/useRoute';

interface Props {
  route: RouteResult | null;
  loading: boolean;
  error: string | null;
  onSearch: (destination: string) => void;
  onClear: () => void;
}

export function RouteSearch({ route, loading, error, onSearch, onClear }: Props) {
  const [text, setText] = useState('');

  function handleSubmit() {
    const dest = text.trim();
    if (dest) onSearch(dest);
  }

  function handleClear() {
    setText('');
    onClear();
  }

  const floodCount = route?.floodsOnRoute.length ?? 0;
  const showBanner = route !== null || error !== null;

  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.inputRow}>
        <MaterialIcons name="directions" size={20} color="#3B82F6" />
        <TextInput
          style={styles.input}
          placeholder="Navigate to..."
          placeholderTextColor="#aaa"
          value={text}
          onChangeText={setText}
          onSubmitEditing={handleSubmit}
          returnKeyType="search"
        />
        {loading && <ActivityIndicator size="small" color="#3B82F6" />}
        {!loading && showBanner && (
          <TouchableOpacity onPress={handleClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <MaterialIcons name="close" size={20} color="#888" />
          </TouchableOpacity>
        )}
      </View>

      {route && (
        <View style={[styles.banner, floodCount > 0 ? styles.bannerWarn : styles.bannerOk]}>
          <MaterialIcons
            name={floodCount > 0 ? 'warning' : 'check-circle'}
            size={16}
            color={floodCount > 0 ? '#E24B4A' : '#16a34a'}
          />
          <Text style={[styles.bannerText, { color: floodCount > 0 ? '#E24B4A' : '#16a34a' }]}>
            {floodCount > 0
              ? `${floodCount} flood zone${floodCount !== 1 ? 's' : ''} on your route · ${route.durationText} (${route.distanceText})`
              : `Route looks clear · ${route.durationText} (${route.distanceText})`}
          </Text>
        </View>
      )}

      {error && (
        <View style={[styles.banner, styles.bannerError]}>
          <MaterialIcons name="error-outline" size={16} color="#991b1b" />
          <Text style={[styles.bannerText, { color: '#991b1b' }]}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 12,
    gap: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1a1a1a',
    padding: 0,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  bannerWarn: { backgroundColor: '#fff1f2', borderWidth: 1, borderColor: '#fecdd3' },
  bannerOk:   { backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0' },
  bannerError: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca' },
  bannerText: { fontSize: 13, fontWeight: '500', flex: 1 },
});
