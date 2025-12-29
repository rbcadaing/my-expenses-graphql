import 'dotenv/config';
import { createApolloServer } from './server';

async function startServer() {
  try {
    const { url } = await createApolloServer();
    console.log(`🚀 Server ready at ${url}`);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
