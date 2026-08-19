import { z } from 'zod';

export const RunSchema = z.object({
    id: z.number(),
    publicId: z.string(),
    projectId: z.number(),
    framework: z.string(),
    frameworkVersion: z.string(),
    browser: z.string(),
    browserVersion: z.string(),
    os: z.string(),

    status: z.string(),
    startedAt: z.coerce.date(),
    endedAt: z.coerce.date().nullable(),

    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date()
});

export type Run = z.infer<typeof RunSchema>;

export const GetProjectRunsSchema = z.object({
    publicId: z.uuid(),
    page: z.coerce.number().int().min(1).optional().default(1),
    pageSize: z.coerce.number().int().min(1).max(25).optional().default(10)
});

export type GetProjectRuns = z.infer<typeof GetProjectRunsSchema>;

export const GetProjectRunSchema = z.object({
    projectPublicId: z.uuid(),
    runPublicId: z.uuid(),
});

export type GetProjectRun = z.infer<typeof GetProjectRunSchema>;

export const RunStatsSchema = z.object({
    specs: z.number().nonnegative(),
    tests: z.number().nonnegative(),
    passed: z.number().nonnegative(),
    failed: z.number().nonnegative(),
    pending: z.number().nonnegative(),
    skipped: z.number().nonnegative(),
    duration: z.number().nonnegative(),
});

export type RunStats = z.infer<typeof RunStatsSchema>;

export const RunWithStatsSchema = RunSchema.extend({
    stats: RunStatsSchema,
});

export type RunWithStats = z.infer<typeof RunWithStatsSchema>;