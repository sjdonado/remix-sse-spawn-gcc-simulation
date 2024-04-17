export enum SimulationStatus {
  Scheduled = 'scheduled',
  Running = 'running',
  Success = 'success',
  Failed = 'failed',
}

export const ALL_SIMULATION_STATUSES = Object.values(SimulationStatus) as [
  SimulationStatus
];

export const DONE_JOB_MESSAGE = 'Done!';
