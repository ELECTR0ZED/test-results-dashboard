// packages/api-ingest/src/jobs/timeoutStaleRuns.ts

import { PrismaClient } from "@electr0zed/test-results-dashboard-db";

export async function timeoutStaleRuns(
	db: PrismaClient,
	timeoutMs: number,
	now = new Date(),
): Promise<number> {
	const cutoff = new Date(now.getTime() - timeoutMs);

	const result = await db.run.updateMany({
		where: {
			status: 'running',
			lastActivityAt: {
				lt: cutoff,
			},
		},
		data: {
			status: 'timedOut',
			endedAt: now,
		},
	});

	return result.count;
}