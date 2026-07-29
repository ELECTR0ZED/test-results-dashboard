import { Hono } from 'hono';
import type { HonoEnv } from '../types';
import { GetProjectRunsSpecsSchema, type PaginatedApiSuccess, Spec } from '@electr0zed/test-results-dashboard-api-types';
import { NotFoundError } from '../services/errors';

const app = new Hono<HonoEnv>();

app.get('/projects/:projectPublicId/runs/:runPublicId/specs', async(c) => {
    const ctx = c.get('ctx');
    
    const projectPublicId = c.req.param('projectPublicId');
    const runPublicId = c.req.param('runPublicId');
    const page = c.req.query('page');
    const pageSize = c.req.query('pageSize');
    const parsedParams = GetProjectRunsSpecsSchema.safeParse({ projectPublicId, runPublicId, page, pageSize });
    
    if (!parsedParams.success) {
        throw parsedParams.error;
    }

    const project = await ctx.db.project.findUnique({
        where: {
            publicId: parsedParams.data.projectPublicId,
        },
        select: {
            id: true,
        },
    });

    if (!project) {
        throw new NotFoundError(`Project with publicId "${parsedParams.data.projectPublicId}" not found.`);
    }
    
    const run = await ctx.db.run.findUnique({
        where: {
            publicId: parsedParams.data.runPublicId,
            projectId: project.id,
        },
        select: {
            id: true,
        },
    });

    if (!run) {
        throw new NotFoundError(`Run with publicId "${parsedParams.data.runPublicId}" not found.`);
    }

    const specs = await ctx.db.spec.findMany({
        where: {
            runId: run.id,
        },
        orderBy: {
            startedAt: 'asc',
        },
        skip: (parsedParams.data.page - 1) * parsedParams.data.pageSize,
        take: parsedParams.data.pageSize,
    });

    const totalSpecs = await ctx.db.spec.count({
        where: {
            runId: run.id,
        },
    });
    const totalPages = totalSpecs === 0 ? 0 : Math.ceil(totalSpecs / parsedParams.data.pageSize);

    return c.json<PaginatedApiSuccess<Spec[]>>({
        success: true,
        data: specs,
        meta: {
            pagination: {
                page: parsedParams.data.page,
                pageSize: parsedParams.data.pageSize,
                total: totalSpecs,
                totalPages,
            }
        }
    });
});

export default app;
