import 'dotenv/config';
import app from './app';
import prisma from './lib/prisma';

const PORT = Number(process.env.PORT ?? 3000);

async function main(): Promise<void> {
  // Verify database connectivity before accepting traffic
  await prisma.$connect();
  console.log('✓ Database connected');

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✓ API listening on http://0.0.0.0:${PORT}`);
  });
}

main().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
