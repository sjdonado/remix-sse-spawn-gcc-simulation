import { z } from 'zod';

import { ALL_SIMULATION_STATUSES } from '~/constants/simulation';

export const SimulationResultSchema = z.object({
  totalEnergyConsumed: z.number(),
  chargingValuesPerHour: z.array(
    z.object({
      time: z.string(),
      chargepoints: z.array(z.number()),
      total: z.number(),
    })
  ),
  chargingEvents: z.object({
    year: z.number(),
    month: z.array(z.number()),
    week: z.array(z.number()),
    day: z.array(z.number()),
  }),
});

export const SimulationSchema = z.object({
  id: z.string(),
  status: z.enum(ALL_SIMULATION_STATUSES),
  numChargePoints: z.number(),
  arrivalMultiplier: z.number(),
  carConsumption: z.number(),
  chargingPower: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateSimulationSchema = z.object({
  numChargePoints: z.preprocess(
    val => Number(val),
    z.number().min(1, { message: 'Minimum number of charge points is 1' })
  ),
  arrivalMultiplier: z.preprocess(
    val => Number(val),
    z
      .number()
      .min(20, { message: 'Minimum arrival multiplier is 20' })
      .max(200, { message: 'Maximum arrival multiplier is 200' })
  ),
  carConsumption: z.preprocess(
    val => Number(val),
    z.number().min(1, { message: 'Minimum car consumption is 1' })
  ),
  chargingPower: z.preprocess(
    val => Number(val),
    z.number().min(1, { message: 'Minimum charging power is 1' })
  ),
});

export const UpdateSimulationSchema = SimulationSchema.omit({
  createdAt: true,
  updatedAt: true,
});

export const SerializedSimulationSchema = SimulationSchema.extend({
  results: z.array(SimulationResultSchema),
})
  .transform(data => ({
    ...data,
    createdAt: new Date(data.createdAt).toLocaleString('en-US'),
    updatedAt: new Date(data.updatedAt).toLocaleString('en-US'),
  }))
  .optional();

export type Simulation = z.infer<typeof SimulationSchema>;
export type SimulationResult = z.infer<typeof SimulationResultSchema>;
