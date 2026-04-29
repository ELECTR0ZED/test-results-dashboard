
export interface CypressReporterOptions {
    endpoint: string;
    token?: string;
    project?: string;
    runId?: string;
    branch?: string;
    commitSha?: string;
    commitMessage?: string;
    environment?: string;
    machineId?: string;
    shardId?: string;
    debug?: boolean;
    headers?: Record<string, string>;
    sendRunStart?: boolean;
    sendSpecs?: boolean;
    sendRunFinish?: boolean;
}

export type CypressAfterRunResult =
    | CypressCommandLine.CypressRunResult
    | CypressCommandLine.CypressFailedRunResult;