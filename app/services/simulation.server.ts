import { eq } from 'drizzle-orm';

import { db } from '~/db/database.server';
import { simulationsResultsTable, simulationsTable } from '~/db/tables.server';
import type { Simulation } from '~/schemas/simulation';

import { SimulationStatus, DONE_JOB_MESSAGE } from '~/constants/simulation';
import { logger } from '~/utils/logger.server';

export const scheduleSimulation = async (
  numChargePoints: Simulation['numChargePoints'],
  arrivalMultiplier: Simulation['arrivalMultiplier'],
  carConsumption: Simulation['carConsumption'],
  chargingPower: Simulation['chargingPower']
) => {
  const [simulation] = await db
    .insert(simulationsTable)
    .values({
      numChargePoints,
      arrivalMultiplier,
      carConsumption,
      chargingPower,
    })
    .returning();

  return simulation.id;
};

export async function startSimulation(simulation: Simulation) {
  const encoder = new TextEncoder();

  const encodeMessage = (message: string, percentage: number, time = Date.now()) =>
    encoder.encode(`data: ${time},${(percentage * 100).toFixed(1)},${message}\n\n`);

  // check if simulation is not running or completed
  if ([SimulationStatus.Running, SimulationStatus.Success].includes(simulation.status)) {
    logger.error(
      `[${startSimulation.name}] (${simulation.id}) already running or completed`
    );

    return encodeMessage(DONE_JOB_MESSAGE, 1);
  }

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (message: string, percentage: number) => {
        const time = Date.now();
        controller.enqueue(encodeMessage(message, percentage, time));
      };

      try {
        sendEvent('Starting simulation...', 0);
        await new Promise(resolve => setTimeout(resolve, 2000));

        const chargingEvents = Math.ceil(Math.random() * simulation.numChargePoints);

        const results = {
          totalEnergyCharged:
            chargingEvents * simulation.arrivalMultiplier * simulation.chargingPower,
          chargingValuesPerHour: Array.from({ length: 24 }, (_, i) => ({
            hour: `${i}:00`,
            chargepoints: Array.from({ length: simulation.numChargePoints }, () =>
              Number((Math.random() * simulation.carConsumption).toFixed(2))
            ),
            kW: Math.random() * simulation.arrivalMultiplier,
          })),
          chargingEvents: {
            year: chargingEvents * 24 * 365,
            month: chargingEvents * 24 * 30,
            week: chargingEvents * 24 * 7,
            day: chargingEvents * 24,
          },
        };

        // TODO: remove this placeholder
        sendEvent('Message from the binary', 0.4);
        await new Promise(resolve => setTimeout(resolve, 5000));

        // TODO: remove this placeholder
        sendEvent('Wrapping up', 0.6);
        await new Promise(resolve => setTimeout(resolve, 3000));

        sendEvent('Persisting results', 0.8);
        await db.transaction(async tx => {
          try {
            await tx.insert(simulationsResultsTable).values({
              simulationId: simulation.id,
              ...results,
            });

            await tx
              .update(simulationsTable)
              .set({ status: SimulationStatus.Success })
              .where(eq(simulationsTable.id, simulation.id));
          } catch (error) {
            logger.error(`[simulation] ${error}`);
            tx.rollback();
          }
        });

        sendEvent(DONE_JOB_MESSAGE, 1);
        logger.info(`[${startSimulation.name}] (${simulation.id}) finished`);
      } catch (error) {
        logger.error(`[${startSimulation.name}] (${simulation.id}) failed`, error);

        throw error;
      }

      controller.close();
    },
  });

  return stream;
}
