import type { DashboardEvent } from '@electr0zed/test-results-dashboard-core';
import type { IngestionContext } from './ingestion-context';
import { handleRunStart } from './handlers/runStart.handler';
import { handleSpecFinish } from './handlers/specFinish.handler';
import { handleRunFinish } from './handlers/runFinish.handler';

export async function dispatchEvent(
	ctx: IngestionContext,
	event: DashboardEvent,
): Promise<void> {
	switch (event.type) {
		case 'run:start':
			return handleRunStart(ctx, event);

		case 'spec:finish':
			return handleSpecFinish(ctx, event);

		case 'run:finish':
			return handleRunFinish(ctx, event);

		default:
			return assertNever(event);
	}
}

function assertNever(value: never): never {
	throw new Error(`Unhandled event: ${JSON.stringify(value)}`);
}