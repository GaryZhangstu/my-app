import { Pressable, StyleSheet } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type CheckInButtonProps = {
  checkedIn: boolean;
  onPress: () => void;
};

export function CheckInButton({ checkedIn, onPress }: CheckInButtonProps) {
  const theme = useTheme();

  if (checkedIn) {
    return (
      <LinearGradient
        colors={['#2ECC71', '#27AE60']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.buttonGradient}>
        <SymbolView name="checkmark.circle.fill" size={18} tintColor="#ffffff" />
        <ThemedText style={styles.textChecked}>已打卡</ThemedText>
      </LinearGradient>
    );
  }

  return (
    <Pressable
      style={[
        styles.button,
        {
          backgroundColor: theme.backgroundElement + '80',
          borderColor: theme.textSecondary + '40',
        },
      ]}
      onPress={onPress}>
      <SymbolView name="circle.dashed" size={18} tintColor={theme.textSecondary} />
      <ThemedText style={[styles.text, { color: theme.textSecondary }]}>打卡</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 20,
    gap: Spacing.one,
    borderWidth: 1,
    minWidth: 80,
    justifyContent: 'center',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 20,
    gap: Spacing.one,
    minWidth: 80,
    justifyContent: 'center',
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
  },
  textChecked: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
  },
});
