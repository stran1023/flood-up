import { View, Text, StyleSheet } from 'react-native';
import { Marker, Callout } from 'react-native-maps';
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
      onCalloutPress={() => onPress?.(report)}
    >
      <View style={[
        styles.pin,
        { backgroundColor: config.color },
        !isConfirmed && styles.pinPending,
      ]} />
      <Callout>
        <View style={styles.callout}>
          <Text style={styles.label}>{config.label}</Text>
          <Text style={styles.status}>{report.status}</Text>
          <Text style={styles.corroboration}>
            {report.corroborationCount} report{report.corroborationCount !== 1 ? 's' : ''}
          </Text>
        </View>
      </Callout>
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
  callout: {
    padding: 10,
    minWidth: 130,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 2,
  },
  status: {
    fontSize: 12,
    color: '#555',
    textTransform: 'capitalize',
  },
  corroboration: {
    fontSize: 11,
    color: '#888',
    marginTop: 4,
  },
});
