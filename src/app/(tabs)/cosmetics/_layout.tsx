import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

export default function CosmeticsLayout() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
      }}>
      <Stack.Screen name="index" options={{ title: '化妆品' }} />
      <Stack.Screen name="add" options={{ title: '添加化妆品' }} />
      <Stack.Screen name="[id]" options={{ title: '化妆品详情' }} />
    </Stack>
  );
}
