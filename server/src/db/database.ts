import { drizzle } from 'drizzle-orm/libsql';
import { Client, createClient } from '@libsql/client';

import { DATABASE_URL, LOG_LEVEL } from '~/constants/env';

import { logger } from '~/utils/logger';

let client: Client;

export const connectToDatabase = () => {
  if (client) {
    return client;
  }

  client = createClient({ url: DATABASE_URL });
  logger.info('[drizzle] Database connected');
  return client;
};

export const db = drizzle(connectToDatabase(), {
  logger: LOG_LEVEL === 'debug',
});
