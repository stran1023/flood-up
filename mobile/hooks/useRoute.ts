import { useState, useEffect } from 'react';
import { decodePolyline, findFloodsOnRoute, type LatLng } from '../lib/routeUtils';
import { useLocation } from './useLocation';
import type { FloodReport } from '../types';

export interface RouteResult {
  polylinePoints: LatLng[];
  floodsOnRoute: FloodReport[];
  distanceText: string;
  durationText: string;
}

export interface Destination {
  lat: number;
  lng: number;
  label: string;
}

function formatDistance(m: number): string {
  return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`;
}

function formatDuration(s: number): string {
  const mins = Math.round(s / 60);
  if (mins < 60) return `${mins} mins`;
  const h = Math.floor(mins / 60), rem = mins % 60;
  return rem > 0 ? `${h}h ${rem}m` : `${h}h`;
}

export function useRoute(reports: FloodReport[]) {
  const { location } = useLocation();
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Re-check floods whenever live reports change while a route is active.
  useEffect(() => {
    setRoute(cur =>
      cur ? { ...cur, floodsOnRoute: findFloodsOnRoute(cur.polylinePoints, reports) } : null
    );
  }, [reports]);

  async function fetchRoute(destination: Destination) {
    if (!location) { setError('Location not available yet — try again in a moment'); return; }
    setLoading(true);
    setError(null);
    try {
      // OSRM public API — free, no key, OpenStreetMap data. Coords are lng,lat order.
      const url =
        `https://router.project-osrm.org/route/v1/driving/` +
        `${location.lng},${location.lat};${destination.lng},${destination.lat}` +
        `?overview=full&geometries=polyline`;
      const res = await fetch(url, { headers: { 'User-Agent': 'FloodUp/1.0' } });
      const json = await res.json() as {
        code: string;
        routes: Array<{ geometry: string; legs: Array<{ distance: number; duration: number }> }>;
      };
      if (json.code !== 'Ok' || !json.routes?.length) {
        setError('No route found to that destination');
        return;
      }
      const leg = json.routes[0].legs[0];
      const polylinePoints = decodePolyline(json.routes[0].geometry);
      setRoute({
        polylinePoints,
        floodsOnRoute: findFloodsOnRoute(polylinePoints, reports),
        distanceText: formatDistance(leg.distance),
        durationText: formatDuration(leg.duration),
      });
    } catch {
      setError('Network error — check your connection');
    } finally {
      setLoading(false);
    }
  }

  function clearRoute() { setRoute(null); setError(null); }

  return { route, loading, error, fetchRoute, clearRoute };
}
