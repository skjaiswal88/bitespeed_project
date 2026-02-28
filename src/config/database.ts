import { PrismaClient } from "@prisma/client";

// Singleton pattern to prevent multiple Prisma Client instances
// during development with hot-reloading (nodemon)
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}

export default prisma;
