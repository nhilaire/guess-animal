import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, font, spacing } from './theme';

export type ButtonVariant = 'primary' | 'secondary' | 'yes' | 'no' | 'neutral';

type Props = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: string; // shown before the label, so colour is never the only cue
  disabled?: boolean;
  large?: boolean;
  testID?: string;
};

const background: Record<ButtonVariant, string> = {
  primary: colors.accent,
  secondary: colors.surfaceAlt,
  yes: colors.yes,
  no: colors.no,
  neutral: colors.neutral,
};

export function Button({ label, onPress, variant = 'primary', icon, disabled = false, large = false, testID }: Props) {
  const light = variant !== 'secondary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      testID={testID}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        large && styles.large,
        { backgroundColor: background[variant] },
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text style={[styles.label, large && styles.largeLabel, { color: light ? colors.accentText : colors.text }]}>
        {icon ? `${icon}  ${label}` : label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { minHeight: 56, borderRadius: 18, paddingHorizontal: spacing.lg, alignItems: 'center', justifyContent: 'center', alignSelf: 'stretch' },
  large: { minHeight: 72 },
  pressed: { opacity: 0.75, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.4 },
  label: { fontSize: font.body, fontWeight: '700', textAlign: 'center' },
  largeLabel: { fontSize: font.heading },
});
