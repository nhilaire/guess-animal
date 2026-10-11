import { StyleSheet, Switch, Text, View } from 'react-native';

import { fr } from '../i18n/fr';
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
  return (
    <Screen testID="settings-screen">
      <Text style={styles.title} accessibilityRole="header">
        {fr.settings.title}
      </Text>
      <Row label={fr.settings.sound} value={settings.sound} onValueChange={(sound) => onChange({ ...settings, sound })} testID="settings-sound" />
      <Row
        label={fr.settings.vibrations}
        value={settings.vibrations}
        onValueChange={(vibrations) => onChange({ ...settings, vibrations })}
        testID="settings-vibrations"
      />
      <Row label={fr.settings.stats} help={fr.settings.statsHelp} value={telemetryEnabled} onValueChange={onToggleTelemetry} testID="settings-telemetry" />
      <View style={styles.spacer} />
      <Button label={fr.settings.back} onPress={onBack} variant="secondary" testID="settings-back" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: font.heading, fontWeight: '800' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface, borderRadius: 16, padding: spacing.md },
  rowText: { flex: 1, gap: spacing.xs },
  label: { color: colors.text, fontSize: font.body, fontWeight: '600' },
  help: { color: colors.muted, fontSize: font.small },
  spacer: { flex: 1 },
});
