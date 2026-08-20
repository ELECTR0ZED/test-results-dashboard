import { Hono } from 'hono';
import type { HonoEnv } from '../types';
import { FullSpec, GetProjectRunsSpecsSchema, type PaginatedApiSuccess, Spec } from '@electr0zed/test-results-dashboard-api-types';
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

        const specIds = specs.map((spec) => spec.id);

        const specTests = await ctx.db.specTest.findMany({
            where: {
                specId: {
                    in: specIds,
                },
            },
            orderBy: {
                id: 'asc',
            },
        });

        const titleParts = await ctx.db.specTestTitlePart.findMany({
            where: {
                specTest: {
                    is: {
                        specId: {
                            in: specIds,
                        },
                    },
                },
            },
            orderBy: [
                {
                    specTestId: 'asc',
                },
                {
                    position: 'asc',
                },
            ],
        });

        const attempts = await ctx.db.specTestAttempt.findMany({
            where: {
                specTest: {
                    is: {
                        specId: {
                            in: specIds,
                        },
                    },
                },
            },
            orderBy: [
                {
                    specTestId: 'asc',
                },
                {
                    id: 'asc',
                },
            ],
        });

        const titlePartsByTest = new Map<number, typeof titleParts>();
        const attemptsByTest = new Map<number, typeof attempts>();

        for (const titlePart of titleParts) {
            addToGroup(titlePartsByTest, titlePart.specTestId, titlePart);
        }

        for (const attempt of attempts) {
            addToGroup(attemptsByTest, attempt.specTestId, attempt);
        }

        const testsBySpec = new Map<
            number,
            Array<
                (typeof specTests)[number] & {
                    titleParts: typeof titleParts;
                    specTestAttempts: typeof attempts;
                }
            >
        >();

        for (const test of specTests) {
            addToGroup(testsBySpec, test.specId, {
                ...test,
                titleParts: titlePartsByTest.get(test.id) ?? [],
                specTestAttempts: attemptsByTest.get(test.id) ?? [],
            });
        }

        const fullSpecs = specs.map((spec) => ({
            ...spec,
            specTests: testsBySpec.get(spec.id) ?? [],
        }));

        return c.json<PaginatedApiSuccess<FullSpec[]>>({
            success: true,
            data: fullSpecs,
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

function addToGroup<T>(
	groups: Map<number, T[]>,
	key: number,
	value: T,
) {
	const existing = groups.get(key);

	if (existing) {
		existing.push(value);
	} else {
		groups.set(key, [value]);
	}
}