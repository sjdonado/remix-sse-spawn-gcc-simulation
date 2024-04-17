import { simultationResolvers } from './simulation';

const resolvers = {
  ...simultationResolvers,
  Query: {
    ping: () => {
      return 'pong';
    },
  },
};

export default resolvers;
