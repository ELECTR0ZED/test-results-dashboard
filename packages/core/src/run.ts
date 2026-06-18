import { z } from 'zod';
import { ArtifactSchema } from './artifact.js';
import { RunnerNameSchema, TestStatusSchema } from './runner.js';

export const RunMetadataSchema = z.object({
    id: z.string(),
    runner: RunnerNameSchema,
    projectId: z.string(),
    branch: z.string().optional(),
    commitSha: z.string().optional(),
    commitMessage: z.string().optional(),
    environment: z.string().optional(),
    machineId: z.string().optional(),
    shardId: z.string().optional(),
    group: z.string().optional(),
    parallel: z.boolean().optional(),
});

export type RunMetadata = z.infer<typeof RunMetadataSchema>;

export const RunInfoSchema = RunMetadataSchema.extend({
    startedAt: z.string().optional(),
    endedAt: z.string().optional(),
    browserName: z.string().optional(),
    browserVersion: z.string().optional(),
    osName: z.string().optional(),
    osVersion: z.string().optional(),
    runnerVersion: z.string().optional(),
});

export type RunInfo = z.infer<typeof RunInfoSchema>;

export const SpecInfoSchema = z.object({
    name: z.string(),
    relative: z.string().optional(),
    absolute: z.string().optional(),
    startedAt: z.string(),
    endedAt: z.string(),
    duration: z.number().optional(),
    tests: z.number(),
    passes: z.number(),
    failures: z.number(),
    pending: z.number(),
    skipped: z.number(),
    suites: z.number().optional(),
    video: z.string().nullable().optional(),
    screenshots: ArtifactSchema.array().optional(),
});

export type SpecInfo = z.infer<typeof SpecInfoSchema>;

export const TestAttemptSchema = z.object({
    state: z.union([TestStatusSchema, z.string()]),
});

export type TestAttempt = z.infer<typeof TestAttemptSchema>;

export const TestInfoSchema = z.object({
    title: z.string().array(),
    status: z.union([TestStatusSchema, z.string()]),
    displayError: z.string().optional(),
    attempts: TestAttemptSchema.array().optional(),
    duration: z.number().optional(),
    retry: z.number().optional(),
    location: z.object({
        file: z.string().optional(),
        line: z.number().optional(),
        column: z.number().optional(),
    }).optional(),
    stdout: z.string().array().optional(),
    stderr: z.string().array().optional(),
    artifacts: ArtifactSchema.array().optional(),
});

export type TestInfo = z.infer<typeof TestInfoSchema>;