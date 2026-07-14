import { useState } from 'react';
import { ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DayPicker } from '@/components/day-picker';
import { TimePicker } from '@/components/time-picker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { createSupplementDao } from '@/database/supplements';
import type { DayOfWeek } from '@/types';
import { SUPPLEMENT_SCENES } from '@/types';

export default function AddSupplementScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const params = useLocalSearchParams<{
    id?: string;
    name?: string;
    brand?: string;
    dosage?: string;
    remind_times?: string;
    remind_days?: string;
    scene?: string;
    notes?: string;
    is_active?: string;
  }>();
  const dao = createSupplementDao(db);

  const isEditing = !!params.id;

  const [name, setName] = useState(params.name || '');
  const [brand, setBrand] = useState(params.brand || '');
  const [dosage, setDosage] = useState(params.dosage || '');
  const [remindTimes, setRemindTimes] = useState<string[]>(() => {
    try {
      return params.remind_times ? JSON.parse(params.remind_times) : [];
    } catch {
      return [];
    }
  });
  const [remindDays, setRemindDays] = useState<DayOfWeek[]>(() => {
    try {
      return params.remind_days ? JSON.parse(params.remind_days) : [];
    } catch {
      return [];
    }
  });
  const [scene, setScene] = useState(params.scene || '');
  const [notes, setNotes] = useState(params.notes || '');
  const [isActive] = useState(params.is_active !== '0');

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('提示', '请输入产品名称');
      return;
    }
    if (!dosage.trim()) {
      Alert.alert('提示', '请输入剂量');
      return;
    }
    if (remindTimes.length === 0) {
      Alert.alert('提示', '请至少添加一个提醒时间');
      return;
    }
    if (remindDays.length === 0) {
      Alert.alert('提示', '请至少选择一个提醒日');
      return;
    }

    const data = {
      name: name.trim(),
      brand: brand.trim() || undefined,
      dosage: dosage.trim(),
      remind_times: JSON.stringify(remindTimes),
      remind_days: JSON.stringify(remindDays),
      scene: scene || undefined,
      notes: notes.trim() || undefined,
    };

    if (isEditing) {
      await dao.update(parseInt(params.id!), {
        ...data,
        is_active: isActive ? 1 : 0,
      });
    } else {
      await dao.create(data);
    }

    router.back();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          {isEditing ? '编辑保健品' : '添加保健品'}
        </ThemedText>

        <Input
          label="产品名称"
          placeholder="如：维生素D3"
          value={name}
          onChangeText={setName}
        />

        <Input
          label="品牌（可选）"
          placeholder="如：Swisse"
          value={brand}
          onChangeText={setBrand}
        />

        <Input
          label="剂量"
          placeholder="如：1粒、5ml"
          value={dosage}
          onChangeText={setDosage}
        />

        <ThemedText type="small" style={styles.label}>
          提醒时间
        </ThemedText>
        <TimePicker times={remindTimes} onChange={setRemindTimes} />

        <ThemedText type="small" style={styles.label}>
          提醒日
        </ThemedText>
        <DayPicker selected={remindDays} onChange={setRemindDays} />

        <ThemedText type="small" style={styles.label}>
          服用场景（可选）
        </ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
          <ThemedView style={styles.typeRow}>
            {SUPPLEMENT_SCENES.map((s) => (
              <Button
                key={s}
                title={s}
                variant={scene === s ? 'primary' : 'secondary'}
                size="small"
                onPress={() => setScene(scene === s ? '' : s)}
              />
            ))}
          </ThemedView>
        </ScrollView>

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
