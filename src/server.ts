import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { typeDefs } from './presentation/graphql/schema/typeDefs';
import { resolvers } from './presentation/graphql/resolvers';

export async function createApolloServer() {
  // Create GraphQL schema
  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });

  // Create Apollo Server
  const server = new ApolloServer({
    schema,
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
    context: async () => {
      return {
        // Add your context here (user authentication, dataloaders, etc.)
      };
    },
  });

  return { server, url };
}
