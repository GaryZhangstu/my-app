import { useState } from 'react';
import { ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DayPicker } from '@/components/day-picker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { createCosmeticDao } from '@/database/cosmetics';
import type { DayOfWeek } from '@/types';
import { COSMETIC_TYPES } from '@/types';

export default function AddCosmeticScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const params = useLocalSearchParams<{
    id?: string;
    name?: string;
    type?: string;
    brand?: string;
    frequency?: string;
    remind_days?: string;
    notes?: string;
  }>();
  const dao = createCosmeticDao(db);

  const isEditing = !!params.id;

  const [name, setName] = useState(params.name || '');
  const [type, setType] = useState(params.type || COSMETIC_TYPES[0]);
  const [brand, setBrand] = useState(params.brand || '');
  const [frequency, setFrequency] = useState(params.frequency || '3');
  const [remindDays, setRemindDays] = useState<DayOfWeek[]>(() => {
    try {
      return params.remind_days ? JSON.parse(params.remind_days) : [];
    } catch {
      return [];
    }
  });
  const [notes, setNotes] = useState(params.notes || '');

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('提示', '请输入产品名称');
      return;
    }

    const data = {
      name: name.trim(),
      type,
      brand: brand.trim() || undefined,
      frequency: parseInt(frequency) || 1,
      remind_days: JSON.stringify(remindDays),
      notes: notes.trim() || undefined,
    };

    if (isEditing) {
      await dao.update(parseInt(params.id!), data);
    } else {
      await dao.create(data);
    }

    router.back();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          {isEditing ? '编辑化妆品' : '添加化妆品'}
        </ThemedText>

        <Input
          label="产品名称"
          placeholder="如：兰蔻小黑瓶"
          value={name}
          onChangeText={setName}
        />

        <ThemedText type="small" style={styles.label}>
          产品类型
        </ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
          <ThemedView style={styles.typeRow}>
            {COSMETIC_TYPES.map((t) => (
              <Button
                key={t}
                title={t}
                variant={type === t ? 'primary' : 'secondary'}
                size="small"
                onPress={() => setType(t)}
              />
            ))}
          </ThemedView>
        </ScrollView>

        <Input
          label="品牌（可选）"
          placeholder="如：兰蔻"
          value={brand}
          onChangeText={setBrand}
        />

        <Input
          label="每周使用次数"
          placeholder="3"
          value={frequency}
          onChangeText={setFrequency}
          keyboardType="numeric"
        />

        <ThemedText type="small" style={styles.label}>
          提醒日
        </ThemedText>
        <DayPicker selected={remindDays} onChange={setRemindDays} />

        <Input
          label="备注（可选）"
          placeholder="其他备注信息"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
        />
      </ThemedView>

      <Button title={isEditing ? '保存修改' : '添加'} onPress={handleSave} />
      <Button title="取消" variant="secondary" onPress={() => router.back()} />
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
  section: {
    gap: Spacing.three,
  },
  sectionTitle: {
    marginBottom: Spacing.two,
  },
  label: {
    marginTop: Spacing.two,
  },
  typeScroll: {
    marginTop: Spacing.one,
  },
  typeRow: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
});
