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
    page: z.coerce.number().min(1).optional().default(1),
    pageSize: z.coerce.number().min(1).max(25).optional().default(25)
});

export type GetProjectRuns = z.infer<typeof GetProjectRunsSchema>;