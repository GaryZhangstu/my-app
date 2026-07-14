export interface Cosmetic {
  id: number;
  name: string;
  type: string;
  brand: string | null;
  frequency: number;
  remind_days: string;
  notes: string | null;
  created_at: string;
}

export interface Supplement {
  id: number;
  name: string;
  brand: string | null;
  dosage: string;
  remind_times: string;
  remind_days: string;
  scene: string | null;
  notes: string | null;
  is_active: number;
  created_at: string;
}

export interface UsageLog {
  id: number;
  product_type: 'cosmetic' | 'supplement';
  product_id: number;
  product_name: string;
  used_at: string;
  note: string | null;
}

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const DAY_LABELS: Record<DayOfWeek, string> = {
  0: '周日',
  1: '周一',
  2: '周二',
  3: '周三',
  4: '周四',
  5: '周五',
  6: '周六',
};

export const COSMETIC_TYPES = [
  '化妆水',
  '精华',
  '乳液',
  '面霜',
  '眼霜',
  '防晒',
  '面膜',
  '洁面',
  '其他',
] as const;

export const SUPPLEMENT_SCENES = ['饭前', '饭后', '空腹', '随餐', '睡前', '其他'] as const;

export function parseDays(daysJson: string): DayOfWeek[] {
  try {
    return JSON.parse(daysJson);
  } catch {
    return [];
  }
}

export function parseTimes(timesJson: string): string[] {
  try {
    return JSON.parse(timesJson);
  } catch {
    return [];
  }
}
