import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Linking, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { handleLink } from './game/mode';
import { LanguageSetting } from './i18n';
import { I18nProvider } from './i18n/I18nProvider';
import { ConsentScreen } from './screens/ConsentScreen';
import { GameScreen } from './screens/GameScreen';
import { HomeScreen } from './screens/HomeScreen';
import { AboutScreen } from './screens/AboutScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { loadLanguageSetting, saveLanguageSetting } from './storage/languageSetting';
import { DEFAULT_SETTINGS, Settings, loadSettings, saveSettings } from './storage/settings';
import { Consent, loadConsent, saveConsent } from './telemetry/consentStore';
import { applyConsent } from './telemetry/telemetry';
import { ErrorBoundary } from './ui/ErrorBoundary';
import { colors } from './ui/theme';

type Route = 'home' | 'game' | 'settings' | 'about';

export default function App() {
  const [consent, setConsentState] = useState<Consent | 'loading'>('loading');
  const [route, setRoute] = useState<Route>('home');
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [languageSetting, setLanguageSetting] = useState<LanguageSetting>('auto');

  useEffect(() => {
    let alive = true;
    (async () => {
      const [storedConsent, storedSettings, storedLanguage] = await Promise.all([loadConsent(), loadSettings(), loadLanguageSetting()]);
      if (storedConsent !== 'unknown') await applyConsent(storedConsent === 'granted');
      if (alive) {
        setConsentState(storedConsent);
        setSettings(storedSettings);
        setLanguageSetting(storedLanguage);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Deterministic test mode via deep link (cold start URL or link opened while running).
  useEffect(() => {
    void Linking.getInitialURL().then(handleLink).catch(() => {});
    const sub = Linking.addEventListener('url', ({ url }) => handleLink(url));
    return () => sub?.remove();
  }, []);

  const decide = useCallback(async (granted: boolean) => {
    const value = granted ? 'granted' : 'denied';
    await saveConsent(value);
    await applyConsent(granted);
    setConsentState(value);
  }, []);

  // The switch is immediate (context), then saved; a game in progress is not touched.
  const changeLanguage = useCallback((value: LanguageSetting) => {
    setLanguageSetting(value);
    void saveLanguageSetting(value);
  }, []);

  const changeSettings = useCallback((next: Settings) => {
    setSettings(next);
    void saveSettings(next);
  }, []);

  let content: React.ReactNode;
  if (consent === 'loading') {
    content = (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  } else if (consent === 'unknown') {
    content = <ConsentScreen onDecision={decide} />;
  } else if (route === 'game') {
    content = <GameScreen settings={settings} onExit={() => setRoute('home')} />;
  } else if (route === 'about') {
    content = <AboutScreen onBack={() => setRoute('home')} />;
  } else if (route === 'settings') {
    content = (
      <SettingsScreen
        settings={settings}
        telemetryEnabled={consent === 'granted'}
        onChange={changeSettings}
        onToggleTelemetry={decide}
        onBack={() => setRoute('home')}
      />
    );
  } else {
    content = <HomeScreen sound={settings.sound} onPlay={() => setRoute('game')} onSettings={() => setRoute('settings')} onAbout={() => setRoute('about')} />;
  }

  return (
    <SafeAreaProvider>
      <I18nProvider setting={languageSetting} onChange={changeLanguage}>
        <ErrorBoundary>{content}</ErrorBoundary>
      </I18nProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
});
