import { eq } from 'drizzle-orm';

import { db } from '~/db/database';
import { simulationsTable } from '~/db/tables';

export const simultationResolvers = {
  Query: {
    simultations: () => {
      const simulations = db.select().from(simulationsTable);

      return simulations;
    },
    simultation: (_, { id }) => {
      const simulation = db
        .select()
        .from(simulationsTable)
        .where(eq(simulationsTable.id, id));

      return simulation;
    },
  },
};
