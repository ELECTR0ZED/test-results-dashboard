import { createIngestionWorker } from '@electr0zed/test-results-dashboard-api-ingest';
import { env } from 'cloudflare:workers';

const app = createIngestionWorker({
	basePath: '/ingest',
	ingestionSecret: env.INGESTION_SECRET,
	d1: env.DB,
});

export default app;
