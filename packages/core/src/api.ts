import type { DashboardEvent } from './event.js';
import type { RunInfo, SpecInfo, TestInfo } from './run.js';

export interface IngestEventRequest {
    event: DashboardEvent;
}

export interface IngestEventResponse {
    ok: true;
}

export interface GetRunResponse {
    run: RunInfo;
    specs: Array<{
        spec: SpecInfo;
        tests: TestInfo[];
    }>;
}

export interface ListRunsResponse {
    runs: RunInfo[];
}