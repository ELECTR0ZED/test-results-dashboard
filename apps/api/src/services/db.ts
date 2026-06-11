import { PrismaClient } from '@electr0zed/test-results-dashboard-db';
import { PrismaD1 } from '@prisma/adapter-d1';

let prisma: PrismaClient | undefined;

export function getPrismaClient(env: Env): PrismaClient {
    if (!prisma) {
        const adapter = new PrismaD1(env.DB);
        prisma = new PrismaClient({ adapter });
    }

    return prisma;
}