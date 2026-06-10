import { PrismaClient } from '@electr0zed/test-results-dashboard-db';
import { PrismaD1 } from '@prisma/adapter-d1';

export function getPrismaClient(env: Env): PrismaClient {
    const adapter = new PrismaD1(env.DB);

    return new PrismaClient({ adapter });
}