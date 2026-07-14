import { useState, useCallback } from 'react';
import { SectionList, StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { createLogsDao } from '@/database/logs';
import type { UsageLog } from '@/types';

type Section = {
  title: string;
  data: UsageLog[];
};

export default function RecordsScreen() {
  const db = useSQLiteContext();
  const logsDao = createLogsDao(db);

  const [sections, setSections] = useState<Section[]>([]);

  const loadRecords = async () => {
    const logs = await logsDao.getRecent(100);

    const grouped: Record<string, UsageLog[]> = {};
    for (const log of logs) {
      const date = log.used_at.split(' ')[0] || log.used_at.split('T')[0];
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(log);
    }

    const result: Section[] = Object.entries(grouped)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, data]) => ({
        title: formatDateLabel(date),
        data,
      }));

    setSections(result);
  };

  useFocusEffect(
    useCallback(() => {
      loadRecords();
    }, [])
  );

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateStr === today.toISOString().split('T')[0]) {
      return '今天';
    }
    if (dateStr === yesterday.toISOString().split('T')[0]) {
      return '昨天';
    }

    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return `${month}月${day}日 ${weekdays[date.getDay()]}`;
  };

  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const renderItem = ({ item }: { item: UsageLog }) => (
    <Card>
      <ThemedView style={styles.itemRow}>
        <ThemedView style={styles.itemInfo}>
          <ThemedView style={styles.nameRow}>
            <ThemedView
              style={[
                styles.typeBadge,
                {
                  backgroundColor:
                    item.product_type === 'cosmetic' ? '#e8f0fe' : '#fef3e2',
                },
              ]}>
              <ThemedText
                style={[
                  styles.typeText,
                  {
                    color: item.product_type === 'cosmetic' ? '#1967d2' : '#e37400',
                  },
                ]}>
                {item.product_type === 'cosmetic' ? '化妆品' : '保健品'}
              </ThemedText>
            </ThemedView>
            <ThemedText type="default" style={styles.itemName}>
              {item.product_name}
            </ThemedText>
          </ThemedView>
          <ThemedText type="small" themeColor="textSecondary">
            {formatTime(item.used_at)}
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </Card>
  );

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      renderSectionHeader={({ section }) => (
        <ThemedText type="small" style={styles.sectionHeader}>
          {section.title}
        </ThemedText>
      )}
      contentContainerStyle={styles.list}
      ListEmptyComponent={
        <EmptyState title="暂无记录" description="完成打卡后这里会显示你的使用记录" />
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: Spacing.three,
    paddingBottom: Spacing.six,
  },
  sectionHeader: {
    fontWeight: '600',
    marginTop: Spacing.three,
    marginBottom: Spacing.two,
    marginLeft: Spacing.one,
  },
  itemRow: {
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
    gap: Spacing.two,
  },
  typeBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Spacing.one,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  itemName: {
    fontWeight: '500',
  },
});
