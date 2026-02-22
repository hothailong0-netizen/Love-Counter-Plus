import AsyncStorage from '@react-native-async-storage/async-storage';

const SERVER_URL_KEY = '@server_url';

export async function getServerUrl(): Promise<string> {
  try {
    const url = await AsyncStorage.getItem(SERVER_URL_KEY);
    return url || '';
  } catch {
    return '';
  }
}

export async function setServerUrl(url: string): Promise<void> {
  try {
    await AsyncStorage.setItem(SERVER_URL_KEY, url.trim());
  } catch {
    throw new Error('Không thể lưu URL server');
  }
}

export async function hasServerUrl(): Promise<boolean> {
  try {
    const url = await AsyncStorage.getItem(SERVER_URL_KEY);
    return !!url && url.trim().length > 0;
  } catch {
    return false;
  }
}
