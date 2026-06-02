import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { FloodMap } from '../../components/FloodMap';
import { useReports } from '../../hooks/useReports';
import { useNotifications } from '../../hooks/useNotifications';
import type { FloodReport } from '../../types';

export default function MapScreen() {
  const { reports } = useReports();
  const router = useRouter();

  useNotifications();

  function handlePinPress(report: FloodReport) {
    router.push({ pathname: '/alert', params: { reportId: report.id } });
  }

  return (
    <View style={styles.container}>
      <FloodMap reports={reports} onPinPress={handlePinPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
