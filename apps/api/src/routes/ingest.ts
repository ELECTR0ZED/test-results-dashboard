import type { IngestEventRequest, IngestEventResponse } from '@electr0zed/test-results-dashboard-core';
import { Hono } from 'hono';
import { dispatchEvent } from '../events/dispatcher';
import { IngestEventRequestSchema } from '@electr0zed/test-results-dashboard-core';
import { createAppContext } from '../services/context';


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
    const parseResult = IngestEventRequestSchema.safeParse(body);
    if (!parseResult.success) {
        return c.json({ error: 'Invalid request body' }, 400);
    }

    const appContext = createAppContext(c.env);

    await dispatchEvent(appContext, body.event);

    return c.json<IngestEventResponse>({ ok: true });
});

export default app;