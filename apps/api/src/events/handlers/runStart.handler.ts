import type { RunStartEvent } from '@electr0zed/test-results-dashboard-core';
import type { IngestionContext } from '../ingestion-context';

export async function handleRunStart(
	ctx: IngestionContext,
	event: RunStartEvent,
): Promise<void> {
	await ctx.runs.upsertRunStart(event.payload);
}