import { useState, useCallback } from 'react';
import { FlatList, Pressable, View, StyleSheet } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useSQLiteContext } from 'expo-sqlite';
import { LinearGradient } from 'expo-linear-gradient';

import { EmptyState } from '@/components/ui/empty-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BrandColors, Gradients, BottomTabInset, Spacing } from '@/constants/theme';
import { createSupplementDao } from '@/database/supplements';
import type { Supplement, DayOfWeek } from '@/types';
import { DAY_LABELS, parseDays, parseTimes } from '@/types';

export default function SupplementsScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
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
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={() =>
        router.push({ pathname: '/(tabs)/supplements/[id]', params: { id: item.id.toString() } })
      }>
      <LinearGradient
        colors={[...Gradients.cardSupplement]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardInner}>
        <View style={styles.accent} />
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.nameRow}>
              <ThemedText type="default" style={styles.itemName}>
                {item.name}
              </ThemedText>
              {!item.is_active && (
                <View style={styles.inactiveBadge}>
                  <ThemedText style={styles.inactiveText}>已停用</ThemedText>
                </View>
              )}
            </View>
            <SymbolView
              name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
              size={14}
              tintColor="#8B95A5"
            />
          </View>
          <ThemedText type="small" style={styles.itemMeta}>
            {item.brand || '未知品牌'} · {item.dosage}
          </ThemedText>
          <View style={styles.cardFooter}>
            <View style={styles.badge}>
              <ThemedText style={styles.badgeText}>{formatTimes(item.remind_times)}</ThemedText>
            </View>
            <ThemedText type="small" style={styles.daysText}>
              {formatDays(item.remind_days)}
            </ThemedText>
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );

  return (
    <ThemedView style={styles.container}>
      <LinearGradient
        colors={['#1C2530', '#0F1419']}
        style={styles.headerGradient}>
        <ThemedText type="subtitle" style={styles.headerTitle}>
          保健品
        </ThemedText>
        <ThemedText type="small" style={styles.headerSubtitle}>
          管理你的健康补充
        </ThemedText>
      </LinearGradient>

      <FlatList
        data={supplements}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState title="暂无保健品" description="点击右下角添加你的第一个保健品" />
        }
      />
      <Pressable
        style={styles.fab}
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
  headerGradient: {
    padding: Spacing.three,
    paddingTop: Spacing.two,
    borderBottomLeftRadius: Spacing.five,
    borderBottomRightRadius: Spacing.five,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  headerSubtitle: {
    marginTop: Spacing.one,
    opacity: 0.7,
  },
  list: {
    padding: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.six,
    gap: Spacing.two,
  },
  card: {
    borderRadius: Spacing.three,
  },
  cardInner: {
    borderRadius: Spacing.three,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  accent: {
    width: 4,
    backgroundColor: BrandColors.supplement,
  },
  cardContent: {
    flex: 1,
    padding: Spacing.three,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  itemName: {
    fontWeight: '600',
    fontSize: 16,
  },
  inactiveBadge: {
    backgroundColor: '#8B95A530',
    paddingHorizontal: Spacing.one,
    paddingVertical: 1,
    borderRadius: Spacing.one,
  },
  inactiveText: {
    color: '#8B95A5',
    fontSize: 10,
    fontWeight: '600',
  },
  itemMeta: {
    opacity: 0.6,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  badge: {
    backgroundColor: BrandColors.supplement + '20',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Spacing.two,
  },
  badgeText: {
    color: BrandColors.supplement,
    fontSize: 11,
    fontWeight: '600',
  },
  daysText: {
    opacity: 0.5,
    fontSize: 12,
  },
  pressed: {
    opacity: 0.7,
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
    backgroundColor: BrandColors.supplement,
    elevation: 6,
    shadowColor: BrandColors.supplement,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
});
