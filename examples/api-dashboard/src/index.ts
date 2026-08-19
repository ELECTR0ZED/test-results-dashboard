import { createAPIWorker } from '@electr0zed/test-results-dashboard-api-dashboard';

const app = createAPIWorker({
	basePath: '/api',
	d1Binding: 'DB',
});

export default app;
