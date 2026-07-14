import { useState } from 'react';
import { Pressable, TextInput, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type TimePickerProps = {
  times: string[];
  onChange: (times: string[]) => void;
};

export function TimePicker({ times, onChange }: TimePickerProps) {
  const theme = useTheme();
  const [inputValue, setInputValue] = useState('');

  const addTime = () => {
    const time = inputValue.trim();
    if (!time) return;

    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(time)) return;

    if (!times.includes(time)) {
      onChange([...times, time].sort());
    }
    setInputValue('');
  };

  const removeTime = (time: string) => {
    onChange(times.filter((t) => t !== time));
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <TextInput
          style={[
            styles.input,
            {
              color: theme.text,
              backgroundColor: theme.backgroundElement,
              borderColor: theme.backgroundSelected,
            },
          ]}
          placeholder="HH:MM (如 08:00)"
          placeholderTextColor={theme.textSecondary}
          value={inputValue}
          onChangeText={setInputValue}
          keyboardType="numbers-and-punctuation"
          maxLength={5}
        />
        <Pressable style={styles.addButton} onPress={addTime}>
          <ThemedText style={styles.addButtonText}>添加</ThemedText>
        </Pressable>
      </View>

      <View style={styles.tags}>
        {times.map((time) => (
          <Pressable
            key={time}
            style={[styles.tag, { backgroundColor: theme.backgroundElement }]}
            onPress={() => removeTime(time)}>
            <ThemedText style={styles.tagText}>{time}</ThemedText>
            <ThemedText style={styles.tagRemove}>×</ThemedText>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  inputRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#3c87f7',
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.two,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.two,
    gap: Spacing.one,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tagRemove: {
    fontSize: 16,
    fontWeight: '700',
  },
});
