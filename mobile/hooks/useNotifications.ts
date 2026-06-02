import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
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

    // Refresh token when FCM rotates it
    const sub = Notifications.addPushTokenListener(token => {
      saveToken(token.data);
    });
    return () => sub.remove();
  }, []);
}

async function register() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return;
  const token = (await Notifications.getExpoPushTokenAsync()).data;
  saveToken(token);
}

async function saveToken(token: string) {
  const user = auth.currentUser;
  if (!user) return;
  await updateDoc(doc(db, 'users', user.uid), {
    fcmTokens: arrayUnion(token),
  });
}
