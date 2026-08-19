import { Hono } from 'hono';
import type { HonoEnv } from '../types';
import { GetProjectRunsSpecsSchema, type PaginatedApiSuccess, Spec } from '@electr0zed/test-results-dashboard-api-types';
import { NotFoundError } from '../services/errors';

export function createSpecRoutes<
	TD1Binding extends string,
>() {
    const app = new Hono<HonoEnv<TD1Binding>>();

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
        
        const run = await ctx.db.run.findFirst({
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

        const totalSpecs = await ctx.db.spec.count({
            where: {
                runId: run.id,
            },
        });

        const totalPages = Math.max(
            1,
            Math.ceil(totalSpecs / parsedParams.data.pageSize),
        );

        const calculatedPage = Math.min(
            parsedParams.data.page,
            totalPages,
        );

        const specs = await ctx.db.spec.findMany({
            where: {
                runId: run.id,
            },
            orderBy: {
                startedAt: 'asc',
            },
            skip: (calculatedPage - 1) * parsedParams.data.pageSize,
            take: parsedParams.data.pageSize,
        });

        return c.json<PaginatedApiSuccess<Spec[]>>({
            success: true,
            data: specs,
            meta: {
                pagination: {
                    page: calculatedPage,
                    pageSize: parsedParams.data.pageSize,
                    total: totalSpecs,
                    totalPages,
                }
            }
        });
    });

	return app;
}
