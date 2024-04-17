import { GraphQLError } from 'graphql';
import { eq, sql } from 'drizzle-orm';
import { deepParseJson } from 'deep-parse-json';

import {
  MutationCreateSimulationArgs,
  MutationUpdateSimulationArgs,
  SimulationStatus,
} from '@types';

import { db } from '~/db/database';
import { simulationsResultsTable, simulationsTable } from '~/db/tables';

import {
  CreateSimulationValidator,
  UpdateSimulationValidator,
} from '~/validators/simulation';

import { logger } from '~/utils/logger';

import { runSimulationJob } from '~/services/job';

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
          createdAt: simulationsTable.createdAt,
          updatedAt: simulationsTable.updatedAt,
        })
        .from(simulationsTable)
        .leftJoin(
          sqSimulationResults,
          eq(sqSimulationResults.simulationId, simulationsTable.id)
        )
        .where(eq(simulationsTable.id, id))
        .limit(1);

      if (!simulation) {
        throw new GraphQLError('Simulation not found', {
          extensions: {
            code: 'NOT_FOUND',
          },
        });
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
        throw new GraphQLError('Simulation not found', {
          extensions: {
            code: 'NOT_FOUND',
          },
        });
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
    createSimulation: async (_: undefined, args: MutationCreateSimulationArgs) => {
      const result = await CreateSimulationValidator.safeParseAsync(args);

      if (result.success === false) {
        throw new GraphQLError('Invalid input', {
          extensions: {
            code: 'BAD_USER_INPUT',
            fields: result.error.format(),
          },
        });
      }

      const { numChargePoints, arrivalMultiplier, carConsumption, chargingPower } =
        result.data;

      const [simulation] = await db
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
    updateSimulation: async (_: undefined, args: MutationUpdateSimulationArgs) => {
      const result = await UpdateSimulationValidator.safeParseAsync(args);

      if (result.success === false) {
        throw new GraphQLError('Invalid input', {
          extensions: {
            code: 'BAD_USER_INPUT',
            fields: result.error.format(),
          },
        });
      }

      const { id, numChargePoints, arrivalMultiplier, carConsumption, chargingPower } =
        result.data;

      const [simulation] = await db
        .update(simulationsTable)
        .set({
          numChargePoints,
          arrivalMultiplier,
          carConsumption,
          chargingPower,
        })
        .where(eq(simulationsTable.id, id))
        .returning();

      if (!simulation) {
        throw new GraphQLError('Simulation not found', {
          extensions: {
            code: 'NOT_FOUND',
          },
        });
      }

      return simulation;
    },
    deleteSimulation: async (_: undefined, { id }) => {
      const [simulation] = await db
        .select()
        .from(simulationsTable)
        .where(eq(simulationsTable.id, id));

      if (!simulation) {
        throw new GraphQLError('Simulation not found', {
          extensions: {
            code: 'NOT_FOUND',
          },
        });
      }

      await db.delete(simulationsTable).where(eq(simulationsTable.id, id));

      return null;
    },
  },
};
