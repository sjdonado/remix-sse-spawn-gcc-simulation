import { randomUUID } from 'crypto';

import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { ALL_SIMULATION_STATUSES, SimulationStatus } from '~/constants/enum';

export const simulationsTable = sqliteTable('simulations', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => randomUUID())
    .notNull(),
  status: text('status', { enum: ALL_SIMULATION_STATUSES })
    .notNull()
    .default(SimulationStatus.SCHEDULED),
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
    .$type<Array<{ hour: string; chargepoints: Array<number>; kW: number }>>()
    .notNull(),
  chargingEvents: text('chargingValues', { mode: 'json' })
    .$type<{ year: number; month: number; week: number; day: number }>()
    .notNull(),
});
