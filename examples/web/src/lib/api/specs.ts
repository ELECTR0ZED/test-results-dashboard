import { z } from 'zod';
import { apiRequest, Options } from './core';
import { type Spec, PaginatedApiSuccess, PaginatedApiMeta, SpecSchema } from '@electr0zed/test-results-dashboard-api-types';

export function getRunSpecs(
    projectPublicId: string,
    runPublicId: string,
    page: number,
    pageSize: number,
    options: Options = {},
): Promise<PaginatedApiSuccess<Spec[]>> {
    return apiRequest<Spec[], PaginatedApiMeta>(`/api/projects/${projectPublicId}/runs/${runPublicId}/specs?page=${page}&pageSize=${pageSize}`, z.array(SpecSchema), {
        method: 'GET',
        apiFetcher: options.apiFetcher,
    });
}
