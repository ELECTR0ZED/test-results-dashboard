import 'server-only';

import { serviceBindingFetcher } from './core.server';
import {
    getProjectRuns as getProjectRunsBase,
    getProjectRun as getProjectRunBase,
} from './runs';

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