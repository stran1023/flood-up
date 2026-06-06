import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { useAuth } from '@/hooks/useAuth';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { user, loading, needsHomeSetup } = useAuth();
  // Cast to string[] — expo-router typed segments won't include new routes until
  // the dev server regenerates .expo/types/router.d.ts after screens are added.
  const segments = useSegments() as string[];
  const router = useRouter();
  const lastResponse = Notifications.useLastNotificationResponse();

  useEffect(() => {
    if (loading) return;

    const inAuthScreen  = segments[0] === 'auth';
    const inHomeSetup   = segments[0] === 'home-setup';

    if (!user && !inAuthScreen) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      router.replace('/auth' as any);
    } else if (user && inAuthScreen) {
      // After sign-in: go to home-setup if needed, otherwise tabs
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (needsHomeSetup) router.replace('/home-setup' as any);
      else router.replace('/(tabs)');
    } else if (user && !inHomeSetup && needsHomeSetup) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      router.replace('/home-setup' as any);
    }
  }, [user, loading, segments, router, needsHomeSetup]);

  // Navigate to alert screen when user taps a push notification
  useEffect(() => {
    const data = lastResponse?.notification?.request?.content?.data as Record<string, string> | undefined;
    const reportId = data?.reportId;
    if (!reportId || !user) return;

    // Pre-center the map tab on the report location before opening the alert modal
    const lat = data?.lat;
    const lng = data?.lng;
    if (lat && lng) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      router.navigate({ pathname: '/(tabs)/', params: { focusLat: lat, focusLng: lng } } as any);
    }
    router.push({ pathname: '/alert', params: { reportId } });
  }, [lastResponse, user, router]);

  return (
    <SafeAreaProvider>
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)"      options={{ headerShown: false }} />
        <Stack.Screen name="auth"        options={{ headerShown: false }} />
        <Stack.Screen name="home-setup"  options={{ headerShown: false }} />
        <Stack.Screen name="modal"       options={{ presentation: 'modal' }} />
        <Stack.Screen name="alert"       options={{ presentation: 'modal', title: 'Flood Alert' }} />
      </Stack>
    </ThemeProvider>
    </SafeAreaProvider>
  );
}
