import { createApp } from './app';
import type { Config } from './types';

export function createIngestionWorker(cfg: Config): ExportedHandler {
	const app = createApp(cfg);

	return {
		fetch(request, env, ctx) {
			return app.fetch(request, env, ctx);
		},
	};
}