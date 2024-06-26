import { z } from 'zod';

import { ALL_SIMULATION_STATUSES } from '~/constants/simulation';

export const SimulationResultSchema = z.object({
  id: z.string(),
  totalEnergyConsumed: z.number(),
  maxPowerDemand: z.number(),
  theoreticalMaxPowerDemand: z.number(),
  concurrencyFactor: z.number(),
  chargingEvents: z.array(
    z.object({
      time: z.string(),
      chargingDemand: z.number(),
      chargeTicksRemaining: z.number(),
    })
  ),
  elapsedTime: z.number(),
  createdAt: z.date(),
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
    z
      .number()
      .min(1, { message: 'Minimum number of charge points is 1' })
      .max(100, 'Maximum number of charge points is 100')
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

export const SerializedSimulationResultSchema = SimulationResultSchema.transform(
  data => ({
    ...data,
    createdAt: data.createdAt.toLocaleString('en-US'),
  })
);

export const SerializedSimulationSchema = SimulationSchema.extend({
  results: z.array(SimulationResultSchema.extend({ createdAt: z.string() })),
})
  .transform(data => ({
    ...data,
    createdAt: new Date(data.createdAt).toLocaleString('en-US'),
    updatedAt: new Date(data.updatedAt).toLocaleString('en-US'),
    results: data.results.map(data =>
      SerializedSimulationResultSchema.parse({
        ...data,
        createdAt: new Date(data.createdAt),
      })
    ),
  }))
  .optional();

export type Simulation = z.infer<typeof SimulationSchema>;
export type SimulationResult = z.infer<typeof SimulationResultSchema>;
export type SerializedSimulation = z.infer<typeof SerializedSimulationResultSchema>;
export type SerializedSimulationResult = z.infer<typeof SerializedSimulationResultSchema>;
