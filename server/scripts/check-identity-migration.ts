import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { isRealEmail } from '../src/auth/identity-policy.js';

// Read-only check works before the new columns exist. Prints IDs, never credentials.
async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  try {
    const rows = await prisma.$queryRaw<
      Array<{ id: number; username: string }>
    >`
      SELECT id, username FROM users WHERE role = 'CUSTOMER'`;
    const identities = new Map<string, number>();
    const invalidIds: number[] = [];
    const collisionIds = new Set<number>();
    for (const row of rows) {
      const email = row.username.trim().toLowerCase();
      if (!isRealEmail(email)) invalidIds.push(row.id);
      const existing = identities.get(email);
      if (existing !== undefined) {
        collisionIds.add(existing);
        collisionIds.add(row.id);
      }
      identities.set(email, row.id);
    }
    if (invalidIds.length || collisionIds.size) {
      throw new Error(
        `Identity migration blocked. Invalid customer IDs: ${invalidIds.join(',') || 'none'}; normalized collision IDs: ${[...collisionIds].join(',') || 'none'}. Resolve identities explicitly before deployment.`,
      );
    }
    console.log(
      `Identity preflight passed for ${rows.length} customer identities. No data changed.`,
    );
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}
main().catch((error: unknown) => {
  console.error(
    error instanceof Error ? error.message : 'Identity preflight failed',
  );
  process.exitCode = 1;
});
