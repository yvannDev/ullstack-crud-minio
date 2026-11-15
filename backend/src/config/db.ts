import { Pool } from 'pg';
import { env } from './env';

export const pool = new Pool({ connectionString: env.DATABASE_URL });

export async function initializeDatabase(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id BIGSERIAL PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
      image_key TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}
