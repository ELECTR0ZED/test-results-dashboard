import { createApp } from './app';
import type { Config } from './types';

export function createAPIWorker(cfg: Config): ExportedHandler {

	return {
		fetch(request, env, ctx) {
			const app = createApp(cfg);

			return app.fetch(request, env, ctx);
		},
	};
}