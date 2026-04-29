export type RunnerName = 'cypress' | 'playwright';

export type TestStatus =
    | 'passed'
    | 'failed'
    | 'pending'
    | 'skipped'
    | 'timedOut'
    | 'interrupted';