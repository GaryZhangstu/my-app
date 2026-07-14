import { useState, useCallback } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { SymbolView } from 'expo-symbols';
import { LinearGradient } from 'expo-linear-gradient';

import { GradientCard } from '@/components/ui/card';
import { CheckInButton } from '@/components/check-in-button';
import { EmptyState } from '@/components/ui/empty-state';
import { ProgressRing } from '@/components/progress-ring';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BrandColors, Gradients, Spacing } from '@/constants/theme';
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

  const totalCosmetics = cosmetics.length;
  const doneCosmetics = cosmetics.filter((c) => {
    const key = `cosmetic-${c.id}`;
    return (weeklyCountMap[key] ?? 0) >= c.frequency;
  }).length;

  const totalSupplements = supplements.length;
  const doneSupplements = supplements.filter((s) => {
    const key = `supplement-${s.id}`;
    return (weeklyCountMap[key] ?? 0) > 0;
  }).length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <LinearGradient
        colors={['#1C2530', '#0F1419']}
        style={styles.headerGradient}>
        <ThemedText type="subtitle" style={styles.headerTitle}>
          我的护肤
        </ThemedText>
        <ThemedText type="small" style={styles.headerSubtitle}>
          坚持每一天，遇见更好的自己
        </ThemedText>
      </LinearGradient>

      {cosmetics.length === 0 && supplements.length === 0 && (
        <EmptyState
          title="还没有添加产品"
          description="去化妆品或保健品页面添加产品吧"
        />
      )}

      {cosmetics.length > 0 && (
        <ThemedView style={styles.section}>
          <ThemedView style={styles.sectionHeader}>
            <SymbolView
              name={{ ios: 'drop.fill', android: 'water_drop', web: 'water_drop' }}
              size={16}
              tintColor={BrandColors.cosmetic}
            />
            <ThemedText type="smallBold" style={[styles.sectionTitle, { color: BrandColors.cosmetic }]}>
              化妆品
            </ThemedText>
            <ThemedText type="small" style={styles.sectionCount}>
              {doneCosmetics}/{totalCosmetics} 已达标
            </ThemedText>
          </ThemedView>
          {cosmetics.map((item) => {
            const key = `cosmetic-${item.id}`;
            const used = weeklyCountMap[key] ?? 0;
            const total = item.frequency;
            const done = used >= total;
            return (
              <GradientCard key={key} gradient={Gradients.cardCosmetic}>
                <View style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <ThemedText type="default" style={styles.itemName}>
                      {item.name}
                    </ThemedText>
                    <ThemedText type="small" style={styles.itemMeta}>
                      {item.type} · {item.brand || '未知品牌'}
                    </ThemedText>
                    <ThemedText
                      type="small"
                      style={{ color: done ? '#2ECC71' : BrandColors.warning, marginTop: 4 }}>
                      {done ? '本周已达标' : `还需 ${total - used} 次`}
                    </ThemedText>
                  </View>
                  <View style={styles.ringContainer}>
                    <ProgressRing
                      size={64}
                      strokeWidth={6}
                      progress={used}
                      total={total}
                      color={BrandColors.cosmetic}
                    />
                  </View>
                  <CheckInButton
                    checkedIn={checkedInMap[key] || false}
                    onPress={() => handleCheckIn('cosmetic', item.id, item.name)}
                  />
                </View>
              </GradientCard>
            );
          })}
        </ThemedView>
      )}

      {supplements.length > 0 && (
        <ThemedView style={styles.section}>
          <ThemedView style={styles.sectionHeader}>
            <SymbolView
              name={{ ios: 'pill.fill', android: 'medication', web: 'medication' }}
              size={16}
              tintColor={BrandColors.supplement}
            />
            <ThemedText type="smallBold" style={[styles.sectionTitle, { color: BrandColors.supplement }]}>
              保健品
            </ThemedText>
            <ThemedText type="small" style={styles.sectionCount}>
              {doneSupplements}/{totalSupplements} 已服用
            </ThemedText>
          </ThemedView>
          {supplements.map((item) => {
            const key = `supplement-${item.id}`;
            const used = weeklyCountMap[key] ?? 0;
            return (
              <GradientCard key={key} gradient={Gradients.cardSupplement}>
                <View style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <ThemedText type="default" style={styles.itemName}>
                      {item.name}
                    </ThemedText>
                    <ThemedText type="small" style={styles.itemMeta}>
                      {item.brand || '未知品牌'} · {item.dosage}
                      {item.scene ? ` · ${item.scene}` : ''}
                    </ThemedText>
                    <ThemedText type="small" style={{ color: used > 0 ? '#2ECC71' : BrandColors.warning, marginTop: 4 }}>
                      {used > 0 ? '今日已服用' : '待服用'}
                    </ThemedText>
                  </View>
                  <CheckInButton
                    checkedIn={checkedInMap[key] || false}
                    onPress={() => handleCheckIn('supplement', item.id, item.name)}
                  />
                </View>
              </GradientCard>
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
    gap: Spacing.three,
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
  section: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  sectionTitle: {
    fontWeight: '700',
    fontSize: 15,
  },
  sectionCount: {
    marginLeft: 'auto',
    opacity: 0.6,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  itemInfo: {
    flex: 1,
    gap: 2,
  },
  itemName: {
    fontWeight: '600',
    fontSize: 16,
  },
  itemMeta: {
    opacity: 0.6,
  },
  ringContainer: {
    marginRight: Spacing.one,
  },
});
