import type { IngestEventRequest, IngestEventResponse } from '@electr0zed/test-results-dashboard-core';
import { Hono } from 'hono';
import { dispatchEvent } from '../events/dispatcher';

const app = new Hono<{ Bindings: Env }>();

app.post('/ingest', async(c) => {
    const authHeader = c.req.header('authorization');
    if (!authHeader) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    if (authHeader !== `Bearer ${c.env.INGESTION_SECRET}`) {
        return c.json({ error: 'Forbidden' }, 403);
    }

    const body = await c.req.json<IngestEventRequest>();
    await dispatchEvent(c.env, body.event);

    return c.json<IngestEventResponse>({ ok: true });
});

export default app;