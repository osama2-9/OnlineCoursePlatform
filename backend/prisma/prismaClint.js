import dotenv from "dotenv";
dotenv.config();

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

export async function testConnection() {
  try {
    await prisma.$connect();
    console.log("Successfully connected to Aiven PostgreSQL");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1);
  }
}

testConnection();

export { prisma };
