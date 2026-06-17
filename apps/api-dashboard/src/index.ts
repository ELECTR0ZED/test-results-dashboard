import { createAPIWorker } from '@electr0zed/test-results-dashboard-api-dashboard';
import { env } from 'cloudflare:workers';

const app = createAPIWorker({
	basePath: '/ingest',
	ingestionSecret: 'temp',
	d1: env.DB,
});

export default app;
