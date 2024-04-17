export const runSimulationJob = async (
  simulation: {
    id: string;
    numChargePoints: number;
    arrivalMultiplier: number;
    carConsumption: number;
    chargingPower: number;
  },
  delay = 0
) => {
  await Promise.resolve(() => setTimeout(() => {}, delay));

  const chargingEvents = Math.ceil(Math.random() * simulation.numChargePoints);

  return {
    totalEnergyCharged:
      chargingEvents * simulation.arrivalMultiplier * simulation.chargingPower,
    chargingValuesPerHour: Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      chargepoints: Array.from({ length: simulation.numChargePoints }, () =>
        Number((Math.random() * simulation.carConsumption).toFixed(2))
      ),
      kW: Math.random() * simulation.arrivalMultiplier,
    })),
    chargingEvents: {
      year: chargingEvents * 24 * 365,
      month: chargingEvents * 24 * 30,
      week: chargingEvents * 24 * 7,
      day: chargingEvents * 24,
    },
  };
};
