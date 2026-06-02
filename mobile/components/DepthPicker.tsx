import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { DEPTH_CONFIG } from '../constants/depth';
import type { Depth } from '../types';

interface Props {
  selected: Depth | null;
  onSelect: (depth: Depth) => void;
  large?: boolean; // true for driver mode — bigger tap targets
}

export function DepthPicker({ selected, onSelect, large }: Props) {
  return (
    <View style={styles.grid}>
      {(Object.keys(DEPTH_CONFIG) as Depth[]).map(depth => {
        const { label, color } = DEPTH_CONFIG[depth];
        const isSelected = selected === depth;
        return (
          <TouchableOpacity
            key={depth}
            style={[
              styles.option,
              large && styles.optionLarge,
              { borderColor: color },
              isSelected && { backgroundColor: color },
            ]}
            onPress={() => onSelect(depth)}
            activeOpacity={0.75}
          >
            <View style={[styles.dot, { backgroundColor: color }]} />
            <Text style={[styles.label, isSelected && styles.labelSelected]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: '45%',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 2,
  },
  optionLarge: {
    paddingVertical: 22,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  labelSelected: {
    color: '#fff',
  },
});
