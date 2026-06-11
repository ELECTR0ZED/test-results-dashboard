import type { PrismaClient } from '@electr0zed/test-results-dashboard-db';
import { getPrismaClient } from './db';

export type AppCtx = {
	env: Env
	db: PrismaClient
}

export function createAppContext(env: Env): AppCtx {
	return {
		env,
		db: getPrismaClient(env),
	};
}