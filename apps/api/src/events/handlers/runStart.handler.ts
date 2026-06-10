import type { RunStartEvent } from '@electr0zed/test-results-dashboard-core';
import type { AppCtx } from '../../services/context';

export async function handleRunStart(
	ctx: AppCtx,
	event: RunStartEvent,
): Promise<void> {
	const { db } = ctx;

	await db.run.upsert({
		where: {
			publicId: event.payload.id,
		},
		create: {
			publicId: event.payload.id,
			framework: event.payload.runner,
			frameworkVersion: event.payload.runnerVersion ?? 'unknown',
			browser: event.payload.browserName ?? 'unknown',
			browserVersion: event.payload.browserVersion ?? 'unknown',
			os: formatOs(event.payload.osName, event.payload.osVersion),
			status: 'running',
			startedAt: parseOptionalDate(event.payload.startedAt) ?? new Date(),
		},
		update: {
			framework: event.payload.runner,
			frameworkVersion: event.payload.runnerVersion ?? 'unknown',
			browser: event.payload.browserName ?? 'unknown',
			browserVersion: event.payload.browserVersion ?? 'unknown',
			os: formatOs(event.payload.osName, event.payload.osVersion),
			status: 'running',
			startedAt: parseOptionalDate(event.payload.startedAt) ?? new Date(),
			endedAt: null,
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