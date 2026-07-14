import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { type DayOfWeek, DAY_LABELS } from '@/types';

type DayPickerProps = {
  selected: DayOfWeek[];
  onChange: (days: DayOfWeek[]) => void;
};

const ALL_DAYS: DayOfWeek[] = [0, 1, 2, 3, 4, 5, 6];

export function DayPicker({ selected, onChange }: DayPickerProps) {
  const theme = useTheme();

  const toggleDay = (day: DayOfWeek) => {
    if (selected.includes(day)) {
      onChange(selected.filter((d) => d !== day));
    } else {
      onChange([...selected, day].sort());
    }
  };

  return (
    <View style={styles.container}>
      {ALL_DAYS.map((day) => {
        const isSelected = selected.includes(day);
        return (
          <Pressable
            key={day}
            style={[
              styles.day,
              {
                backgroundColor: isSelected ? '#3c87f7' : theme.backgroundElement,
                borderColor: isSelected ? '#3c87f7' : theme.backgroundSelected,
              },
            ]}
            onPress={() => toggleDay(day)}>
            <ThemedText
              style={[styles.dayText, { color: isSelected ? '#ffffff' : theme.text }]}>
              {DAY_LABELS[day]}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  day: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  dayText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
