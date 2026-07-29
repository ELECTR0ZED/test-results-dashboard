import { Hono } from 'hono';
import type { Config, HonoEnv } from './types';
import { createAppContext } from './services/context';
import projectsRoutes from './routes/projects';
import ingestionKeysRoutes from './routes/ingestionKeys';
import runRoutes from './routes/runs';
import specRoutes from './routes/specs';
import { errorHandler } from './middleware/errorHandler';

export function createApp(config: Config) {
	const app = new Hono<HonoEnv>().basePath(config.basePath ?? '/api');

	app.onError(errorHandler);

	app.use('*', async (c, next) => {
		c.set('ctx', createAppContext(config));

		await next();
	});

	app.route('/', projectsRoutes);
	app.route('/', ingestionKeysRoutes);
	app.route('/', runRoutes);
	app.route('/', specRoutes);


	return app;
}