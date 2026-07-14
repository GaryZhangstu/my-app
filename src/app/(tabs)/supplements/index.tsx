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
import { createSupplementDao } from '@/database/supplements';
import { useTheme } from '@/hooks/use-theme';
import type { Supplement, DayOfWeek } from '@/types';
import { DAY_LABELS, parseDays, parseTimes } from '@/types';

export default function SupplementsScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const theme = useTheme();
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const dao = createSupplementDao(db);

  const loadSupplements = async () => {
    const items = await dao.getAll();
    setSupplements(items);
  };

  useFocusEffect(
    useCallback(() => {
      loadSupplements();
    }, [])
  );

  const formatDays = (daysJson: string) => {
    const days = parseDays(daysJson);
    if (days.length === 0) return '未设置';
    return days.map((d) => DAY_LABELS[d as DayOfWeek]).join('、');
  };

  const formatTimes = (timesJson: string) => {
    const times = parseTimes(timesJson);
    if (times.length === 0) return '未设置';
    return times.join('、');
  };

  const renderItem = ({ item }: { item: Supplement }) => (
    <Card
      onPress={() =>
        router.push({ pathname: '/(tabs)/supplements/[id]', params: { id: item.id.toString() } })
      }>
      <ThemedView style={styles.itemContent}>
        <ThemedView style={styles.itemInfo}>
          <ThemedView style={styles.nameRow}>
            <ThemedText type="default" style={styles.itemName}>
              {item.name}
            </ThemedText>
            {!item.is_active && (
              <ThemedText type="small" themeColor="textSecondary">
                （已停用）
              </ThemedText>
            )}
          </ThemedView>
          <ThemedText type="small" themeColor="textSecondary">
            {item.brand || '未知品牌'} · {item.dosage}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {formatDays(item.remind_days)} · {formatTimes(item.remind_times)}
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
        data={supplements}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState title="暂无保健品" description="点击右上角添加你的第一个保健品" />
        }
      />
      <Pressable
        style={[styles.fab, { backgroundColor: '#3c87f7' }]}
        onPress={() => router.push('/(tabs)/supplements/add' as any)}>
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
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
