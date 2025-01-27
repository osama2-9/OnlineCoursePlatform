import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Test the database connection
async function testConnection() {
  try {
    await prisma.$connect();
    console.log("Successfully connected to the database");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1);
  }
}

testConnection();

export { prisma };
