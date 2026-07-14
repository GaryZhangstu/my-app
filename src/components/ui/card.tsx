import { type ReactNode } from 'react';
import { Pressable, StyleSheet, type ViewProps } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

type CardProps = ViewProps & {
  children: ReactNode;
  onPress?: () => void;
};

export function Card({ children, onPress, style, ...rest }: CardProps) {
  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.pressed, style]}
        onPress={onPress}>
        <ThemedView type="backgroundElement" style={styles.inner}>
          {children}
        </ThemedView>
      </Pressable>
    );
  }

  return (
    <ThemedView type="backgroundElement" style={[styles.card, style]} {...rest}>
      {children}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
  },
  inner: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
  },
  pressed: {
    opacity: 0.7,
  },
});
