import { Hono } from 'hono';
import type { HonoEnv } from '../types';
import { GetProjectRunsSchema, type Run, type PaginatedApiSuccess, GetProjectRunSchema, ApiSuccess } from '@electr0zed/test-results-dashboard-api-types';
import { NotFoundError } from '../services/errors';

export function createRunRoutes<
	TD1Binding extends string,
>() {
    const app = new Hono<HonoEnv<TD1Binding>>();

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
                publicId: parsedParams.data.publicId,
            },
            select: {
                id: true,
            },
        });

        if (!project) {
            throw new NotFoundError(`Project with publicId "${parsedParams.data.publicId}" not found.`);
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

    app.get('/projects/:publicId/runs/:runId', async(c) => {
        const ctx = c.get('ctx');
        
        const projectPublicId = c.req.param('publicId');
        const runPublicId = c.req.param('runId');
        const parsedParams = GetProjectRunSchema.safeParse({ projectPublicId, runPublicId });
        
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
        
        const run = await ctx.db.run.findFirst({
            where: {
                projectId: project.id,
                publicId: parsedParams.data.runPublicId,
            },
        });

        if (!run) {
            throw new NotFoundError(`Run with publicId "${parsedParams.data.runPublicId}" not found.`);
        }

        return c.json<ApiSuccess<Run>>({
            success: true,
            data: run,
        });
    });

	return app;
}
