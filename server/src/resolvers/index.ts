import { healthResolvers } from './health';
import { simultationResolvers } from './simulation';

const resolvers = {
  ...healthResolvers,
  ...simultationResolvers,
};

export default resolvers;
