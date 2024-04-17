import { healthResolvers } from './health';
import { simulationResolvers } from './simulation';

const resolvers = {
  ...healthResolvers,
  ...simulationResolvers,
};

export default resolvers;
