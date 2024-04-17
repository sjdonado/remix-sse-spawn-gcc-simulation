import { readFileSync } from 'fs';
import { ApolloServer } from 'apollo-server';

import resolvers from './resolvers/index';

import { connectToDatabase } from './db/database';

connectToDatabase();

const server = new ApolloServer({
  typeDefs: readFileSync('./src/schema.graphql', 'utf-8'),
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
