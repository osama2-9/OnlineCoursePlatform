import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
dotenv.config();
let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    log: ['query', 'info', 'warn', 'error'],
    connection: {
      pool: {
        min: 4,
        max: 15,
        idle: 100000 
      },
      connectTimeout: 30000 
    },
  })
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient()
  }
  prisma = global.prisma
}



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
