import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ColorValue } from 'react-native';

type IconName = React.ComponentProps<typeof MaterialIcons>['name'];

function TabIcon({ name, color }: { name: IconName; color: ColorValue }) {
  return <MaterialIcons name={name} size={26} color={color as string} />;
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      safeAreaInsets={{ bottom: 0 }}
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#E24B4A',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 56 + insets.bottom,
          paddingBottom: insets.bottom,
          borderTopWidth: 0.5,
          borderTopColor: '#e0e0e0',
          backgroundColor: '#fff',
        },
        headerStyle: { backgroundColor: '#fff' },
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Flood Up',
          tabBarLabel: 'Map',
          tabBarIcon: ({ color }) => <TabIcon name="map" color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: 'Report a Flood',
          tabBarLabel: 'Report',
          tabBarIcon: ({ color }) => <TabIcon name="add-circle" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <TabIcon name="person" color={color} />,
        }}
      />
    </Tabs>
  );
}
