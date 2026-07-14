import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { createSupplementDao } from '@/database/supplements';
import type { Supplement, DayOfWeek } from '@/types';
import { DAY_LABELS, parseDays, parseTimes } from '@/types';

export default function SupplementDetailScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const dao = createSupplementDao(db);

  const [supplement, setSupplement] = useState<Supplement | null>(null);

  const loadSupplement = async () => {
    const item = await dao.getById(parseInt(id!));
    setSupplement(item);
  };

  useEffect(() => {
    loadSupplement();
  }, [id]);

  const handleDelete = () => {
    Alert.alert('确认删除', `确定要删除"${supplement?.name}"吗？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          await dao.delete(parseInt(id!));
          router.back();
        },
      },
    ]);
  };

  const handleToggleActive = async () => {
    if (!supplement) return;
    await dao.toggleActive(supplement.id, !supplement.is_active);
    setSupplement({ ...supplement, is_active: supplement.is_active ? 0 : 1 });
  };

  const handleEdit = () => {
    if (!supplement) return;
    router.push({
      pathname: '/(tabs)/supplements/add',
      params: {
        id: supplement.id.toString(),
        name: supplement.name,
        brand: supplement.brand ?? '',
        dosage: supplement.dosage,
        remind_times: supplement.remind_times,
        remind_days: supplement.remind_days,
        scene: supplement.scene ?? '',
        notes: supplement.notes ?? '',
        is_active: supplement.is_active.toString(),
      },
    } as any);
  };

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

  if (!supplement) {
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
          <ThemedView style={styles.nameRow}>
            <ThemedText type="subtitle">{supplement.name}</ThemedText>
            {!supplement.is_active && (
              <ThemedText type="small" themeColor="textSecondary">
                （已停用）
              </ThemedText>
            )}
          </ThemedView>
          <ThemedText themeColor="textSecondary">
            {supplement.brand || '未知品牌'} · {supplement.dosage}
          </ThemedText>
        </ThemedView>
      </Card>

      <Card>
        <ThemedView style={styles.details}>
          <ThemedView style={styles.row}>
            <ThemedText type="small" themeColor="textSecondary">
              提醒时间
            </ThemedText>
            <ThemedText type="small">{formatTimes(supplement.remind_times)}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.row}>
            <ThemedText type="small" themeColor="textSecondary">
              提醒日
            </ThemedText>
            <ThemedText type="small">{formatDays(supplement.remind_days)}</ThemedText>
          </ThemedView>
          {supplement.scene && (
            <ThemedView style={styles.row}>
              <ThemedText type="small" themeColor="textSecondary">
                服用场景
              </ThemedText>
              <ThemedText type="small">{supplement.scene}</ThemedText>
            </ThemedView>
          )}
          {supplement.notes && (
            <ThemedView style={styles.row}>
              <ThemedText type="small" themeColor="textSecondary">
                备注
              </ThemedText>
              <ThemedText type="small">{supplement.notes}</ThemedText>
            </ThemedView>
          )}
        </ThemedView>
      </Card>

      <ThemedView style={styles.actions}>
        <Button title="编辑" onPress={handleEdit} />
        <Button
          title={supplement.is_active ? '停用' : '启用'}
          variant="secondary"
          onPress={handleToggleActive}
        />
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
