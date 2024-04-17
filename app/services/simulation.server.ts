import path from 'path';
import { spawn } from 'child_process';
import readline from 'readline';

import { eq } from 'drizzle-orm';

import { db } from '~/db/database.server';
import { simulationsResultsTable, simulationsTable } from '~/db/tables.server';
import type { Simulation, SimulationResult } from '~/schemas/simulation';

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

        const pythonCommand = '/usr/bin/python3';
        const pythonScriptPath = path.resolve('./app/bin/simulation.py');
        const pythonArgs = [
          '--num_chargepoints',
          simulation.numChargePoints.toString(),
          '--charging_power',
          simulation.chargingPower.toString(),
          '--car_consumption',
          simulation.carConsumption.toString(),
        ];

        const pythonProcess = spawn(pythonCommand, [pythonScriptPath, ...pythonArgs]);

        await new Promise((resolve, reject) => {
          const chargingValuesPerHour: SimulationResult['chargingValuesPerHour'] = [];

          const rl = readline.createInterface({ input: pythonProcess.stdout });

          rl.on('line', async line => {
            const [type, object] = line.split('|');
            const parsedObject = JSON.parse(object);

            if (type === 'CHARGING_VALUES_PER_HOUR') {
              sendEvent(`Calculating charging values for hour ${parsedObject.time}`, 0.6);
              chargingValuesPerHour.push(parsedObject);
            }

            if (type === 'SUMMARY') {
              sendEvent('Calculating summary', 0.8);

              console.log('chargingValuesPerHour', chargingValuesPerHour.length);
              await db.transaction(async tx => {
                try {
                  await tx.insert(simulationsResultsTable).values({
                    simulationId: simulation.id,
                    totalEnergyConsumed: parsedObject['total_energy_consumed'],
                    chargingValuesPerHour: chargingValuesPerHour,
                    chargingEvents: {
                      year: parsedObject['charging_events']['per_year'],
                      month: parsedObject['charging_events']['per_month'],
                      week: parsedObject['charging_events']['per_week'],
                      day: parsedObject['charging_events']['per_day'],
                    },
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
