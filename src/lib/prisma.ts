import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const createPrismaClient = () => {
  // 1. Create a connection pool using the standard 'pg' driver
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  // 2. Initialize the Prisma Adapter for PostgreSQL
  const adapter = new PrismaPg(pool);

  // 3. Create the client using the adapter
  return new PrismaClient({ adapter });
};

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;