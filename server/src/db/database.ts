import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';

import { DATABASE_URL, LOG_LEVEL } from '~/config/env';

import { logger } from '~/utils/logger';

let client;

export const connectToDatabase = () => {
  if (client) {
    return client;
  }

  client = new Database(DATABASE_URL);
  logger.info('[drizzle] Database connected');
  return client;
};

export const db = drizzle(connectToDatabase(), {
  logger: LOG_LEVEL === 'debug',
});
