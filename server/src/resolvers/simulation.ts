import { eq, sql } from 'drizzle-orm';

import { SimulationStatus } from '@types';

import { db } from '~/db/database';
import { simulationsResultsTable, simulationsTable } from '~/db/tables';
import { runSimulationJob } from '~/services/job';
import { deepParseJson } from 'deep-parse-json';
import { logger } from '~/utils/logger';

export const simulationResolvers = {
  Query: {
    simulations: async () => {
      const simulations = await db.select().from(simulationsTable);

      return simulations;
    },
    simulation: async (_: undefined, { id }) => {
      const sqSimulationResults = db
        .select({
          simulationId: simulationsResultsTable.simulationId,
          results: sql`
            json_group_array(
              json_object(
                'totalEnergyCharged', ${simulationsResultsTable.totalEnergyCharged},
                'chargingValuesPerHour', ${simulationsResultsTable.chargingValuesPerHour},
                'chargingEvents', ${simulationsResultsTable.chargingEvents},
                'createdAt', ${simulationsResultsTable.createdAt},
                'updatedAt', ${simulationsResultsTable.updatedAt}
              )
            ) `.as('results'),
        })
        .from(simulationsResultsTable)
        .groupBy(simulationsResultsTable.simulationId)
        .as('sqSimulationResults');

      const [simulation] = await db
        .select({
          id: simulationsTable.id,
          status: simulationsTable.status,
          numChargePoints: simulationsTable.numChargePoints,
          arrivalMultiplier: simulationsTable.arrivalMultiplier,
          carConsumption: simulationsTable.carConsumption,
          chargingPower: simulationsTable.chargingPower,
          results: sql`COALESCE(${sqSimulationResults.results}, '[]')`.as('results'),
        })
        .from(simulationsTable)
        .leftJoin(
          sqSimulationResults,
          eq(sqSimulationResults.simulationId, simulationsTable.id)
        )
        .where(eq(simulationsTable.id, id))
        .limit(1);

      if (!simulation) {
        throw new Error('Simulation not found');
      }

      const parsedSimulation = deepParseJson(simulation);

      return parsedSimulation;
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

      if (
        ![
          SimulationStatus.Scheduled,
          SimulationStatus.Failed,
          SimulationStatus.Success,
        ].includes(simulation.status)
      ) {
        return { status: simulation.status };
      }

      await db
        .update(simulationsTable)
        .set({ status: SimulationStatus.Running })
        .where(eq(simulationsTable.id, id));

      // results generated in background
      (async () => {
        const jobResults = await runSimulationJob(simulation, 10000);

        await db.transaction(async tx => {
          try {
            await tx.insert(simulationsResultsTable).values({
              simulationId: simulation.id,
              ...jobResults,
            });

            await tx
              .update(simulationsTable)
              .set({ status: SimulationStatus.Success })
              .where(eq(simulationsTable.id, id));
          } catch (error) {
            logger.error(`[simulation] ${error}`);
            tx.rollback();
          }
        });
      })();

      return { status: simulation.status };
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
