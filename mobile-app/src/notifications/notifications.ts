import * as Notifications from "expo-notifications";
import { AndroidImportance } from "expo-notifications";
import { Platform } from "react-native";

// show the notification even when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === "android") {
    try {
      await Notifications.setNotificationChannelAsync("queue", {
        name: "File d’attente",
        importance: AndroidImportance.MAX,
        sound: "default",
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#0E7C86",
      });
    } catch (error) {
      // do not block the permission request if the channel fails
      console.warn("[notif] channel error", error);
    }
  }

  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    const asked = await Notifications.requestPermissionsAsync();
    return asked.granted;
  } catch (error) {
    console.warn("[notif] permission error", error);
    return false;
  }
}

export async function notifyTicketCalled(): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "C’est votre tour",
        body: "Un médecin est disponible pour votre téléconsultation.",
      },
      trigger: null,
    });
  } catch (error) {
    console.warn("[notif] schedule error", error);
  }
}
