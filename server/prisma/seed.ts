import { PrismaClient, Role, ProjectStatus, PropertyType, SpaceType, ActivityType } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcrypt";
import "dotenv/config";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

const users = [
  {
    username: "customer1@test.com",
    password: "Customer123!",
    role: Role.CUSTOMER,
  },
  {
    username: "customer2@test.com",
    password: "Customer123!",
    role: Role.CUSTOMER,
  },
  {
    username: "engineer1@test.com",
    password: "Engineer123!",
    role: Role.ENGINEER,
  },
  {
    username: "engineer2@test.com",
    password: "Engineer123!",
    role: Role.ENGINEER,
  },
  {
    username: "pm@test.com",
    password: "ProjectManager123!",
    role: Role.PROJECT_MANAGER,
  },
  {
    username: "owner@test.com",
    password: "Owner123!",
    role: Role.COMPANY_OWNER,
  },
  {
    username: "admin@test.com",
    password: "Admin123!",
    role: Role.ADMINISTRATOR,
  },
];

async function main() {
  // -------------------------
  // 1. Seed users
  // -------------------------

  const createdUsers = new Map<string, number>();

  for (const user of users) {
    const passwordHash = await bcrypt.hash(user.password, 10);

    const mustChangePassword = user.role === Role.CUSTOMER ? false : true;

    const createdUser = await prisma.user.upsert({
      where: {
        username: user.username,
      },
      update: {
        passwordHash,
        role: user.role,
        mustChangePassword,
      },
      create: {
        username: user.username,
        passwordHash,
        role: user.role,
        mustChangePassword,
      },
    });

    createdUsers.set(user.username, createdUser.id);
  }

  const customer1Id = createdUsers.get("customer1@test.com")!;
  const customer2Id = createdUsers.get("customer2@test.com")!;
  const engineer1Id = createdUsers.get("engineer1@test.com")!;
  const engineer2Id = createdUsers.get("engineer2@test.com")!;
  const pmId = createdUsers.get("pm@test.com")!;

  // -------------------------
  // 2. Seed projects
  // -------------------------

  const project1 = await prisma.project.create({
    data: {
      title: "Customer 1 Living Space",
      status: ProjectStatus.DRAFT,
      notes: "Development test project owned by Customer 1.",
      clientId: customer1Id,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      title: "Customer 2 Villa",
      status: ProjectStatus.SUBMITTED,
      notes: "Development test project owned by Customer 2.",
      clientId: customer2Id,
    },
  });

  // -------------------------
  // 3. Seed properties
  // -------------------------

  await prisma.property.create({
    data: {
      projectId: project1.id,
      propertyType: PropertyType.APARTMENT,
      areaSqm: 150,
      city: "Cairo",
      compound: "Test Compound 1",
    },
  });

  await prisma.property.create({
    data: {
      projectId: project2.id,
      propertyType: PropertyType.VILLA,
      areaSqm: 300,
      city: "Cairo",
      compound: "Test Compound 2",
    },
  });

  // -------------------------
  // 4. Seed spaces
  // -------------------------

  await prisma.space.createMany({
    data: [
      {
        projectId: project1.id,
        type: SpaceType.LIVING,
      },
      {
        projectId: project1.id,
        type: SpaceType.KITCHEN,
      },
      {
        projectId: project1.id,
        type: SpaceType.MASTER_BEDROOM,
      },
      {
        projectId: project2.id,
        type: SpaceType.LIVING,
      },
      {
        projectId: project2.id,
        type: SpaceType.BATHROOM,
      },
    ],
  });

  // -------------------------
  // 5. Seed engineer assignments
  // -------------------------

  await prisma.projectAssignment.create({
    data: {
      projectId: project1.id,
      engineerId: engineer1Id,
    },
  });

  await prisma.projectAssignment.create({
    data: {
      projectId: project2.id,
      engineerId: engineer2Id,
    },
  });

  // -------------------------
  // 6. Seed project activities
  // -------------------------

  await prisma.projectActivity.createMany({
    data: [
      {
        projectId: project1.id,
        actorId: customer1Id,
        type: ActivityType.PROJECT_CREATED,
        metadata: { title: project1.title },
      },
      {
        projectId: project2.id,
        actorId: customer2Id,
        type: ActivityType.PROJECT_CREATED,
        metadata: { title: project2.title },
      },
      {
        projectId: project2.id,
        actorId: customer2Id,
        type: ActivityType.PROJECT_SUBMITTED,
      },
      {
        projectId: project1.id,
        actorId: pmId,
        type: ActivityType.ENGINEER_ASSIGNED,
        metadata: { engineerId: engineer1Id },
      },
      {
        projectId: project2.id,
        actorId: pmId,
        type: ActivityType.ENGINEER_ASSIGNED,
        metadata: { engineerId: engineer2Id },
      },
    ],
  });

  console.log("Development database seeded successfully.");
  console.log("Users: 7");
  console.log("Projects: 2");
  console.log("Properties: 2");
  console.log("Spaces: 5");
  console.log("Assignments: 2");
  console.log("Activities: 5");
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
