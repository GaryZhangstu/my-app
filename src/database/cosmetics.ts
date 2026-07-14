import { type SQLiteDatabase } from 'expo-sqlite';

import type { Cosmetic } from '@/types';

export function createCosmeticDao(db: SQLiteDatabase) {
  return {
    async getAll(): Promise<Cosmetic[]> {
      return db.getAllAsync<Cosmetic>('SELECT * FROM cosmetics ORDER BY created_at DESC');
    },

    async getById(id: number): Promise<Cosmetic | null> {
      return db.getFirstAsync<Cosmetic>('SELECT * FROM cosmetics WHERE id = ?', id);
    },

    async create(data: {
      name: string;
      type: string;
      brand?: string;
      frequency: number;
      remind_days: string;
      notes?: string;
    }): Promise<number> {
      const result = await db.runAsync(
        'INSERT INTO cosmetics (name, type, brand, frequency, remind_days, notes) VALUES (?, ?, ?, ?, ?, ?)',
        data.name,
        data.type,
        data.brand ?? null,
        data.frequency,
        data.remind_days,
        data.notes ?? null
      );
      return result.lastInsertRowId;
    },

    async update(
      id: number,
      data: {
        name: string;
        type: string;
        brand?: string;
        frequency: number;
        remind_days: string;
        notes?: string;
      }
    ): Promise<void> {
      await db.runAsync(
        'UPDATE cosmetics SET name = ?, type = ?, brand = ?, frequency = ?, remind_days = ?, notes = ? WHERE id = ?',
        data.name,
        data.type,
        data.brand ?? null,
        data.frequency,
        data.remind_days,
        data.notes ?? null,
        id
      );
    },

    async delete(id: number): Promise<void> {
      await db.runAsync('DELETE FROM cosmetics WHERE id = ?', id);
    },

    async getTodayItems(dayOfWeek: number): Promise<Cosmetic[]> {
      const all = await this.getAll();
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
