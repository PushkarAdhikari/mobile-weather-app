import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFIED_ALERTS_KEY = '@weather_app/notified_alerts';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return false;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('severe-weather', {
      name: 'Severe Weather Alerts',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      sound: 'default',
    });
  }
  return true;
}

export async function getNotifiedAlertHeadlines(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(NOTIFIED_ALERTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function markAlertNotified(headline: string): Promise<void> {
  const existing = await getNotifiedAlertHeadlines();
  existing.push(headline);
  await AsyncStorage.setItem(NOTIFIED_ALERTS_KEY, JSON.stringify(existing.slice(-50)));
}

export async function notifyNewAlerts(alerts: { headline: string; severity: string; desc?: string }[]): Promise<void> {
  if (!alerts || alerts.length === 0) return;

  const notified = await getNotifiedAlertHeadlines();

  for (const alert of alerts) {
    if (notified.includes(alert.headline)) continue;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `⚠️ ${alert.severity}: ${alert.headline}`,
        body: alert.desc ? alert.desc.slice(0, 200) : 'Tap to view details',
        data: { headline: alert.headline },
        sound: 'default',
        ...(Platform.OS === 'android' ? { channelId: 'severe-weather' } : {}),
      },
      trigger: null,
    });

    await markAlertNotified(alert.headline);
  }
}
