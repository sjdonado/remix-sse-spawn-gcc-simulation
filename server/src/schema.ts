import { gql } from 'apollo-server';

export const typeDefs = gql`
  enum SimulationStatus {
    RUNNING
    COMPLETED
    FAILED
  }

  type Simulation {
    id: ID!
    numChargePoints: Int!
    arrivalMultiplier: Float!
    carConsumption: Float!
    chargingPower: Float!
    status: SimulationStatus!
  }

  type SimulationStatusResult {
    status: SimulationStatus!
  }

  type Query {
    simulations: [Simulation!]!
    simulation(id: ID!): Simulation
  }

  type Mutation {
    runSimulation(id: ID!): SimulationStatusResult!
    createSimulation(
      numChargePoints: Int!
      arrivalMultiplier: Float!
      carConsumption: Float!
      chargingPower: Float!
    ): Simulation!
    updateSimulation(
      id: ID!
      numChargePoints: Int
      arrivalMultiplier: Float
      carConsumption: Float
      chargingPower: Float
    ): Simulation!
    deleteSimulation(id: ID!): Simulation!
  }
`;
