import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { Colors } from '@/constants/theme';

export default function TabLayout() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3c87f7',
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: { backgroundColor: colors.background },
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '首页',
          tabBarIcon: ({ color, size }) => (
            <SymbolView name="house.fill" size={size} tintColor={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cosmetics"
        options={{
          title: '化妆品',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <SymbolView name="sparkles" size={size} tintColor={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="supplements"
        options={{
          title: '保健品',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <SymbolView name="cross.vial" size={size} tintColor={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="records"
        options={{
          title: '记录',
          tabBarIcon: ({ color, size }) => (
            <SymbolView name="clock.arrow.circlepath" size={size} tintColor={color} />
          ),
        }}
      />
    </Tabs>
  );
}
