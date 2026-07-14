import { Pressable, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ButtonProps = {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  onPress?: () => void;
};

export function Button({
  title,
  variant = 'primary',
  size = 'medium',
  style,
  disabled,
  onPress,
}: ButtonProps) {
  const theme = useTheme();

  const bgColor = disabled
    ? theme.backgroundSelected
    : variant === 'primary'
      ? '#3c87f7'
      : variant === 'danger'
        ? '#ff3b30'
        : theme.backgroundElement;

  const textColor = disabled
    ? theme.textSecondary
    : variant === 'primary' || variant === 'danger'
      ? '#ffffff'
      : theme.text;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        size === 'small' && styles.small,
        size === 'large' && styles.large,
        { backgroundColor: bgColor, opacity: pressed ? 0.8 : 1 },
        style,
      ]}
      disabled={disabled}
      onPress={onPress}>
      <ThemedText
        style={[styles.text, { color: textColor }, size === 'small' && styles.smallText]}>
        {title}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
  small: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
  },
  large: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  smallText: {
    fontSize: 14,
  },
});
