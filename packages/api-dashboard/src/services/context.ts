import { getPrismaClient } from './db';
import type { AppCtx, Config, HonoEnv } from '../types';
import { Context } from 'hono';

export function createAppContext<const TD1Binding extends string>(c: Context<HonoEnv<TD1Binding>>, cfg: Config<TD1Binding>): AppCtx<TD1Binding> {
	return {
        cfg: cfg,
		db: getPrismaClient(c.env[cfg.d1Binding]),
	};
}