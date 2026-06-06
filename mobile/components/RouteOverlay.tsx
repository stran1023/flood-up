import { Polyline, Circle } from 'react-native-maps';
import { DEPTH_CONFIG } from '../constants/depth';
import { splitRouteByFloodZones } from '../lib/routeUtils';
import type { RouteResult } from '../hooks/useRoute';

interface Props {
  route: RouteResult;
}

export function RouteOverlay({ route }: Props) {
  const segments = splitRouteByFloodZones(route.polylinePoints, route.floodsOnRoute);

  return (
    <>
      {segments.map((seg, i) =>
        seg.points.length >= 2 ? (
          <Polyline
            key={i}
            coordinates={seg.points}
            strokeColor={seg.flooded ? '#E24B4A' : '#3B82F6'}
            strokeWidth={seg.flooded ? 7 : 4}
            geodesic
            zIndex={seg.flooded ? 2 : 1}
          />
        ) : null
      )}

      {route.floodsOnRoute.map(report => (
        <Circle
          key={`flood-${report.id}`}
          center={{ latitude: report.lat, longitude: report.lng }}
          radius={200}
          fillColor={`${DEPTH_CONFIG[report.depth].color}33`}
          strokeColor={DEPTH_CONFIG[report.depth].color}
          strokeWidth={2}
        />
      ))}
    </>
  );
}
