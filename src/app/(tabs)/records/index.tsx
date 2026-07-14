import { useState, useCallback } from 'react';
import { SectionList, View, StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { SymbolView } from 'expo-symbols';
import { LinearGradient } from 'expo-linear-gradient';

import { EmptyState } from '@/components/ui/empty-state';
import { ThemedText } from '@/components/themed-text';
import { BrandColors, Gradients, Spacing } from '@/constants/theme';
import { createLogsDao } from '@/database/logs';
import type { UsageLog } from '@/types';

type Section = {
  title: string;
  data: UsageLog[];
};

function formatDateLabel(dateStr: string) {
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
}

function formatTime(timeStr: string) {
  const date = new Date(timeStr);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

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

  const isCosmetic = (item: UsageLog) => item.product_type === 'cosmetic';

  const renderItem = ({ item, index, section }: { item: UsageLog; index: number; section: Section }) => {
    const isLast = index === section.data.length - 1;
    const color = isCosmetic(item) ? BrandColors.cosmetic : BrandColors.supplement;

    return (
      <View style={styles.timelineItem}>
        <View style={styles.timelineLeft}>
          <View style={[styles.dot, { backgroundColor: color }]} />
          {!isLast && <View style={styles.line} />}
        </View>
        <LinearGradient
          colors={[...Gradients.card]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.itemCard}>
          <View style={styles.itemHeader}>
            <View style={[styles.typeBadge, { backgroundColor: color + '20' }]}>
              <SymbolView
                name={
                  isCosmetic(item)
                    ? { ios: 'drop.fill', android: 'water_drop', web: 'water_drop' }
                    : { ios: 'pill.fill', android: 'medication', web: 'medication' }
                }
                size={12}
                tintColor={color}
              />
              <ThemedText type="small" style={[styles.typeLabel, { color }]}>
                {isCosmetic(item) ? '化妆品' : '保健品'}
              </ThemedText>
            </View>
            <ThemedText type="small" style={styles.time}>
              {formatTime(item.used_at)}
            </ThemedText>
          </View>
          <ThemedText type="default" style={styles.itemName}>
            {item.product_name}
          </ThemedText>
        </LinearGradient>
      </View>
    );
  };

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      renderSectionHeader={({ section }) => (
        <View style={styles.sectionHeader}>
          <View style={styles.sectionDot} />
          <ThemedText type="smallBold" style={styles.sectionTitle}>
            {section.title}
          </ThemedText>
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.three,
    marginBottom: Spacing.two,
    marginLeft: Spacing.one,
  },
  sectionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: BrandColors.accent,
  },
  sectionTitle: {
    fontWeight: '700',
    fontSize: 15,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: Spacing.one,
  },
  timelineLeft: {
    width: 24,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 16,
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: '#253344',
    marginTop: 4,
  },
  itemCard: {
    flex: 1,
    borderRadius: Spacing.three,
    padding: Spacing.three,
    marginLeft: Spacing.two,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.one,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.half,
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: Spacing.two,
  },
  typeLabel: {
    fontWeight: '600',
    fontSize: 11,
  },
  time: {
    opacity: 0.5,
    fontSize: 12,
  },
  itemName: {
    fontWeight: '500',
  },
});
