import { ReactNode } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from './theme';

// Full-screen container that keeps content clear of the status bar and of the Android navigation bar
// (the app is drawn edge-to-edge).
export function Screen({ children, testID }: { children: ReactNode; testID?: string }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      testID={testID}
      style={[
        styles.screen,
        { paddingTop: Math.max(insets.top, StatusBar.currentHeight ?? 0) + spacing.lg, paddingBottom: insets.bottom + spacing.lg },
      ]}
    >
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.lg, gap: spacing.md },
});
