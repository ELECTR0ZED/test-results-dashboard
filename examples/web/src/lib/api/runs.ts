import { z } from 'zod';
import { apiRequest, Options } from './core';
import { type Run, RunSchema, PaginatedApiSuccess, PaginatedApiMeta } from '@electr0zed/test-results-dashboard-api-types';

export function getProjectRuns(
    publicId: string,
    page: number,
    pageSize: number,
    options: Options = {},
): Promise<PaginatedApiSuccess<Run[]>> {
    return apiRequest<Run[], PaginatedApiMeta>(`/api/projects/${publicId}/runs?page=${page}&pageSize=${pageSize}`, z.array(RunSchema), {
        method: 'GET',
        apiFetcher: options.apiFetcher,
    });
}
