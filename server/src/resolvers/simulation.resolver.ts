import { eq } from 'drizzle-orm';

import { db } from '~/db/database';
import { simulationsTable } from '~/db/tables';

export const simultationResolvers = {
  Query: {
    simultations: () => db.select().from(simulationsTable),
    simultation: (_, { id }) =>
      db.select().from(simulationsTable).where(eq(simulationsTable.id, id)),
  },
};
