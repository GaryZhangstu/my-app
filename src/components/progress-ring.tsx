import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';

type ProgressRingProps = {
  size?: number;
  strokeWidth?: number;
  progress: number;
  total: number;
  color: string;
  label?: string;
};

export function ProgressRing({
  size = 64,
  strokeWidth = 6,
  progress,
  total,
  color,
  label,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(progress / total, 1);
  const strokeDashoffset = circumference * (1 - percentage);
  const center = size / 2;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={color + '20'}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={percentage >= 1 ? '#2ECC71' : color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90, ${center}, ${center})`}
        />
      </Svg>
      <View style={styles.labelContainer}>
        <ThemedText style={[styles.progressText, { color: percentage >= 1 ? '#2ECC71' : color }]}>
          {progress}
        </ThemedText>
        <ThemedText style={styles.totalText}>/{total}</ThemedText>
      </View>
      {label && (
        <ThemedText style={[styles.label, { color: color }]}>{label}</ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelContainer: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  progressText: {
    fontSize: 16,
    fontWeight: '700',
  },
  totalText: {
    fontSize: 11,
    fontWeight: '500',
    opacity: 0.6,
  },
  label: {
    position: 'absolute',
    bottom: -2,
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
