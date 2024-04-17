import { z } from 'zod';

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

export const CreateSimulationValidator = SimulationSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateSimulationValidator = SimulationSchema.omit({
  createdAt: true,
  updatedAt: true,
});
