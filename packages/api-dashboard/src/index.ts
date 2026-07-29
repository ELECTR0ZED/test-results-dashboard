import { createApp } from './app';
import type { Config, HonoEnv } from './types';

export function createAPIWorker<const TD1Binding extends string>(cfg: Config<TD1Binding>): ExportedHandler<HonoEnv<TD1Binding>['Bindings']> {

	return {
		fetch(request, env, ctx) {
			const app = createApp(cfg);

			return app.fetch(request, env, ctx);
		},
	};
}