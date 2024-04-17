import 'dotenv/config';

import { LibSQLDatabase, drizzle } from 'drizzle-orm/libsql';
import { faker } from '@faker-js/faker';

import { connectToDatabase } from './database';
import { simulationsResultsTable, simulationsTable } from './tables';
import { runSimulationJob } from '~/services/job';

const SEED_SIZE = 10;

const seedSimulations = async (db: LibSQLDatabase) => {
  const data = [];

  for (let i = 0; i < SEED_SIZE; i++) {
    data.push({
      numChargePoints: faker.number.int({ min: 5, max: 30 }),
      arrivalMultiplier: faker.number.float({ min: 0.2, max: 2.0 }),
      carConsumption: faker.number.int({ min: 10, max: 20 }),
      chargingPower: faker.number.int({ min: 8, max: 16 }),
    });
  }

  const result = await db
    .insert(simulationsTable)
    .values(data)
    .onConflictDoNothing()
    .returning();

  return result;
};

const seedSimulationsResults = async (db: LibSQLDatabase) => {
  const simulations = await db.select().from(simulationsTable);

  const data = [];

  for (let simulation of simulations) {
    const jobResults = runSimulationJob(simulation);

    data.push({
      simulationId: simulation.id,
      ...jobResults,
    });
  }

  const result = await db
    .insert(simulationsResultsTable)
    .values(data)
    .onConflictDoNothing()
    .returning();

  return result;
};

const main = async () => {
  const client = connectToDatabase();
  const db = drizzle(client);

  const args = process.argv.slice(2);

  if (args.includes('simulations') || args.includes('all')) {
    const simulations = await seedSimulations(db);
    console.log('[seedSimulations]', simulations, `Total: ${simulations.length}`);
  }

  if (args.includes('simulations_results') || args.includes('all')) {
    const simulationResults = await seedSimulationsResults(db);
    console.log(
      '[seedSimulationsResults]',
      simulationResults,
      `Total: ${simulationResults.length}`
    );
  }

  client.close();
};

main();
