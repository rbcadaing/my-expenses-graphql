import { ApolloServer, BaseContext } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { createServer } from 'http';
import { typeDefs } from './presentation/graphql/schema/typeDefs';
import { resolvers } from './presentation/graphql/resolvers';
import { prisma } from './infrastructure/database/client';

export async function createApolloServer() {
  // Create separate health check server
  const healthServer = createServer(async (req, res) => {
    if (req.url === '/' || req.url === '/health') {
      try {
        await prisma.$queryRaw`SELECT 1`;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          service: 'my-expenses-api'
        }));
      } catch (error) {
        res.writeHead(503, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'unhealthy',
          error: 'Database connection failed',
          timestamp: new Date().toISOString()
        }));
      }
    } else {
      res.writeHead(404);
      res.end('Not Found');
    }
  });

  healthServer.listen(3000);

  // Create GraphQL schema
  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });

  // Create Apollo Server with landing page
  const server = new ApolloServer<BaseContext>({
    schema,
    introspection: true,
    plugins: [
      ApolloServerPluginLandingPageLocalDefault({
        embed: true,
        includeCookies: true,
      }),
    ],
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
    context: async () => ({
      // Add your context here
    }),
  });

  console.log(`🚀 GraphQL Server (with Apollo Studio) at ${url}`);
  console.log(`💚 Health check at http://localhost:3000/health`);

  return { server, url };
}
