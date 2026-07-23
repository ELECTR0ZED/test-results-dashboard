import { z } from 'zod';
import { apiRequest, Options } from './core';
import { type Run, RunSchema, ApiSuccess } from '@electr0zed/test-results-dashboard-api-types';

export function getProjectRuns(
    publicId: string,
    page: number,
    limit: number,
    options: Options = {},
): Promise<ApiSuccess<Run[]>> {
    return apiRequest(`/api/projects/${publicId}/runs?page=${page}&limit=${limit}`, z.array(RunSchema), {
        method: 'GET',
        apiFetcher: options.apiFetcher,
    });
}
