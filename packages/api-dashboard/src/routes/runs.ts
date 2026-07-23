import { Hono } from 'hono';
import type { HonoEnv } from '../types';
import { type ApiSuccess, GetProjectRunsSchema, type Run } from '@electr0zed/test-results-dashboard-api-types';
import { NotFoundError } from '../services/errors';

const app = new Hono<HonoEnv>();

app.get('/projects/:publicId/runs', async(c) => {
    const ctx = c.get('ctx');
    
    const publicId = c.req.param('publicId');
    const page = c.req.query('page');
    const limit = c.req.query('limit');
    const parsedParams = GetProjectRunsSchema.safeParse({ publicId, page, limit });
    
    if (!parsedParams.success) {
        throw parsedParams.error;
    }

    const project = await ctx.db.project.findUnique({
        where: {
            publicId,
        },
        select: {
            id: true,
        },
    });

    if (!project) {
        throw new NotFoundError(`Project with publicId "${publicId}" not found.`);
    } 
    
    const runs = await ctx.db.run.findMany({
        where: {
            projectId: project.id,
        },
        orderBy: {
            createdAt: 'desc',
        },
        skip: (parsedParams.data.page - 1) * parsedParams.data.limit,
        take: parsedParams.data.limit,
    });

    return c.json<ApiSuccess<Run[]>>({ success: true, data: runs });
});

export default app;
