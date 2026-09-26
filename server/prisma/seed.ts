import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaClient, Role, SpaceType } from '../src/generated/prisma/client.js';

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5432/fitout_db?schema=public';

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

const users = [
  {
    username: 'customer@test.com',
    passwordHash: '$2b$10$K7g2S8e5J9r0t1u2v3w4x.e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t', // Password: Customer123!
    role: Role.CUSTOMER,
  },
  {
    username: 'engineer@test.com',
    passwordHash: '$2b$10$L8h3T9f6K0s1u2v3w4x5y.f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0', // Password: Engineer123!
    role: Role.ENGINEER,
  },
  {
    username: 'pm@test.com',
    passwordHash: '$2b$10$M9i4U0g7L1t2v3w4x5y6z.g7h8i9j0k1l2m3n4o5p6q7r8s9t0u', // Password: ProjectManager123!
    role: Role.PROJECT_MANAGER,
  },
  {
    username: 'owner@test.com',
    passwordHash: '$2b$10$N0j5V1h8M2u3v4w5x6y7z.h8i9j0k1l2m3n4o5p6q7r8s9t0u1', // Password: Owner123!
    role: Role.COMPANY_OWNER,
  },
  {
    username: 'admin@test.com',
    passwordHash: '$2b$10$O1k6W2i9N3v4w5x6y7z8a.i9j0k1l2m3n4o5p6q7r8s9t0u1v', // Password: Admin123!
    role: Role.ADMINISTRATOR,
  },
];

async function main() {
  console.log('Seeding Sprint 1 database...');

  const createdUsers: Record<string, any> = {};

  for (const user of users) {
    const seededUser = await prisma.user.upsert({
      where: {
        username: user.username,
      },
      update: {
        passwordHash: user.passwordHash,
        role: user.role,
        mustChangePassword: true,
      },
      create: {
        username: user.username,
        passwordHash: user.passwordHash,
        role: user.role,
        mustChangePassword: true,
      },
    });

    createdUsers[user.role] = seededUser;
  }

  console.log('Development users seeded successfully.');

  // Seed sample project using customer@test.com and engineer@test.com
  if (createdUsers[Role.CUSTOMER] && createdUsers[Role.ENGINEER]) {
    const customerUser = createdUsers[Role.CUSTOMER];
    const engineerUser = createdUsers[Role.ENGINEER];

    const existingProject = await prisma.project.findFirst({
      where: {
        title: 'Palm Hills Villa Fitout',
        clientId: customerUser.id,
      },
    });

    if (!existingProject) {
      const sampleProject = await prisma.project.create({
        data: {
          title: 'Palm Hills Villa Fitout',
          status: 'DRAFT',
          notes: 'Natural wood finishes and travertine flooring.',
          clientId: customerUser.id,
          property: {
            create: {
              propertyType: 'villa',
              areaSqm: 450.0,
              city: '6th of October',
              compound: 'Palm Hills Golf Views',
            },
          },
          spaces: {
            create: [
              { type: SpaceType.LIVING_ROOM },
              { type: SpaceType.KITCHEN },
              { type: SpaceType.MASTER_BEDROOM },
              { type: SpaceType.BATHROOM },
              { type: SpaceType.BATHROOM },
              { type: SpaceType.BATHROOM },
            ],
          },
          assignment: {
            create: {
              engineerId: engineerUser.id,
            },
          },
        },
      });
      console.log('Sample project seeded with ID:', sampleProject.id);
    }
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
