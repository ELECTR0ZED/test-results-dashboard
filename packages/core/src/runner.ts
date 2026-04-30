import { z } from 'zod';

export const RunnerNameSchema = z.enum(['cypress', 'playwright']);
export type RunnerName = z.infer<typeof RunnerNameSchema>;

export const TestStatusSchema = z.enum([
    'passed',
    'failed',
    'pending',
    'skipped',
    'timedOut',
    'interrupted',
]);
export type TestStatus = z.infer<typeof TestStatusSchema>;
