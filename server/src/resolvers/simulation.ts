import { eq, sql } from 'drizzle-orm';

import type { SimulationResult } from '~/shared';
import { SimulationStatus } from '~/constants/enum';

import { db } from '~/db/database';
import { simulationsResultsTable, simulationsTable } from '~/db/tables';
import { runSimulationJob } from '~/services/job';

export const simulationResolvers = {
  Query: {
    simulations: async () => {
      const simulations = await db.select().from(simulationsTable);

      return simulations;
    },
    simulation: async (_: undefined, { id }) => {
      const simulation = await db
        .select({
          id: simulationsTable.id,
          status: simulationsTable.status,
          numChargePoints: simulationsTable.numChargePoints,
          arrivalMultiplier: simulationsTable.arrivalMultiplier,
          carConsumption: simulationsTable.carConsumption,
          chargingPower: simulationsTable.chargingPower,
          results: sql<SimulationResult>`json_agg(${simulationsResultsTable})`.as<
            SimulationResult[]
          >(),
        })
        .from(simulationsTable)
        .leftJoin(
          simulationsResultsTable,
          eq(simulationsResultsTable.simulationId, simulationsTable.id)
        )
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

      // results genrated in background
      const jobResults = await runSimulationJob(simulation, 3000);

      await db.insert(simulationsResultsTable).values({
        simulationId: simulation.id,
        ...jobResults,
      });

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
