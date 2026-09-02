import {
	ApiSuccess,
	ProjectRunsApiSuccess,
	ProjectRunsMeta,
	RunWithStats,
	RunWithStatsSchema,
} from '@electr0zed/test-results-dashboard-api-types';
import { z } from 'zod';
import { apiRequest, Options } from './core';

export type ProjectRunsQuery = {
	page: number;
	pageSize: number;
	attributeKey?: string;
	attributeValue?: string;
};

export function getProjectRuns(
	publicId: string,
	query: ProjectRunsQuery,
	options: Options = {}
): Promise<ProjectRunsApiSuccess> {
	const searchParams = new URLSearchParams({
		page: query.page.toString(),
		pageSize: query.pageSize.toString(),
	});

	if (query.attributeKey) {
		searchParams.set('attributeKey', query.attributeKey);
	}

	if (query.attributeValue) {
		searchParams.set('attributeValue', query.attributeValue);
	}

	return apiRequest<RunWithStats[], ProjectRunsMeta>(
		`/api/projects/${publicId}/runs?${searchParams.toString()}`,
		z.array(RunWithStatsSchema),
		{
			method: 'GET',
			apiFetcher: options.apiFetcher,
		}
	);
}

export function getProjectRun(
	publicId: string,
	runId: string,
	options: Options = {}
): Promise<ApiSuccess<RunWithStats>> {
	return apiRequest<RunWithStats>(`/api/projects/${publicId}/runs/${runId}`, RunWithStatsSchema, {
		method: 'GET',
		apiFetcher: options.apiFetcher,
	});
}
