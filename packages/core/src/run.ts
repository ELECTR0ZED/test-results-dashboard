import type { Artifact } from './artifact.js';
import type { RunnerName, TestStatus } from './runner.js';

export interface RunMetadata {
    id: string;
    runner: RunnerName;
    project?: string;
    branch?: string;
    commitSha?: string;
    commitMessage?: string;
    environment?: string;
    machineId?: string;
    shardId?: string;
    group?: string;
    parallel?: boolean;
}

export interface RunInfo extends RunMetadata {
    startedAt?: string;
    endedAt?: string;
    browserName?: string;
    browserVersion?: string;
    osName?: string;
    osVersion?: string;
    runnerVersion?: string;
}

export interface SpecInfo {
    name: string;
    relative?: string;
    absolute?: string;
    startedAt?: string;
    endedAt?: string;
    duration?: number;
    tests: number;
    passes: number;
    failures: number;
    pending: number;
    skipped: number;
    suites?: number;
    video?: string | null;
    screenshots?: Artifact[];
}

export interface TestAttempt {
    state?: string;
}

export interface TestInfo {
    title: string[];
    status?: TestStatus | string;
    displayError?: string;
    attempts?: TestAttempt[];
    duration?: number;
    retry?: number;
    location?: {
        file?: string;
        line?: number;
        column?: number;
    };
    stdout?: string[];
    stderr?: string[];
    artifacts?: Artifact[];
}