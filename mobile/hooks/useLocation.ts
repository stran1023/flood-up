import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import * as Location from 'expo-location';

interface Coords {
  lat: number;
  lng: number;
}

export function useLocation() {
  const [location, setLocation] = useState<Coords | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Re-fetch each time this screen comes into focus so GPS is always fresh.
  // Tab screens stay mounted — useEffect([]) would not re-run on tab switch.
  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLocation(null);
      (async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (!active) return;
        if (status !== 'granted') {
          setError('Location permission denied');
          return;
        }
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        if (active) setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      })();
      return () => { active = false; };
    }, [])
  );

  return { location, error };
}
