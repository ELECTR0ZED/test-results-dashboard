import { Hono } from 'hono';
import type { HonoEnv } from '../types';
import { GetProjectRunsSchema, type Run, type PaginatedApiSuccess } from '@electr0zed/test-results-dashboard-api-types';
import { NotFoundError } from '../services/errors';

const app = new Hono<HonoEnv>();

app.get('/projects/:publicId/runs', async(c) => {
    const ctx = c.get('ctx');
    
    const publicId = c.req.param('publicId');
    const page = c.req.query('page');
    const pageSize = c.req.query('pageSize');
    const parsedParams = GetProjectRunsSchema.safeParse({ publicId, page, pageSize });
    
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

    const totalRuns = await ctx.db.run.count({
        where: {
            projectId: project.id,
        },
    });
    
    const runs = await ctx.db.run.findMany({
        where: {
            projectId: project.id,
        },
        orderBy: {
            createdAt: 'desc',
        },
        skip: (parsedParams.data.page - 1) * parsedParams.data.pageSize,
        take: parsedParams.data.pageSize,
    });

    const totalPages = totalRuns === 0 ? 0 : Math.ceil(totalRuns / parsedParams.data.pageSize);

    return c.json<PaginatedApiSuccess<Run[]>>({
        success: true,
        data: runs,
        meta: {
            pagination: {
                page: parsedParams.data.page,
                pageSize: parsedParams.data.pageSize,
                total: totalRuns,
                totalPages,
            }
        }
    });
});

export default app;
