import { Hono } from 'hono';
import type { Config, HonoEnv } from './types';
import { createAppContext } from './services/context';
import projectsRoutes from './routes/projects';
import { errorHandler } from './middleware/errorHandler';

export function createApp(config: Config) {
	const app = new Hono<HonoEnv>().basePath(config.basePath ?? '/api');

	app.onError(errorHandler);

	const appCtx = createAppContext(config);

	app.use('*', async (c, next) => {
		c.set('ctx', appCtx);

		await next();
	});

	app.route('/projects', projectsRoutes);

	return app;
}