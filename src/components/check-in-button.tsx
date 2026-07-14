import { Pressable, StyleSheet } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type CheckInButtonProps = {
  checkedIn: boolean;
  onPress: () => void;
};

export function CheckInButton({ checkedIn, onPress }: CheckInButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      style={[
        styles.button,
        {
          backgroundColor: checkedIn ? '#34c759' : theme.backgroundElement,
          borderColor: checkedIn ? '#34c759' : theme.backgroundSelected,
        },
      ]}
      onPress={onPress}
      disabled={checkedIn}>
      <SymbolView
        name={checkedIn ? 'checkmark.circle.fill' : 'circle'}
        size={20}
        tintColor={checkedIn ? '#ffffff' : theme.textSecondary}
      />
      <ThemedText
        style={[
          styles.text,
          { color: checkedIn ? '#ffffff' : theme.text },
        ]}>
        {checkedIn ? '已打卡' : '打卡'}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    gap: Spacing.one,
    borderWidth: 1,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
});
