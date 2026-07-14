import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { createCosmeticDao } from '@/database/cosmetics';
import type { Cosmetic, DayOfWeek } from '@/types';
import { DAY_LABELS, parseDays } from '@/types';

export default function CosmeticDetailScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const cosmeticDao = createCosmeticDao(db);

  const [cosmetic, setCosmetic] = useState<Cosmetic | null>(null);

  const loadCosmetic = async () => {
    const item = await cosmeticDao.getById(parseInt(id!));
    setCosmetic(item);
  };

  useFocusEffect(
    useCallback(() => {
      loadCosmetic();
    }, [id])
  );

  const handleDelete = () => {
    Alert.alert('确认删除', `确定要删除"${cosmetic?.name}"吗？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          await cosmeticDao.delete(parseInt(id!));
          router.back();
        },
      },
    ]);
  };

  const handleEdit = () => {
    if (!cosmetic) return;
    router.push({
      pathname: '/(tabs)/cosmetics/add',
      params: {
        id: cosmetic.id.toString(),
        name: cosmetic.name,
        type: cosmetic.type,
        brand: cosmetic.brand ?? '',
        frequency: cosmetic.frequency.toString(),
        remind_days: cosmetic.remind_days,
        notes: cosmetic.notes ?? '',
      },
    } as any);
  };

  const formatDays = (daysJson: string) => {
    const days = parseDays(daysJson);
    if (days.length === 0) return '未设置';
    return days.map((d) => DAY_LABELS[d as DayOfWeek]).join('、');
  };

  if (!cosmetic) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText>加载中...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card>
        <ThemedView style={styles.info}>
          <ThemedText type="subtitle">{cosmetic.name}</ThemedText>
          <ThemedText themeColor="textSecondary">
            {cosmetic.type} · {cosmetic.brand || '未知品牌'}
          </ThemedText>
        </ThemedView>
      </Card>

      <Card>
        <ThemedView style={styles.details}>
          <ThemedView style={styles.row}>
            <ThemedText type="small" themeColor="textSecondary">
              每周使用
            </ThemedText>
            <ThemedText type="small">{cosmetic.frequency} 次</ThemedText>
          </ThemedView>
          <ThemedView style={styles.row}>
            <ThemedText type="small" themeColor="textSecondary">
              提醒日
            </ThemedText>
            <ThemedText type="small">{formatDays(cosmetic.remind_days)}</ThemedText>
          </ThemedView>
          {cosmetic.notes && (
            <ThemedView style={styles.row}>
              <ThemedText type="small" themeColor="textSecondary">
                备注
              </ThemedText>
              <ThemedText type="small">{cosmetic.notes}</ThemedText>
            </ThemedView>
          )}
        </ThemedView>
      </Card>

      <ThemedView style={styles.actions}>
        <Button title="编辑" onPress={handleEdit} />
        <Button title="删除" variant="danger" onPress={handleDelete} />
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    gap: Spacing.one,
  },
  details: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actions: {
    gap: Spacing.two,
  },
});
