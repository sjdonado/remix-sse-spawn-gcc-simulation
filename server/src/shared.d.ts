export type SimulationResult = {
  totalEnergyCharged: number;
  chargingValuesPerHour: Array<{
    hour: string;
    chargepoints: Array<number>;
    kW: number;
  }>;
  chargingEvents: {
    year: number;
    month: number;
    week: number;
    day: number;
  };
};
