import { simultationResolvers } from './simulation.resolver';

const resolvers = {
  ...simultationResolvers,
  Query: {
    ping: () => {
      return 'pong';
    },
  },
};

export default resolvers;
