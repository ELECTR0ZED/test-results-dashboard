import { createWorker } from '@electr0zed/test-results-dashboard-api';
import { env } from 'cloudflare:workers';

const app = createWorker({
	basePath: '/api',
	ingestionSecret: env.INGESTION_SECRET,
	d1: env.DB,
});

export default app;
