import { gql } from 'apollo-server';

export const typeDefs = gql`
  type Simulation {
    id: ID!
    numChargePoints: Int!
    arrivalProbabilityMultiplier: Float!
    carConsumption: Float!
    chargingPower: Float!
  }

  type SimulationResult {
    id: ID!
    simulationId: ID!
    chargingValues: [Float!]!
    totalEnergyCharged: Float!
    chargingEvents: Int!
  }

  type Query {
    ping: String
    simulations: [Simulation]
    simulation(id: ID!): Simulation
  }
`;
