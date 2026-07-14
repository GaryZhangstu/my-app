import { useState, useCallback } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import { Card } from '@/components/ui/card';
import { CheckInButton } from '@/components/check-in-button';
import { EmptyState } from '@/components/ui/empty-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { createCosmeticDao } from '@/database/cosmetics';
import { createSupplementDao } from '@/database/supplements';
import { createLogsDao } from '@/database/logs';
import type { Cosmetic, Supplement } from '@/types';

export default function HomeScreen() {
  const db = useSQLiteContext();
  const cosmeticDao = createCosmeticDao(db);
  const supplementDao = createSupplementDao(db);
  const logsDao = createLogsDao(db);

  const [cosmetics, setCosmetics] = useState<Cosmetic[]>([]);
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [checkedInMap, setCheckedInMap] = useState<Record<string, boolean>>({});
  const [weeklyCountMap, setWeeklyCountMap] = useState<Record<string, number>>({});

  const loadData = async () => {
    const allCosmetics = await cosmeticDao.getAll();
    const allSupplements = await supplementDao.getActive();

    setCosmetics(allCosmetics);
    setSupplements(allSupplements);

    const map: Record<string, boolean> = {};
    const weekMap: Record<string, number> = {};

    for (const c of allCosmetics) {
      map[`cosmetic-${c.id}`] = await logsDao.isCheckedIn('cosmetic', c.id);
      weekMap[`cosmetic-${c.id}`] = await logsDao.getWeeklyCount('cosmetic', c.id);
    }
    for (const s of allSupplements) {
      map[`supplement-${s.id}`] = await logsDao.isCheckedIn('supplement', s.id);
      weekMap[`supplement-${s.id}`] = await logsDao.getWeeklyCount('supplement', s.id);
    }

    setCheckedInMap(map);
    setWeeklyCountMap(weekMap);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleCheckIn = async (type: 'cosmetic' | 'supplement', id: number, name: string) => {
    const key = `${type}-${id}`;
    if (checkedInMap[key]) return;

    await logsDao.add({
      product_type: type,
      product_id: id,
      product_name: name,
    });

    setCheckedInMap((prev) => ({ ...prev, [key]: true }));
    setWeeklyCountMap((prev) => ({ ...prev, [key]: (prev[key] ?? 0) + 1 }));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ThemedView style={styles.header}>
        <ThemedText type="subtitle">我的护肤</ThemedText>
      </ThemedView>

      {cosmetics.length === 0 && supplements.length === 0 && (
        <EmptyState
          title="还没有添加产品"
          description="去化妆品或保健品页面添加产品吧"
        />
      )}

      {cosmetics.length > 0 && (
        <ThemedView style={styles.section}>
          <ThemedText type="small" style={styles.sectionTitle}>
            化妆品
          </ThemedText>
          {cosmetics.map((item) => {
            const key = `cosmetic-${item.id}`;
            const used = weeklyCountMap[key] ?? 0;
            const total = item.frequency;
            const done = used >= total;
            return (
              <Card key={key}>
                <ThemedView style={styles.itemRow}>
                  <ThemedView style={styles.itemInfo}>
                    <ThemedText type="default" style={styles.itemName}>
                      {item.name}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {item.type} · {item.brand || '未知品牌'}
                    </ThemedText>
                    <ThemedText
                      type="small"
                      style={{ color: done ? '#34c759' : '#e37400' }}>
                      本周 {used}/{total} 次{done ? ' ✓ 已达标' : ''}
                    </ThemedText>
                  </ThemedView>
                  <CheckInButton
                    checkedIn={checkedInMap[key] || false}
                    onPress={() => handleCheckIn('cosmetic', item.id, item.name)}
                  />
                </ThemedView>
              </Card>
            );
          })}
        </ThemedView>
      )}

      {supplements.length > 0 && (
        <ThemedView style={styles.section}>
          <ThemedText type="small" style={styles.sectionTitle}>
            保健品
          </ThemedText>
          {supplements.map((item) => {
            const key = `supplement-${item.id}`;
            return (
              <Card key={key}>
                <ThemedView style={styles.itemRow}>
                  <ThemedView style={styles.itemInfo}>
                    <ThemedText type="default" style={styles.itemName}>
                      {item.name}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {item.brand || '未知品牌'} · {item.dosage}
                      {item.scene ? ` · ${item.scene}` : ''}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      本周已服 {weeklyCountMap[key] ?? 0} 次
                    </ThemedText>
                  </ThemedView>
                  <CheckInButton
                    checkedIn={checkedInMap[key] || false}
                    onPress={() => handleCheckIn('supplement', item.id, item.name)}
                  />
                </ThemedView>
              </Card>
            );
          })}
        </ThemedView>
      )}
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
  header: {
    gap: Spacing.one,
    paddingVertical: Spacing.two,
  },
  section: {
    gap: Spacing.two,
  },
  sectionTitle: {
    fontWeight: '600',
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
  itemName: {
    fontWeight: '600',
  },
});
