import { Hono } from 'hono';

import ingestRoute from './routes/ingest';

const app = new Hono<{ Bindings: Env }>().basePath('/api');

app.route('/', ingestRoute);

export default app;
