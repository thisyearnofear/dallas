import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// ─── Configure foreground behaviour once ─────────────────────────────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// ─── Types ────────────────────────────────────────────────────────────────────
export type NotificationPayload =
  | { type: 'log_validated'; allianceName: string; xpEarned: number }
  | { type: 'daily_challenge'; challengeLabel: string; xpReward: number }
  | { type: 'rank_up'; newRank: string }
  | { type: 'alliance_milestone'; allianceName: string; milestone: string };

// ─── Helpers ──────────────────────────────────────────────────────────────────
function buildContent(payload: NotificationPayload): Notifications.NotificationContentInput {
  switch (payload.type) {
    case 'log_validated':
      return {
        title: '✅ Optimization Log Validated',
        body: `Your log in ${payload.allianceName} was verified. +${payload.xpEarned} XP earned.`,
        data: payload,
      };
    case 'daily_challenge':
      return {
        title: '⚡ Daily Challenge Available',
        body: `${payload.challengeLabel} — earn +${payload.xpReward} XP today.`,
        data: payload,
      };
    case 'rank_up':
      return {
        title: '🏆 Rank Up!',
        body: `You've reached ${payload.newRank}. Keep building.`,
        data: payload,
      };
    case 'alliance_milestone':
      return {
        title: '🚀 Alliance Milestone',
        body: `${payload.allianceName}: ${payload.milestone}`,
        data: payload,
      };
  }
}

// ─── Permission request ───────────────────────────────────────────────────────
export async function requestNotificationPermission(): Promise<boolean> {
  if (!Device.isDevice && Platform.OS !== 'android') {
    // Emulators on iOS can't receive push; Android emulators can
    return false;
  }
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// ─── Schedule a local notification (immediate or delayed) ────────────────────
export async function scheduleNotification(
  payload: NotificationPayload,
  delaySeconds = 0,
): Promise<string | null> {
  const granted = await requestNotificationPermission();
  if (!granted) return null;

  const id = await Notifications.scheduleNotificationAsync({
    content: buildContent(payload),
    trigger: delaySeconds > 0 ? { seconds: delaySeconds } : null,
  });
  return id;
}

// ─── Hook: listen for incoming notifications ─────────────────────────────────
export function useNotifications(
  onReceive?: (payload: NotificationPayload) => void,
) {
  const listenerRef = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    // Request permission on mount (non-blocking)
    requestNotificationPermission();

    // Schedule daily challenge reminder at 9 AM if not already set
    scheduleDailyChallenge();

    if (onReceive) {
      listenerRef.current = Notifications.addNotificationReceivedListener(
        (notification) => {
          const payload = notification.request.content.data as NotificationPayload;
          if (payload?.type) onReceive(payload);
        },
      );
    }

    return () => {
      listenerRef.current?.remove();
    };
  }, []);
}

// ─── Daily challenge reminder (scheduled once per day) ───────────────────────
async function scheduleDailyChallenge() {
  // Cancel any existing daily challenge notifications to avoid duplicates
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const existing = scheduled.find(
    (n) => (n.content.data as NotificationPayload)?.type === 'daily_challenge',
  );
  if (existing) return; // already scheduled

  await scheduleNotification(
    {
      type: 'daily_challenge',
      challengeLabel: 'Submit an optimization log',
      xpReward: 50,
    },
    // Fire in ~20 hours (next day feel without exact calendar trigger)
    20 * 60 * 60,
  );
}

// ─── Convenience: fire "log validated" after submission ───────────────────────
export async function notifyLogValidated(allianceName: string, xpEarned: number) {
  // Simulate validator latency: notify after 8 seconds
  return scheduleNotification({ type: 'log_validated', allianceName, xpEarned }, 8);
}

// ─── Convenience: fire "rank up" ─────────────────────────────────────────────
export async function notifyRankUp(newRank: string) {
  return scheduleNotification({ type: 'rank_up', newRank }, 0);
}
