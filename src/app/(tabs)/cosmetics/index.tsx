import { useState, useCallback } from 'react';
import { FlatList, Pressable, StyleSheet } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useSQLiteContext } from 'expo-sqlite';

import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { createCosmeticDao } from '@/database/cosmetics';
import { useTheme } from '@/hooks/use-theme';
import type { Cosmetic, DayOfWeek } from '@/types';
import { DAY_LABELS, parseDays } from '@/types';

export default function CosmeticsScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const theme = useTheme();
  const [cosmetics, setCosmetics] = useState<Cosmetic[]>([]);
  const dao = createCosmeticDao(db);

  const loadCosmetics = async () => {
    const items = await dao.getAll();
    setCosmetics(items);
  };

  useFocusEffect(
    useCallback(() => {
      loadCosmetics();
    }, [])
  );

  const formatDays = (daysJson: string) => {
    const days = parseDays(daysJson);
    if (days.length === 0) return '未设置';
    return days.map((d) => DAY_LABELS[d as DayOfWeek]).join('、');
  };

  const renderItem = ({ item }: { item: Cosmetic }) => (
    <Card
      onPress={() =>
        router.push({ pathname: '/(tabs)/cosmetics/[id]', params: { id: item.id.toString() } })
      }>
      <ThemedView style={styles.itemContent}>
        <ThemedView style={styles.itemInfo}>
          <ThemedText type="default" style={styles.itemName}>
            {item.name}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {item.type} · {item.brand || '未知品牌'}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            一周{item.frequency}次 · {formatDays(item.remind_days)}
          </ThemedText>
        </ThemedView>
        <SymbolView
          name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
          size={16}
          tintColor={theme.textSecondary}
        />
      </ThemedView>
    </Card>
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={cosmetics}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState title="暂无化妆品" description="点击右上角添加你的第一个化妆品" />
        }
      />
      <Pressable
        style={[styles.fab, { backgroundColor: '#3c87f7' }]}
        onPress={() => router.push('/(tabs)/cosmetics/add' as any)}>
        <SymbolView name="plus" size={24} tintColor="#ffffff" />
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.six,
    gap: Spacing.two,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemInfo: {
    flex: 1,
    gap: Spacing.half,
  },
  itemName: {
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: Spacing.four,
    bottom: BottomTabInset + Spacing.four,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
