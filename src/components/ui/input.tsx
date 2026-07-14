import { View, TextInput, StyleSheet, type TextInputProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
};

export function Input({ label, error, style, ...rest }: InputProps) {
  const theme = useTheme();

  return (
    <View>
      {label && <ThemedText type="small">{label}</ThemedText>}
      <TextInput
        style={[
          styles.input,
          {
            color: theme.text,
            backgroundColor: theme.backgroundElement,
            borderColor: error ? '#ff3b30' : theme.backgroundSelected,
          },
          style,
        ]}
        placeholderTextColor={theme.textSecondary}
        {...rest}
      />
      {error && (
        <ThemedText style={styles.error} themeColor="textSecondary">
          {error}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
    marginTop: Spacing.one,
  },
  error: {
    fontSize: 12,
    marginTop: Spacing.half,
    color: '#ff3b30',
  },
});
