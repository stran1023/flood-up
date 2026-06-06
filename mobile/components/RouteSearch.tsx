import { useState, useRef } from 'react';
import {
  View, TextInput, TouchableOpacity, Text, ActivityIndicator,
  StyleSheet, FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocation } from '../hooks/useLocation';
import type { RouteResult } from '../hooks/useRoute';

interface Prediction {
  place_id: string;
  structured_formatting: { main_text: string; secondary_text: string };
  description: string;
}

interface Props {
  route: RouteResult | null;
  loading: boolean;
  error: string | null;
  onSearch: (destination: string) => void;
  onClear: () => void;
}

const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

export function RouteSearch({ route, loading, error, onSearch, onClear }: Props) {
  const [text, setText] = useState('');
  const [suggestions, setSuggestions] = useState<Prediction[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { top } = useSafeAreaInsets();
  const { location } = useLocation();

  async function fetchSuggestions(input: string) {
    if (!API_KEY || !input.trim()) { setSuggestions([]); return; }
    try {
      const params: Record<string, string> = { input, key: API_KEY, language: 'vi' };
      if (location) {
        params.location = `${location.lat},${location.lng}`;
        params.radius = '50000';
      }
      const qs = new URLSearchParams(params).toString();
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?${qs}`
      );
      const json = await res.json() as { predictions: Prediction[] };
      setSuggestions(json.predictions ?? []);
    } catch {
      setSuggestions([]);
    }
  }

  function handleTextChange(value: string) {
    setText(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 300);
  }

  function selectSuggestion(prediction: Prediction) {
    setText(prediction.description);
    setSuggestions([]);
    onSearch(`place_id:${prediction.place_id}`);
  }

  function handleClear() {
    setText('');
    setSuggestions([]);
    onClear();
  }

  const floodCount = route?.floodsOnRoute.length ?? 0;
  const showBanner = route !== null || error !== null;

  return (
    <View style={[styles.container, { top }]} pointerEvents="box-none">
      {/* Search input */}
      <View style={styles.inputRow} pointerEvents="auto">
        <MaterialIcons name="directions" size={20} color="#3B82F6" />
        <TextInput
          style={styles.input}
          placeholder="Navigate to..."
          placeholderTextColor="#aaa"
          value={text}
          onChangeText={handleTextChange}
          onSubmitEditing={() => {
            if (text.trim()) { setSuggestions([]); onSearch(text.trim()); }
          }}
          returnKeyType="search"
        />
        {loading && <ActivityIndicator size="small" color="#3B82F6" />}
        {!loading && (showBanner || text.length > 0) && (
          <TouchableOpacity onPress={handleClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <MaterialIcons name="close" size={20} color="#888" />
          </TouchableOpacity>
        )}
      </View>

      {/* Autocomplete suggestions */}
      {suggestions.length > 0 && (
        <FlatList
          style={styles.suggestions}
          data={suggestions}
          keyExtractor={item => item.place_id}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={[
                styles.suggestion,
                index < suggestions.length - 1 && styles.suggestionBorder,
              ]}
              onPress={() => selectSuggestion(item)}
              activeOpacity={0.7}
            >
              <MaterialIcons name="place" size={16} color="#E24B4A" style={styles.placeIcon} />
              <View style={styles.suggestionText}>
                <Text style={styles.suggestionMain} numberOfLines={1}>
                  {item.structured_formatting.main_text}
                </Text>
                <Text style={styles.suggestionSub} numberOfLines={1}>
                  {item.structured_formatting.secondary_text}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Result banner */}
      {route && suggestions.length === 0 && (
        <View style={[styles.banner, floodCount > 0 ? styles.bannerWarn : styles.bannerOk]}
          pointerEvents="auto">
          <MaterialIcons
            name={floodCount > 0 ? 'warning' : 'check-circle'}
            size={16}
            color={floodCount > 0 ? '#E24B4A' : '#16a34a'}
          />
          <Text style={[styles.bannerText, { color: floodCount > 0 ? '#E24B4A' : '#16a34a' }]}>
            {floodCount > 0
              ? `${floodCount} flood zone${floodCount !== 1 ? 's' : ''} on your route · ${route.durationText} (${route.distanceText})`
              : `Route looks clear · ${route.durationText} (${route.distanceText})`}
          </Text>
        </View>
      )}

      {/* Error banner */}
      {error && (
        <View style={[styles.banner, styles.bannerError]} pointerEvents="auto">
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
  suggestions: {
    backgroundColor: '#fff',
    borderRadius: 10,
    maxHeight: 240,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  suggestionBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  placeIcon: { marginTop: 1 },
  suggestionText: { flex: 1 },
  suggestionMain: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  suggestionSub:  { fontSize: 12, color: '#888', marginTop: 1 },
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
  bannerWarn:  { backgroundColor: '#fff1f2', borderWidth: 1, borderColor: '#fecdd3' },
  bannerOk:    { backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0' },
  bannerError: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca' },
  bannerText:  { fontSize: 13, fontWeight: '500', flex: 1 },
});
