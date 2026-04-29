import type { IngestEventRequest, IngestEventResponse } from '@electr0zed/test-results-dashboard-core';
import { Hono } from 'hono';

const app = new Hono<{ Bindings: Env }>();

app.post('/ingest', async(c) => {
    const body = await c.req.json() as IngestEventRequest;
    console.log('Received event:', body);

    return c.json({ ok: true } as IngestEventResponse);

});

export default app;