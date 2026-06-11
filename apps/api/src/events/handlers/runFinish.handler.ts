import type { RunFinishEvent } from '@electr0zed/test-results-dashboard-core';
import type { AppCtx } from '../../services/context';

export async function handleRunFinish(
	ctx: AppCtx,
	event: RunFinishEvent,
): Promise<void> {
	const { db } = ctx;

	const run = await db.run.findUnique({
		where: {
			publicId: event.payload.runId,
		},
		select: {
			id: true,
		},
	});

	if (!run) {
		throw new Error(`Run not found: ${event.payload.runId}`);
	}

	if ('message' in event.payload) {
		await db.run.update({
			where: {
				id: run.id,
			},
			data: {
				status: 'failed',
				endedAt: new Date(),
			},
		});

		return;
	}

	await db.run.update({
		where: {
			id: run.id,
		},
		data: {
			status: 'finished',
			framework: event.payload.run.runner,
			frameworkVersion: event.payload.run.runnerVersion ?? 'unknown',
			browser: event.payload.run.browserName ?? 'unknown',
			browserVersion: event.payload.run.browserVersion ?? 'unknown',
			os: formatOs(event.payload.run.osName, event.payload.run.osVersion),
			startedAt: parseOptionalDate(event.payload.run.startedAt),
			endedAt: parseOptionalDate(event.payload.run.endedAt) ?? new Date(),
		},
	});
}

function formatOs(
	osName: string | undefined,
	osVersion: string | undefined,
): string {
	return [osName, osVersion].filter(Boolean).join(' ') || 'unknown';
}

function parseOptionalDate(value: string | undefined): Date | undefined {
	if (!value) {
		return undefined;
	}

	return new Date(value);
}