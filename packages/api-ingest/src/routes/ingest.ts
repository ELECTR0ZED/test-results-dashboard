import type { IngestEventRequest, IngestEventResponse } from '@electr0zed/test-results-dashboard-core';
import { Hono } from 'hono';
import { dispatchEvent } from '../events/dispatcher';
import { IngestEventRequestSchema } from '@electr0zed/test-results-dashboard-core';
import type { HonoEnv } from '../types';

const app = new Hono<HonoEnv>();

app.post('/events', async(c) => {
	const ctx = c.get('ctx');

    const authHeader = c.req.header('authorization');
    if (!authHeader) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    if (authHeader !== `Bearer ${ctx.cfg.ingestionSecret}`) {
        return c.json({ error: 'Forbidden' }, 403);
    }

    let body: IngestEventRequest;

    try {
        body = await c.req.json<IngestEventRequest>();
    } catch (error) {
        return c.json({ error: 'Invalid JSON' }, 400);
    }

    const parseResult = IngestEventRequestSchema.safeParse(body);
    if (!parseResult.success) {
        return c.json({ error: 'Invalid request body' }, 400);
    }

    await dispatchEvent(ctx, parseResult.data.event);

    return c.json<IngestEventResponse>({ ok: true });
});

export default app;