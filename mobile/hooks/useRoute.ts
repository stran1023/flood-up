import { useState } from 'react';
import { decodePolyline, findFloodsOnRoute, type LatLng } from '../lib/routeUtils';
import { useLocation } from './useLocation';
import type { FloodReport } from '../types';

export interface RouteResult {
  polylinePoints: LatLng[];
  floodsOnRoute: FloodReport[];
  distanceText: string;
  durationText: string;
}

const DIRECTIONS_KEY = process.env.EXPO_PUBLIC_GOOGLE_DIRECTIONS_API_KEY ?? '';

export function useRoute(reports: FloodReport[]) {
  const { location } = useLocation();
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchRoute(destination: string) {
    if (!location) {
      setError('Location not available yet — try again in a moment');
      return;
    }
    if (!DIRECTIONS_KEY) {
      setError('Directions API key not configured (EXPO_PUBLIC_GOOGLE_DIRECTIONS_API_KEY)');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const origin = `${location.lat},${location.lng}`;
      const url =
        `https://maps.googleapis.com/maps/api/directions/json` +
        `?origin=${encodeURIComponent(origin)}` +
        `&destination=${encodeURIComponent(destination)}` +
        `&key=${DIRECTIONS_KEY}`;
      const res = await fetch(url);
      const json = await res.json() as {
        status: string;
        routes: Array<{
          overview_polyline: { points: string };
          legs: Array<{ distance: { text: string }; duration: { text: string } }>;
        }>;
      };
      if (json.status !== 'OK') {
        setError(json.status === 'ZERO_RESULTS' ? 'No route found to that destination' : 'Could not get directions');
        return;
      }
      const leg = json.routes[0].legs[0];
      const polylinePoints = decodePolyline(json.routes[0].overview_polyline.points);
      setRoute({
        polylinePoints,
        floodsOnRoute: findFloodsOnRoute(polylinePoints, reports),
        distanceText: leg.distance.text,
        durationText: leg.duration.text,
      });
    } catch {
      setError('Network error — check your connection');
    } finally {
      setLoading(false);
    }
  }

  function clearRoute() {
    setRoute(null);
    setError(null);
  }

  return { route, loading, error, fetchRoute, clearRoute };
}
