import { z } from 'zod';

export const SimulationResultSchema = z.object({
  totalEnergyCharged: z.number(),
  chargingValuesPerHour: z.array(
    z.object({
      hour: z.string(),
      chargepoints: z.array(z.number()),
      kW: z.number(),
    })
  ),
  chargingEvents: z.object({
    year: z.number(),
    month: z.number(),
    week: z.number(),
    day: z.number(),
  }),
});

export const SimulationSchema = z.object({
  id: z.string(),
  numChargePoints: z.number().min(1, { message: 'Minimum number of charge points is 1' }),
  arrivalMultiplier: z
    .number()
    .min(0.2, { message: 'Minimum arrival multiplier is 0.2' })
    .max(2.0, { message: 'Maximum arrival multiplier is 2.0' }),
  carConsumption: z.number().min(1, { message: 'Minimum car consumption is 1' }),
  chargingPower: z.number().min(1, { message: 'Minimum charging power is 1' }),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateSimulationSchema = SimulationSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateSimulationSchema = SimulationSchema.omit({
  createdAt: true,
  updatedAt: true,
});

export type Simulation = z.infer<typeof SimulationSchema>;
export type SimulationResult = z.infer<typeof SimulationResultSchema>;
