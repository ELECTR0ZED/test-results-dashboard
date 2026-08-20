import { z } from 'zod';
import { apiRequest, Options } from './core';
import { type Run, RunSchema, PaginatedApiSuccess, PaginatedApiMeta, ApiSuccess, RunWithStats, RunWithStatsSchema } from '@electr0zed/test-results-dashboard-api-types';

export function getProjectRuns(
    publicId: string,
    page: number,
    pageSize: number,
    options: Options = {},
): Promise<PaginatedApiSuccess<RunWithStats[]>> {
    return apiRequest<RunWithStats[], PaginatedApiMeta>(`/api/projects/${publicId}/runs?page=${page}&pageSize=${pageSize}`, z.array(RunWithStatsSchema), {
        method: 'GET',
        apiFetcher: options.apiFetcher,
    });
}

export function getProjectRun(
    publicId: string,
    runId: string,
    options: Options = {},
): Promise<ApiSuccess<Run>> {
    return apiRequest<Run>(`/api/projects/${publicId}/runs/${runId}`, RunSchema, {
        method: 'GET',
        apiFetcher: options.apiFetcher,
    });
}
