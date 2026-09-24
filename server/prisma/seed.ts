import { PrismaClient, Role } from "../src/generated/prisma/client.js";
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
    username: "customer@test.com",
    password: "Customer123!",
    role: Role.CUSTOMER,
  },
  {
    username: "engineer@test.com",
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
  for (const user of users) {
    const passwordHash = await bcrypt.hash(user.password, 10);

    await prisma.user.upsert({
      where: {
        username: user.username,
      },
      update: {
        passwordHash,
        role: user.role,
        mustChangePassword: true,
      },
      create: {
        username: user.username,
        passwordHash,
        role: user.role,
        mustChangePassword: true,
      },
    });
  }

  console.log("Development users seeded successfully.");
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