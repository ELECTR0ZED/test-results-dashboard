import type { DashboardEvent } from '@electr0zed/test-results-dashboard-core';
import { postEvent } from './http.js';
import { mapAfterRun, mapAfterSpec, mapBeforeRun } from './mapper.js';
import type {
    CypressAfterRunResult,
    CypressReporterOptions,
} from './types.js';
import { createRunId } from './utils.js';

export class CypressReporter {
    private readonly options: CypressReporterOptions;
    private readonly runId: string;

    constructor(options: CypressReporterOptions) {
        this.options = {
            sendRunStart: true,
            sendSpecs: true,
            sendRunFinish: true,
            ...options,
        };

        this.runId = options.runId ?? createRunId();
    }

    register(on: Cypress.PluginEvents, _config: Cypress.PluginConfigOptions): void {
        on('before:run', async (details: Cypress.BeforeRunDetails) => {
            if (!this.options.sendRunStart) {
                return;
            }

            await this.safePost(
                mapBeforeRun(this.runId, this.options, details),
                'before:run'
            );
        });

        on('after:spec', async (_spec, result: CypressCommandLine.RunResult) => {
            if (!this.options.sendSpecs) {
                return;
            }

            await this.safePost(
                mapAfterSpec(this.runId, this.options, result),
                'after:spec'
            );
        });

        on('after:run', async (result: CypressAfterRunResult) => {
            if (!this.options.sendRunFinish) {
                return;
            }

            await this.safePost(
                mapAfterRun(this.runId, this.options, result),
                'after:run'
            );
        });

    }

    private async safePost(event: DashboardEvent, hook: string): Promise<void> {
        try {
            await postEvent(this.options, event);
        } catch (error) {
            if (this.options.debug) {
                console.error(`[cypress-reporter] Failed to post event from ${hook}`, error);
            }
        }
    }
}