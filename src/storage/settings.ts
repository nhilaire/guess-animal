import AsyncStorage from '@react-native-async-storage/async-storage';

import { reportError } from '../telemetry/telemetry';

// Local player settings (the statistics choice is the telemetry consent, stored separately).
export type Settings = { sound: boolean; vibrations: boolean };

export const DEFAULT_SETTINGS: Settings = { sound: true, vibrations: true };

const KEY = 'settings.v1';

export async function loadSettings(): Promise<Settings> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return {
      sound: typeof parsed.sound === 'boolean' ? parsed.sound : DEFAULT_SETTINGS.sound,
      vibrations: typeof parsed.vibrations === 'boolean' ? parsed.vibrations : DEFAULT_SETTINGS.vibrations,
    };
  } catch (error) {
    reportError(error, 'load_settings');
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(settings));
  } catch (error) {
    reportError(error, 'save_settings');
  }
}
