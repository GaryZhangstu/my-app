import { type SQLiteDatabase } from 'expo-sqlite';

import { SCHEMA_VERSION, CREATE_TABLES } from './schema';

export async function initializeDatabase(db: SQLiteDatabase) {
  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = result?.user_version ?? 0;

  if (currentVersion >= SCHEMA_VERSION) {
    return;
  }

  if (currentVersion === 0) {
    await db.execAsync(CREATE_TABLES);
  }

  await db.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION}`);
}
