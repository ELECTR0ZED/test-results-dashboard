import { Hono } from 'hono';
import type { Config, HonoEnv } from './types';
import { createAppContext } from './services/context';
import projectsRoutes from './routes/projects';
import ingestionKeysRoutes from './routes/ingestionKeys';
import runRoutes from './routes/runs';
import { errorHandler } from './middleware/errorHandler';

export function createApp(config: Config) {
	const app = new Hono<HonoEnv>().basePath(config.basePath ?? '/api');

	app.onError(errorHandler);

	const appCtx = createAppContext(config);

	app.use('*', async (c, next) => {
		c.set('ctx', appCtx);

		await next();
	});

	app.route('/', projectsRoutes);
	app.route('/', ingestionKeysRoutes);
	app.route('/', runRoutes);

	return app;
}