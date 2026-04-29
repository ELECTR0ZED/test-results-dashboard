import { Hono } from 'hono';

const app = new Hono<{ Bindings: Env }>();

app.post('/ingest', async(c) => {
    return c.text('Hello, World!');
});

export default app;