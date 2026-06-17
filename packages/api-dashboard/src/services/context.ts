import { getPrismaClient } from './db';
import type { AppCtx, Config } from '../types';

export function createAppContext(cfg: Config): AppCtx {
	return {
        cfg: cfg,
		db: getPrismaClient(cfg.d1),
	};
}