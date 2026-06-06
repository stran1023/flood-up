import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FloodMap } from '../../components/FloodMap';
import { RouteSearch } from '../../components/RouteSearch';
import { DriverReportOverlay } from '../../components/DriverReportOverlay';
import { useReports } from '../../hooks/useReports';
import { useRoute } from '../../hooks/useRoute';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import type { FloodReport } from '../../types';

export default function MapScreen() {
  const { reports } = useReports();
  const router = useRouter();
  const { route, loading, error, fetchRoute, clearRoute } = useRoute(reports);
  const { focusLat, focusLng } = useLocalSearchParams<{ focusLat?: string; focusLng?: string }>();
  const { role } = useAuth();

  useNotifications();

  const centerOn =
    focusLat && focusLng
      ? { lat: parseFloat(focusLat), lng: parseFloat(focusLng) }
      : undefined;

  function handlePinPress(report: FloodReport) {
    router.push({ pathname: '/alert', params: { reportId: report.id } });
  }

  return (
    <View style={styles.container}>
      <FloodMap reports={reports} route={route} onPinPress={handlePinPress} centerOn={centerOn} />
      <RouteSearch
        route={route}
        loading={loading}
        error={error}
        onSearch={fetchRoute}
        onClear={clearRoute}
      />
      {role === 'driver' && <DriverReportOverlay />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
