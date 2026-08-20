import { Hono } from 'hono';
import type { HonoEnv } from '../types';
import { GetProjectRunsSchema, type PaginatedApiSuccess, GetProjectRunSchema, ApiSuccess, RunWithStats } from '@electr0zed/test-results-dashboard-api-types';
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

        const totalPages = Math.max(
            1,
            Math.ceil(totalRuns / parsedParams.data.pageSize),
        );

        const calculatedPage = Math.min(
            parsedParams.data.page,
            totalPages,
        );
        
        const runs = await ctx.db.run.findMany({
            where: {
                projectId: project.id,
            },
            orderBy: {
                createdAt: 'desc',
            },
            skip: (calculatedPage - 1) * parsedParams.data.pageSize,
            take: parsedParams.data.pageSize,
        });

        const stats = await ctx.db.spec.groupBy({
            by: ['runId'],
            where: {
                runId: {
                    in: runs.map((run) => run.id),
                },
            },
            _sum: {
                tests: true,
                passed: true,
                failed: true,
                pending: true,
                skipped: true,
                duration: true,
            },
            _count: {
                _all: true,
            },
        });

        const statsByRunId = new Map(
            stats.map((stat) => [
                stat.runId,
                {
                    specs: stat._count._all,
                    tests: stat._sum.tests ?? 0,
                    passed: stat._sum.passed ?? 0,
                    failed: stat._sum.failed ?? 0,
                    pending: stat._sum.pending ?? 0,
                    skipped: stat._sum.skipped ?? 0,
                    duration: stat._sum.duration ?? 0,
                },
            ]),
        );

        const results = runs.map((run) => ({
            ...run,
            stats: statsByRunId.get(run.id) ?? {
                specs: 0,
                tests: 0,
                passed: 0,
                failed: 0,
                pending: 0,
                skipped: 0,
                duration: 0,
            },
        }));

        return c.json<PaginatedApiSuccess<RunWithStats[]>>({
            success: true,
            data: results,
            meta: {
                pagination: {
                    page: calculatedPage,
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

        const stats = await ctx.db.spec.aggregate({
            where: {
                runId: run.id,
            },
            _sum: {
                tests: true,
                passed: true,
                failed: true,
                pending: true,
                skipped: true,
                duration: true,
            },
            _count: {
                _all: true,
            },
        });

        return c.json<ApiSuccess<RunWithStats>>({
            success: true,
            data: {
                ...run,
                stats: {
                    specs: stats._count._all,
                    tests: stats._sum.tests ?? 0,
                    passed: stats._sum.passed ?? 0,
                    failed: stats._sum.failed ?? 0,
                    pending: stats._sum.pending ?? 0,
                    skipped: stats._sum.skipped ?? 0,
                    duration: stats._sum.duration ?? 0,
                },
            },
        });
    });

	return app;
}
