import { eq } from 'drizzle-orm';
import { SimulationStatus } from '~/constants/enum';

import { db } from '~/db/database';
import { simulationsTable } from '~/db/tables';

export const simultationResolvers = {
  Query: {
    simultations: async () => {
      const simulations = await db.select().from(simulationsTable);

      return simulations;
    },
    simultation: async (_: undefined, { id }) => {
      const simulation = await db
        .select()
        .from(simulationsTable)
        .where(eq(simulationsTable.id, id));

      return simulation;
    },
  },
  Mutation: {
    runSimulation: async (_: undefined, { id }) => {
      const [simulation] = await db
        .select()
        .from(simulationsTable)
        .where(eq(simulationsTable.id, id));

      if (!simulation) {
        throw new Error('Simulation not found');
      }

      if (simulation.status !== SimulationStatus.RUNNING) {
        return { status: simulation.status };
      }

      await db
        .update(simulationsTable)
        .set({ status: SimulationStatus.RUNNING })
        .where(eq(simulationsTable.id, id));

      return { status: SimulationStatus.RUNNING };
    },
    createSimulation: async (
      _: undefined,
      { numChargePoints, arrivalMultiplier, carConsumption, chargingPower }
    ) => {
      const simulation = await db
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
    updateSimulation: async (
      _: undefined,
      { id, numChargePoints, arrivalMultiplier, carConsumption, chargingPower }
    ) => {
      const simulation = await db
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
    deleteSimulation: async (_: undefined, { id }) => {
      const simulation = await db
        .delete(simulationsTable)
        .where(eq(simulationsTable.id, id))
        .returning();

      return simulation;
    },
  },
};
