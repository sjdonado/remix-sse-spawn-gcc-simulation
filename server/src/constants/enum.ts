export enum SimulationStatus {
  SCHEDULED = 'SCHEDULED',
  RUNNING = 'RUNNING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export const ALL_SIMULATION_STATUSES = Object.values(SimulationStatus) as [
  SimulationStatus,
];
