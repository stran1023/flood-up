import { useRef, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Geojson } from 'react-native-maps';
import type { FeatureCollection } from 'geojson';
import { FloodPin } from './FloodPin';
import { RouteOverlay } from './RouteOverlay';
import type { FloodReport } from '../types';
import type { RouteResult } from '../hooks/useRoute';

const floodZones = require('../assets/flood-zones.geojson') as FeatureCollection;

// Ho Chi Minh City city center — default region for SE Asia target market
const HCMC_REGION = {
  latitude: 10.7769,
  longitude: 106.7009,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

interface Props {
  reports: FloodReport[];
  route?: RouteResult | null;
  onPinPress?: (report: FloodReport) => void;
  centerOn?: { lat: number; lng: number };
}

export function FloodMap({ reports, route, onPinPress, centerOn }: Props) {
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (!centerOn) return;
    mapRef.current?.animateToRegion(
      { latitude: centerOn.lat, longitude: centerOn.lng, latitudeDelta: 0.01, longitudeDelta: 0.01 },
      800
    );
  }, [centerOn]);

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      initialRegion={HCMC_REGION}
      showsUserLocation
      showsMyLocationButton
    >
      <Geojson
        geojson={floodZones}
        fillColor="rgba(0,100,220,0.18)"
        strokeColor="rgba(0,100,220,0.55)"
        strokeWidth={1.5}
      />
      {reports.map(report => (
        <FloodPin key={report.id} report={report} onPress={onPinPress} />
      ))}
      {route && <RouteOverlay route={route} />}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
});
