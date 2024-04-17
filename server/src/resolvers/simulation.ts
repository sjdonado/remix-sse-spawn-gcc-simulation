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
  Mutation: {
    createSimulation: (
      _,
      { numChargePoints, arrivalMultiplier, carConsumption, chargingPower }
    ) => {
      const simulation = db
        .insert(simulationsTable)
        .values({
          numChargePoints,
          arrivalMultiplier,
          carConsumption,
          chargingPower,
        })
        .returning();

      return simulation;
    },
    updateSimulation: (
      _,
      { id, numChargePoints, arrivalMultiplier, carConsumption, chargingPower }
    ) => {
      const simulation = db
        .update(simulationsTable)
        .set({
          numChargePoints,
          arrivalMultiplier,
          carConsumption,
          chargingPower,
        })
        .where(eq(simulationsTable.id, id))
        .returning();

      return simulation;
    },
    deleteSimulation: (_, { id }) => {
      const simulation = db
        .delete(simulationsTable)
        .where(eq(simulationsTable.id, id))
        .returning();

      return simulation;
    },
  },
};
