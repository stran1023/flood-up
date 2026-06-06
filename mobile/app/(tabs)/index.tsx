import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FloodMap } from '../../components/FloodMap';
import { RouteSearch } from '../../components/RouteSearch';
import { useReports } from '../../hooks/useReports';
import { useRoute } from '../../hooks/useRoute';
import { useNotifications } from '../../hooks/useNotifications';
import type { FloodReport } from '../../types';

export default function MapScreen() {
  const { reports } = useReports();
  const router = useRouter();
  const { route, loading, error, fetchRoute, clearRoute } = useRoute(reports);
  const { focusLat, focusLng } = useLocalSearchParams<{ focusLat?: string; focusLng?: string }>();

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
