import {PrismaClient} from '@prisma/client';
import {PrismaPg} from '@prisma/adapter-pg';

// The adapter uses the verified JS/WASM query compiler and a native PostgreSQL connection.
export function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL is required.');
  return new PrismaClient({adapter: new PrismaPg({connectionString})});
}
