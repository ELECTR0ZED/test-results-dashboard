import { Hono } from 'hono';
import type { Config, HonoEnv } from './types';
import ingestRoute from './routes/ingest';
import { createAppContext } from './services/context';

export function createApp(config: Config) {
	const app = new Hono<HonoEnv>().basePath(config.basePath ?? '/api');

	const appCtx = createAppContext(config);

	app.use('*', async (c, next) => {
		c.set('ctx', appCtx);

		await next();
	});

	app.route('/', ingestRoute);

	return app;
}