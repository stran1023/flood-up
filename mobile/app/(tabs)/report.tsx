import { StyleSheet, View } from 'react-native';
import { ReportSheet } from '../../components/ReportSheet';
import { useLocation } from '../../hooks/useLocation';

export default function ReportScreen() {
  const { location } = useLocation();
  return (
    <View style={styles.container}>
      <ReportSheet location={location} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
});
