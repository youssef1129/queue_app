import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "currentTicketId";

export async function saveTicketId(id: string): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, id);
  } catch {}
}

export async function getTicketId(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export async function clearTicketId(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {}
}
