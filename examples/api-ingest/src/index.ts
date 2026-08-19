import { createIngestionWorker } from '@electr0zed/test-results-dashboard-api-ingest';

const app = createIngestionWorker({
	basePath: '/ingest',
	d1Binding: 'DB',
});

export default app;
