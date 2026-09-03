// packages/api-ingest/src/jobs/timeoutStaleRuns.ts

import { RunStatus } from '@electr0zed/test-results-dashboard-core';
import { PrismaClient } from "@electr0zed/test-results-dashboard-db";

export async function timeoutStaleRuns(
	db: PrismaClient,
	timeoutMs: number,
	now = new Date(),
): Promise<number> {
	const cutoff = new Date(now.getTime() - timeoutMs);

	const result = await db.run.updateMany({
		where: {
			status: RunStatus.Running,
			lastActivityAt: {
				lt: cutoff,
			},
		},
		data: {
			status: RunStatus.TimedOut,
			endedAt: now,
		},
	});

	return result.count;
}
