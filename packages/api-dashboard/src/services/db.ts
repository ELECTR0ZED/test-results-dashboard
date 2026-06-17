import { PrismaClient } from '@electr0zed/test-results-dashboard-db';
import { PrismaD1 } from '@prisma/adapter-d1';

let prisma: PrismaClient | undefined;

export function getPrismaClient(db: D1Database): PrismaClient {
    if (!prisma) {
        const adapter = new PrismaD1(db);
        prisma = new PrismaClient({ adapter });
    }

    return prisma;
}