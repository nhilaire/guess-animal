import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { feedback } from '../audio/feedback';
import { appName } from '../config/app';
import { useI18n } from '../i18n/I18nProvider';
import { Button } from '../ui/Button';
import { Screen } from '../ui/Screen';
import { colors, font, spacing } from '../ui/theme';

type Props = { sound: boolean; onPlay: () => void; onSettings: () => void; onAbout: () => void };

export function HomeScreen({ sound, onPlay, onSettings, onAbout }: Props) {
  const { t, language } = useI18n();
  // The pitch is spoken for players who cannot read yet.
  useEffect(() => {
    if (!sound) return;
    feedback().line('pitch', language);
    return () => feedback().stop();
  }, [sound, language]);

  return (
    <Screen testID="home-screen">
      <View style={styles.hero}>
        <Text style={styles.emoji} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          🦁 🐘 🦒
        </Text>
        <Text style={styles.title} accessibilityRole="header">
          {appName(language)}
        </Text>
        <Text style={styles.pitch}>{t.home.pitch}</Text>
      </View>
      <Button label={t.home.play} onPress={onPlay} large testID="home-play" />
      <Button label={t.home.settings} onPress={onSettings} variant="secondary" testID="home-settings" />
      <Button label={t.home.about} onPress={onAbout} variant="secondary" testID="home-about" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  emoji: { fontSize: 56 },
  title: { color: colors.text, fontSize: font.title, fontWeight: '800', textAlign: 'center' },
  pitch: { color: colors.muted, fontSize: font.heading, textAlign: 'center' },
});
