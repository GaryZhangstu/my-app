import { type ReactNode } from 'react';
import { Pressable, View, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

type CardProps = {
  children: ReactNode;
  onPress?: () => void;
  accentColor?: string;
  gradient?: readonly [string, string];
  style?: StyleProp<ViewStyle>;
};

export function Card({ children, onPress, accentColor, gradient, style }: CardProps) {
  const content = (
    <ThemedView type="backgroundElement" style={[styles.inner, accentColor && { paddingLeft: Spacing.one }]}>
      {accentColor && <View style={[styles.accent, { backgroundColor: accentColor }]} />}
      <View style={styles.content}>{children}</View>
    </ThemedView>
  );

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.pressed, style]}
        onPress={onPress}>
        {content}
      </Pressable>
    );
  }

  return (
    <View style={[styles.card, style]}>
      {content}
    </View>
  );
}

type GradientCardProps = {
  children: ReactNode;
  onPress?: () => void;
  gradient: readonly [string, string];
  style?: StyleProp<ViewStyle>;
};

export function GradientCard({ children, onPress, gradient, style }: GradientCardProps) {
  const content = (
    <LinearGradient
      colors={[...gradient]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientInner}>
      <View style={styles.content}>{children}</View>
    </LinearGradient>
  );

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.pressed, style]}
        onPress={onPress}>
        {content}
      </Pressable>
    );
  }

  return (
    <View style={[styles.card, style]}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Spacing.three,
  },
  inner: {
    borderRadius: Spacing.three,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  gradientInner: {
    borderRadius: Spacing.three,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  accent: {
    width: 4,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    padding: Spacing.three,
  },
  pressed: {
    opacity: 0.7,
  },
});
