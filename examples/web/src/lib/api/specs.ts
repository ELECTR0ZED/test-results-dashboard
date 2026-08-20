import {
	type FullSpec,
	FullSpecSchema,
	PaginatedApiMeta,
	PaginatedApiSuccess,
} from '@electr0zed/test-results-dashboard-api-types';
import { z } from 'zod';
import { apiRequest, Options } from './core';

export function getRunSpecs(
	projectPublicId: string,
	runPublicId: string,
	page: number,
	pageSize: number,
	options: Options = {}
): Promise<PaginatedApiSuccess<FullSpec[]>> {
	return apiRequest<FullSpec[], PaginatedApiMeta>(
		`/api/projects/${projectPublicId}/runs/${runPublicId}/specs?page=${page}&pageSize=${pageSize}`,
		z.array(FullSpecSchema),
		{
			method: 'GET',
			apiFetcher: options.apiFetcher,
		}
	);
}
