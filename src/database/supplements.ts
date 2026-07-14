import { type SQLiteDatabase } from 'expo-sqlite';

import type { Supplement } from '@/types';

export function createSupplementDao(db: SQLiteDatabase) {
  return {
    async getAll(): Promise<Supplement[]> {
      return db.getAllAsync<Supplement>('SELECT * FROM supplements ORDER BY created_at DESC');
    },

    async getActive(): Promise<Supplement[]> {
      return db.getAllAsync<Supplement>(
        'SELECT * FROM supplements WHERE is_active = 1 ORDER BY created_at DESC'
      );
    },

    async getById(id: number): Promise<Supplement | null> {
      return db.getFirstAsync<Supplement>('SELECT * FROM supplements WHERE id = ?', id);
    },

    async create(data: {
      name: string;
      brand?: string;
      dosage: string;
      remind_times: string;
      remind_days: string;
      scene?: string;
      notes?: string;
    }): Promise<number> {
      const result = await db.runAsync(
        'INSERT INTO supplements (name, brand, dosage, remind_times, remind_days, scene, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
        data.name,
        data.brand ?? null,
        data.dosage,
        data.remind_times,
        data.remind_days,
        data.scene ?? null,
        data.notes ?? null
      );
      return result.lastInsertRowId;
    },

    async update(
      id: number,
      data: {
        name: string;
        brand?: string;
        dosage: string;
        remind_times: string;
        remind_days: string;
        scene?: string;
        notes?: string;
        is_active: number;
      }
    ): Promise<void> {
      await db.runAsync(
        'UPDATE supplements SET name = ?, brand = ?, dosage = ?, remind_times = ?, remind_days = ?, scene = ?, notes = ?, is_active = ? WHERE id = ?',
        data.name,
        data.brand ?? null,
        data.dosage,
        data.remind_times,
        data.remind_days,
        data.scene ?? null,
        data.notes ?? null,
        data.is_active,
        id
      );
    },

    async delete(id: number): Promise<void> {
      await db.runAsync('DELETE FROM supplements WHERE id = ?', id);
    },

    async toggleActive(id: number, isActive: boolean): Promise<void> {
      await db.runAsync('UPDATE supplements SET is_active = ? WHERE id = ?', isActive ? 1 : 0, id);
    },

    async getTodayItems(dayOfWeek: number): Promise<Supplement[]> {
      const all = await this.getActive();
      return all.filter((item) => {
        try {
          const days: number[] = JSON.parse(item.remind_days);
          return days.includes(dayOfWeek);
        } catch {
          return false;
        }
      });
    },
  };
}
