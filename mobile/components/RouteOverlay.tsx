import { Polyline, Circle } from 'react-native-maps';
import { DEPTH_CONFIG } from '../constants/depth';
import type { RouteResult } from '../hooks/useRoute';

interface Props {
  route: RouteResult;
}

export function RouteOverlay({ route }: Props) {
  return (
    <>
      <Polyline
        coordinates={route.polylinePoints}
        strokeColor="#3B82F6"
        strokeWidth={4}
        geodesic
      />
      {route.floodsOnRoute.map(report => (
        <Circle
          key={`route-warn-${report.id}`}
          center={{ latitude: report.lat, longitude: report.lng }}
          radius={200}
          fillColor={`${DEPTH_CONFIG[report.depth].color}40`}
          strokeColor={DEPTH_CONFIG[report.depth].color}
          strokeWidth={2}
        />
      ))}
    </>
  );
}
