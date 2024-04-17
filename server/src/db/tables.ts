import { randomUUID } from 'crypto';

import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { SimulationStatus, type SimulationResult } from '@types';

export const simulationsTable = sqliteTable('simulations', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => randomUUID())
    .notNull(),
  status: text('status', {
    enum: [
      SimulationStatus.Scheduled,
      SimulationStatus.Running,
      SimulationStatus.Success,
      SimulationStatus.Failed,
    ],
  })
    .notNull()
    .default(SimulationStatus.Scheduled),
  numChargePoints: integer('num_charge_points').notNull(),
  arrivalMultiplier: real('arrival_probability_multiplier').notNull(),
  carConsumption: integer('car_consumption').notNull(),
  chargingPower: integer('charging_power').notNull(),
});

export const simulationsResultsTable = sqliteTable('simulations_results', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => randomUUID())
    .notNull(),
  simulationId: text('simulation_id')
    .notNull()
    .references(() => simulationsTable.id, { onDelete: 'cascade' }),
  totalEnergyCharged: real('total_energy_charged').notNull(),
  chargingValuesPerHour: text('chargingValues', { mode: 'json' })
    .$type<SimulationResult['chargingValuesPerHour']>()
    .notNull(),
  chargingEvents: text('chargingEvents', { mode: 'json' })
    .$type<SimulationResult['chargingEvents']>()
    .notNull(),
});
