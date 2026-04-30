import type { SpecFinishEvent } from '@electr0zed/test-results-dashboard-core';
import type { IngestionContext } from '../ingestion-context';

export async function handleSpecFinish(
	ctx: IngestionContext,
	event: SpecFinishEvent,
): Promise<void> {
	const run = await ctx.runs.getByPublicRunIdOrThrow(event.payload.runId);

	const spec = await ctx.specs.upsertSpecFinish({
		runId: run.id,
		spec: event.payload.spec,
	});

	await ctx.tests.replaceSpecTests({
		specId: spec.id,
		tests: event.payload.tests,
	});
}