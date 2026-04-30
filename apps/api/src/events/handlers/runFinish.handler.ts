import type { RunFinishEvent } from '@electr0zed/test-results-dashboard-core';
import type { IngestionContext } from '../ingestion-context';

export async function handleRunFinish(
	ctx: IngestionContext,
	event: RunFinishEvent,
): Promise<void> {
	const run = await ctx.runs.getByPublicRunIdOrThrow(event.payload.runId);

	if ('message' in event.payload) {
		await ctx.runs.markRunFailed({
			runId: run.id,
			message: event.payload.message,
			failures: event.payload.failures,
		});

		return;
	}

	await ctx.runs.markRunFinished({
		runId: run.id,
		run: event.payload.run,
		specs: event.payload.specs,
	});
}