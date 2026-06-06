import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DEPTH_CONFIG } from '../constants/depth';

const ENTRIES = Object.entries(DEPTH_CONFIG) as [
  keyof typeof DEPTH_CONFIG,
  { label: string; color: string }
][];

export function DepthLegend() {
  const { bottom } = useSafeAreaInsets();
  const TAB_BAR = 56 + bottom;

  return (
    <View style={[styles.container, { bottom: TAB_BAR + 10 }]} pointerEvents="none">
      {ENTRIES.map(([key, { label, color }]) => (
        <View key={key} style={styles.item}>
          <View style={[styles.dot, { backgroundColor: color }]} />
          <Text style={styles.label}>{label.replace(' deep', '').replace(' Deep', '')}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.93)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
  },
});
