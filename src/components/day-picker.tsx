import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { type DayOfWeek, DAY_LABELS } from '@/types';

type DayPickerProps = {
  selected: DayOfWeek[];
  onChange: (days: DayOfWeek[]) => void;
};

const ALL_DAYS: DayOfWeek[] = [0, 1, 2, 3, 4, 5, 6];

function DayButton({
  day,
  isSelected,
  onPress,
}: {
  day: DayOfWeek;
  isSelected: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    'worklet';
    // eslint-disable-next-line react-hooks/immutability
    scale.value = withSpring(0.9, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    'worklet';
    // eslint-disable-next-line react-hooks/immutability
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  return (
    <Animated.View style={[styles.day, animatedStyle]}>
      <Pressable
        style={[
          styles.dayInner,
          {
            backgroundColor: isSelected ? '#5856D6' : theme.backgroundElement,
            borderColor: isSelected ? '#5856D6' : theme.backgroundSelected,
          },
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}>
        {isSelected && (
          <ThemedText style={styles.checkmark}>✓</ThemedText>
        )}
        <ThemedText
          style={[styles.dayText, { color: isSelected ? '#ffffff' : theme.text }]}>
          {DAY_LABELS[day]}
        </ThemedText>
      </Pressable>
    </Animated.View>
  );
}

export function DayPicker({ selected, onChange }: DayPickerProps) {
  const toggleDay = (day: DayOfWeek) => {
    if (selected.includes(day)) {
      onChange(selected.filter((d) => d !== day));
    } else {
      onChange([...selected, day].sort());
    }
  };

  return (
    <View style={styles.container}>
      {ALL_DAYS.map((day) => (
        <DayButton
          key={day}
          day={day}
          isSelected={selected.includes(day)}
          onPress={() => toggleDay(day)}
        />
      ))}
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
  },
  dayInner: {
    flex: 1,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: 2,
  },
  checkmark: {
    fontSize: 10,
    color: '#ffffff',
  },
  dayText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
