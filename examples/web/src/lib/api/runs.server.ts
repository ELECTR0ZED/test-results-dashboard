import 'server-only';

import { serviceBindingFetcher } from './core.server';
import { getProjectRun as getProjectRunBase, getProjectRuns as getProjectRunsBase } from './runs';

export function getProjectRuns(publicId: string, page: number, pageSize: number) {
	return getProjectRunsBase(publicId, page, pageSize, {
		apiFetcher: serviceBindingFetcher,
	});
}

export function getProjectRun(publicId: string, runId: string) {
	return getProjectRunBase(publicId, runId, {
		apiFetcher: serviceBindingFetcher,
	});
}
