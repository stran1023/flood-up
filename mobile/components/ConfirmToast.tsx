import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface Props {
  message?: string;
}

export function ConfirmToast({ message = 'Report submitted — thank you!' }: Props) {
  return (
    <View style={styles.toast}>
      <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  text: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    flex: 1,
  },
});
