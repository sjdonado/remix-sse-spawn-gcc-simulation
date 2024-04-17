import type { Config } from 'drizzle-kit';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error('DATABASE_URL is not set');

export default {
  schema: './src/db/tables.ts',
  out: './src/db/migrations',
  driver: 'libsql',
  dbCredentials: {
    url: DATABASE_URL,
  },
  strict: true,
} satisfies Config;
