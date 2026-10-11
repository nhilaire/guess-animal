import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { feedback } from '../audio/feedback';
import { APP_NAME } from '../config/app';
import { fr } from '../i18n/fr';
import { Button } from '../ui/Button';
import { Screen } from '../ui/Screen';
import { colors, font, spacing } from '../ui/theme';

type Props = { sound: boolean; onPlay: () => void; onSettings: () => void };

export function HomeScreen({ sound, onPlay, onSettings }: Props) {
  // The pitch is spoken for players who cannot read yet.
  useEffect(() => {
    if (!sound) return;
    feedback().line('pitch');
    return () => feedback().stop();
  }, [sound]);

  return (
    <Screen testID="home-screen">
      <View style={styles.hero}>
        <Text style={styles.emoji} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          🦁 🐘 🦒
        </Text>
        <Text style={styles.title} accessibilityRole="header">
          {APP_NAME}
        </Text>
        <Text style={styles.pitch}>{fr.home.pitch}</Text>
      </View>
      <Button label={fr.home.play} onPress={onPlay} large testID="home-play" />
      <Button label={fr.home.settings} onPress={onSettings} variant="secondary" testID="home-settings" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  emoji: { fontSize: 56 },
  title: { color: colors.text, fontSize: font.title, fontWeight: '800', textAlign: 'center' },
  pitch: { color: colors.muted, fontSize: font.heading, textAlign: 'center' },
});
