import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { LANGUAGE_NAMES, LANGUAGES, LanguageSetting } from '../i18n';
import { useI18n } from '../i18n/I18nProvider';
import { Settings } from '../storage/settings';
import { Button } from '../ui/Button';
import { Screen } from '../ui/Screen';
import { colors, font, spacing } from '../ui/theme';

type Props = {
  settings: Settings;
  telemetryEnabled: boolean;
  onChange: (settings: Settings) => void;
  onToggleTelemetry: (granted: boolean) => void;
  onBack: () => void;
};

function Row({ label, help, value, onValueChange, testID }: { label: string; help?: string; value: boolean; onValueChange: (v: boolean) => void; testID: string }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text style={styles.label}>{label}</Text>
        {help ? <Text style={styles.help}>{help}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        accessibilityLabel={label}
        testID={testID}
        trackColor={{ true: colors.accent, false: colors.surfaceAlt }}
      />
    </View>
  );
}

export function SettingsScreen({ settings, telemetryEnabled, onChange, onToggleTelemetry, onBack }: Props) {
  const { t, setting, setSetting } = useI18n();
  // Each language is named in itself; « Automatique » follows the phone.
  const choices: { value: LanguageSetting; label: string }[] = [
    { value: 'auto', label: t.settings.languageAuto },
    ...LANGUAGES.map((language) => ({ value: language, label: LANGUAGE_NAMES[language] })),
  ];
  return (
    <Screen testID="settings-screen">
      <Text style={styles.title} accessibilityRole="header">
        {t.settings.title}
      </Text>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.list}>
        <Row label={t.settings.sound} value={settings.sound} onValueChange={(sound) => onChange({ ...settings, sound })} testID="settings-sound" />
        <Row
          label={t.settings.vibrations}
          value={settings.vibrations}
          onValueChange={(vibrations) => onChange({ ...settings, vibrations })}
          testID="settings-vibrations"
        />
        <Row label={t.settings.stats} help={t.settings.statsHelp} value={telemetryEnabled} onValueChange={onToggleTelemetry} testID="settings-telemetry" />
        <View style={styles.group} accessibilityRole="radiogroup" accessibilityLabel={t.settings.language}>
          <Text style={styles.label}>{t.settings.language}</Text>
          {choices.map(({ value, label }) => {
            const selected = value === setting;
            return (
              <Pressable
                key={value}
                testID={`settings-language-${value}`}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                accessibilityLabel={label}
                onPress={() => setSetting(value)}
                style={[styles.choice, selected && styles.choiceSelected]}
              >
                <Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
      <Button label={t.settings.back} onPress={onBack} variant="secondary" testID="settings-back" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: font.heading, fontWeight: '800' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface, borderRadius: 16, padding: spacing.md },
  rowText: { flex: 1, gap: spacing.xs },
  label: { color: colors.text, fontSize: font.body, fontWeight: '600' },
  help: { color: colors.muted, fontSize: font.small },
  scroll: { flex: 1 },
  list: { gap: spacing.md },
  group: { gap: spacing.sm, backgroundColor: colors.surface, borderRadius: 16, padding: spacing.md },
  choice: { minHeight: 48, justifyContent: 'center', borderRadius: 16, borderWidth: 2, borderColor: colors.surfaceAlt, paddingHorizontal: spacing.md },
  choiceSelected: { borderColor: colors.accent, backgroundColor: colors.surfaceAlt },
  choiceText: { color: colors.text, fontSize: font.body },
  choiceTextSelected: { fontWeight: '800' },
});
