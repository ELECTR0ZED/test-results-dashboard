import type { RunInfo, SpecInfo, TestInfo } from './run.js';

export type DashboardEvent =
    | RunStartEvent
    | SpecFinishEvent
    | RunFinishEvent;

export interface RunStartEvent {
    type: 'run:start';
    payload: RunInfo;
}

export interface SpecFinishEvent {
    type: 'spec:finish';
    payload: {
        runId: string;
        project?: string;
        spec: SpecInfo;
        tests: TestInfo[];
    };
}

export interface RunFinishEvent {
    type: 'run:finish';
    payload:
        | {
                runId: string;
                project?: string;
                run: RunInfo;
                specs: SpecInfo[];
            }
        | {
                runId: string;
                project?: string;
                failures: number;
                message: string;
            };
}