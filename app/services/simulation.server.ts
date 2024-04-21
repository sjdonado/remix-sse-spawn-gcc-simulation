import path from 'path';
import { spawn } from 'child_process';
import readline from 'readline';

import { eq } from 'drizzle-orm';

import { db } from '~/db/database.server';
import { simulationsResultsTable, simulationsTable } from '~/db/tables.server';
import type { Simulation, SimulationResult } from '~/schemas/simulation';

import {
  SimulationStatus,
  DONE_JOB_MESSAGE,
  RESULTS_MESSAGE,
} from '~/constants/simulation';
import { logger } from '~/utils/logger.server';

export const scheduleSimulation = async (
  numChargePoints: Simulation['numChargePoints'],
  arrivalMultiplier: Simulation['arrivalMultiplier'],
  carConsumption: Simulation['carConsumption'],
  chargingPower: Simulation['chargingPower']
) => {
  const [existingSimulation] = await db
    .select()
    .from(simulationsTable)
    .where(
      and(
        eq(simulationsTable.numChargePoints, numChargePoints),
        eq(simulationsTable.arrivalMultiplier, arrivalMultiplier),
        eq(simulationsTable.carConsumption, carConsumption),
        eq(simulationsTable.chargingPower, chargingPower)
      )
    )
    .limit(1);

  if (existingSimulation) {
    await db
      .update(simulationsTable)
      .set({ status: SimulationStatus.Scheduled })
      .where(eq(simulationsTable.id, existingSimulation.id));

    return existingSimulation.id;
  }

  const [newSimulation] = await db
    .insert(simulationsTable)
    .values({
      numChargePoints,
      arrivalMultiplier,
      carConsumption,
      chargingPower,
    })
    .returning();

  return newSimulation.id;
};

export async function startSimulation(simulation: Simulation) {
  const encoder = new TextEncoder();

  const encodeMessage = (
    message: string,
    percentage: number,
    time = Date.now(),
    payload?: string
  ) =>
    encoder.encode(
      `data: ${time}|${(percentage * 100).toFixed(1)}|${message}|${payload}\n\n`
    );

  // check if simulation is not running or completed
  if ([SimulationStatus.Running, SimulationStatus.Success].includes(simulation.status)) {
    logger.error(
      `[${startSimulation.name}] (${simulation.id}) already running or completed`
    );

    return encodeMessage(DONE_JOB_MESSAGE, 1);
  }

  const stream = new ReadableStream({
    async start(controller) {
      let lastPercentage = 0;

      const sendEvent = (message: string, percentage?: number, payload?: string) => {
        controller.enqueue(
          encodeMessage(message, percentage ?? lastPercentage, Date.now(), payload)
        );
        lastPercentage = percentage ?? lastPercentage;
      };

      try {
        sendEvent('Starting simulation...');

        const pythonCommand = '/usr/bin/python3';
        const pythonScriptPath = path.resolve('./app/bin/simulation.py');
        const pythonArgs = [
          '--num_chargepoints',
          simulation.numChargePoints.toString(),
          '--charging_power',
          simulation.chargingPower.toString(),
          '--car_consumption',
          simulation.carConsumption.toString(),
          '--arrival_multiplier',
          simulation.arrivalMultiplier.toString(),
        ];

        const pythonProcess = spawn(pythonCommand, [pythonScriptPath, ...pythonArgs]);

        await new Promise((resolve, reject) => {
          const chargingEvents: SimulationResult['chargingEvents'] = [];

          const rl = readline.createInterface({ input: pythonProcess.stdout });

          rl.on('line', async line => {
            const [type, object] = line.split('|');
            const parsedObject = JSON.parse(object);

            if (type === 'PROGRESS_STATUS') {
              sendEvent(
                `Simulating charging events for ${parsedObject.time}`,
                parsedObject.current / parsedObject.total
              );
            }

            if (type === 'CHARGING_EVENT') {
              sendEvent(`Collecting charging event for hour ${parsedObject.time}`);
              chargingEvents.push({
                time: parsedObject.time,
                chargingDemand: parsedObject['charging_demand'],
                chargeTicksRemaining: parsedObject['charge_ticks_remaining'],
              });
            }

            if (type === 'SUMMARY') {
              sendEvent('Collecting summary');

              await db.transaction(async tx => {
                try {
                  const results = await tx
                    .insert(simulationsResultsTable)
                    .values({
                      simulationId: simulation.id,
                      totalEnergyConsumed: parsedObject['total_energy_consumed'],
                      maxPowerDemand: parsedObject['max_power_demand'],
                      theoreticalMaxPowerDemand:
                        parsedObject['theoretical_max_power_demand'],
                      concurrencyFactor: parsedObject['concurrency_factor'],
                      chargingEvents: chargingEvents,
                    })
                    .returning();

                  sendEvent(RESULTS_MESSAGE, lastPercentage, JSON.stringify(results));

                  await tx
                    .update(simulationsTable)
                    .set({ status: SimulationStatus.Success })
                    .where(eq(simulationsTable.id, simulation.id));
                } catch (error) {
                  logger.error(`[simulation] ${error}`);
                  tx.rollback();
                }
              });

              resolve(1);
            }
          });

          pythonProcess.stderr.on('data', data => {
            reject(data);
          });

          pythonProcess.on('close', code => {
            logger.info(
              `[${startSimulation.name}] (${simulation.id}) python script exited with code ${code}`
            );
          });
        });

        sendEvent(DONE_JOB_MESSAGE);
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
