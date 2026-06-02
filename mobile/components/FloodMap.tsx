import { StyleSheet } from 'react-native';
import MapView from 'react-native-maps';
import { FloodPin } from './FloodPin';
import type { FloodReport } from '../types';

// Ho Chi Minh City city center — default region for SE Asia target market
const HCMC_REGION = {
  latitude: 10.7769,
  longitude: 106.7009,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

interface Props {
  reports: FloodReport[];
  onPinPress?: (report: FloodReport) => void;
}

export function FloodMap({ reports, onPinPress }: Props) {
  return (
    <MapView
      style={styles.map}
      initialRegion={HCMC_REGION}
      showsUserLocation
      showsMyLocationButton
    >
      {reports.map(report => (
        <FloodPin key={report.id} report={report} onPress={onPinPress} />
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
});
