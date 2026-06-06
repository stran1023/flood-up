import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function useNotifications() {
  useEffect(() => {
    register();

    const sub = Notifications.addPushTokenListener(token => {
      if (token.data) saveToken(token.data);
    });
    return () => sub.remove();
  }, []);
}

async function register() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return;

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;
  if (!projectId) {
    console.warn('[notifications] No EAS projectId — add eas.json to enable push notifications');
    return;
  }

  try {
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
    await saveToken(token);
  } catch (e) {
    console.warn('[notifications] getExpoPushTokenAsync failed:', e);
  }
}

async function saveToken(token: string) {
  const user = auth.currentUser;
  if (!user) return;
  await updateDoc(doc(db, 'users', user.uid), {
    fcmTokens: arrayUnion(token),
  });
}
