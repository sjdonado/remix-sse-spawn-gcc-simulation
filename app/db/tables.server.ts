import { randomUUID } from 'crypto';

import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

import type { SimulationResult } from '~/schemas/simulation';

import { ALL_SIMULATION_STATUSES, SimulationStatus } from '~/constants/simulation';

export const simulationsTable = sqliteTable('simulations', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => randomUUID())
    .notNull(),
  status: text('status', { enum: ALL_SIMULATION_STATUSES })
    .notNull()
    .default(SimulationStatus.Scheduled),
  numChargePoints: integer('num_charge_points').notNull(),
  arrivalMultiplier: real('arrival_probability_multiplier').notNull(),
  carConsumption: integer('car_consumption').notNull(),
  chargingPower: integer('charging_power').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
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
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});
