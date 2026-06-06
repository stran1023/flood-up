import { View, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { DEPTH_CONFIG } from '../constants/depth';
import type { FloodReport } from '../types';

interface Props {
  report: FloodReport;
  onPress?: (report: FloodReport) => void;
}

export function FloodPin({ report, onPress }: Props) {
  const config = DEPTH_CONFIG[report.depth];
  const isConfirmed = report.status === 'confirmed';

  return (
    <Marker
      coordinate={{ latitude: report.lat, longitude: report.lng }}
      onPress={() => onPress?.(report)}
      // Prevents every parent re-render from re-rasterising custom marker views.
      tracksViewChanges={false}
    >
      <View style={[
        styles.pin,
        { backgroundColor: config.color },
        !isConfirmed && styles.pinPending,
      ]} />
    </Marker>
  );
}

const styles = StyleSheet.create({
  pin: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  pinPending: {
    opacity: 0.65,
  },
});
