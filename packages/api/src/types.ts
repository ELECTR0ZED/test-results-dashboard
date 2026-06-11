import type { PrismaClient } from '@electr0zed/test-results-dashboard-db';

export type Config = {
	basePath?: string;
    ingestionSecret: string;
    d1: D1Database;
};

export type AppCtx = {
    cfg: Config;
	db: PrismaClient
}

export type HonoEnv = {
	Variables: {
		ctx: AppCtx;
	};
};