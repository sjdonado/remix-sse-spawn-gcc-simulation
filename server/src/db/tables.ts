import { randomUUID } from 'crypto';

import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { SimulationStatus } from '~/constants/enum';

export const simulationsTable = sqliteTable('simulations', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => randomUUID())
    .notNull(),
  numChargePoints: integer('num_charge_points').notNull(),
  arrivalProbabilityMultiplier: real('arrival_probability_multiplier').notNull(),
  carConsumption: real('car_consumption').notNull(),
  chargingPower: real('charging_power').notNull(),
});

export const simulationsOutputTable = sqliteTable('simulations_results', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => randomUUID())
    .notNull(),
  status: text('status')
    .notNull()
    .$type<
      | SimulationStatus.SCHEDULED
      | SimulationStatus.RUNNING
      | SimulationStatus.SUCCESS
      | SimulationStatus.FAILED
    >()
    .default(SimulationStatus.SCHEDULED),
  simulation_id: text('simulation_id')
    .notNull()
    .references(() => simulationsTable.id, { onDelete: 'cascade' }),
  charge_point_id: text('charge_point_id').notNull(),
  chargingValues: text('charging_values').notNull(),
  totalEnergyCharged: real('total_energy_charged').notNull(),
  chargingEvents: integer('charging_events').notNull(),
});
