import { PrismaClient } from '@prisma/client';

// Singleton pattern — prevents multiple Prisma Client instances in development
// (hot-reloading would otherwise exhaust the connection pool).
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

const prisma: PrismaClient =
  global.__prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}

export default prisma;
