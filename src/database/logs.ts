import { type SQLiteDatabase } from 'expo-sqlite';

import type { UsageLog } from '@/types';

export function createLogsDao(db: SQLiteDatabase) {
  return {
    async add(data: {
      product_type: 'cosmetic' | 'supplement';
      product_id: number;
      product_name: string;
      note?: string;
    }): Promise<number> {
      const result = await db.runAsync(
        'INSERT INTO usage_logs (product_type, product_id, product_name, note) VALUES (?, ?, ?, ?)',
        data.product_type,
        data.product_id,
        data.product_name,
        data.note ?? null
      );
      return result.lastInsertRowId;
    },

    async getByDate(date: string): Promise<UsageLog[]> {
      return db.getAllAsync<UsageLog>(
        "SELECT * FROM usage_logs WHERE date(used_at) = ? ORDER BY used_at DESC",
        date
      );
    },

    async getByProduct(
      productType: string,
      productId: number
    ): Promise<UsageLog[]> {
      return db.getAllAsync<UsageLog>(
        'SELECT * FROM usage_logs WHERE product_type = ? AND product_id = ? ORDER BY used_at DESC',
        productType,
        productId
      );
    },

    async getRecent(limit: number = 50): Promise<UsageLog[]> {
      return db.getAllAsync<UsageLog>(
        'SELECT * FROM usage_logs ORDER BY used_at DESC LIMIT ?',
        limit
      );
    },

    async getTodayLogs(dayOfWeek: number): Promise<UsageLog[]> {
      return db.getAllAsync<UsageLog>(
        "SELECT * FROM usage_logs WHERE date(used_at) = date('now') ORDER BY used_at DESC"
      );
    },

    async isCheckedIn(
      productType: string,
      productId: number
    ): Promise<boolean> {
      const result = await db.getFirstAsync<{ count: number }>(
        "SELECT COUNT(*) as count FROM usage_logs WHERE product_type = ? AND product_id = ? AND date(used_at) = date('now')",
        productType,
        productId
      );
      return (result?.count ?? 0) > 0;
    },

    async getWeeklyCount(productType: string, productId: number): Promise<number> {
      const result = await db.getFirstAsync<{ count: number }>(
        "SELECT COUNT(*) as count FROM usage_logs WHERE product_type = ? AND product_id = ? AND used_at >= date('now', 'weekday 0', '-6 days')",
        productType,
        productId
      );
      return result?.count ?? 0;
    },

    async delete(id: number): Promise<void> {
      await db.runAsync('DELETE FROM usage_logs WHERE id = ?', id);
    },

    async getDatesWithRecords(): Promise<string[]> {
      const results = await db.getAllAsync<{ date: string }>(
        "SELECT DISTINCT date(used_at) as date FROM usage_logs ORDER BY date DESC"
      );
      return results.map((r) => r.date);
    },
  };
}
