import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
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

  useNotifications();

  function handlePinPress(report: FloodReport) {
    router.push({ pathname: '/alert', params: { reportId: report.id } });
  }

  return (
    <View style={styles.container}>
      <FloodMap reports={reports} route={route} onPinPress={handlePinPress} />
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
