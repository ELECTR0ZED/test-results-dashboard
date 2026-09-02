import type { RunStartEvent } from '@electr0zed/test-results-dashboard-core';
import type { AppCtx } from '../../types';
import { mapRunAttributes, mapRunMetadata } from './runMetadata';

export async function handleRunStart<TD1Binding extends string>(
	ctx: AppCtx<TD1Binding>,
	event: RunStartEvent
): Promise<void> {
	const { db } = ctx;

	const project = await db.project.findUnique({
		where: {
			publicId: event.payload.projectId,
		},
	});

	if (!project) {
		throw new Error(`Project with publicId "${event.payload.projectId}" not found.`);
	}

	const run = await db.run.findUnique({
		where: {
			publicId: event.payload.id,
		},
		select: {
			projectId: true,
		},
	});

	if (run && run.projectId !== project.id) {
		throw new Error(`Run with publicId "${event.payload.id}" belongs to a different project.`);
	}

	const attributes = event.payload.attributes;

	await db.run.upsert({
		where: {
			publicId: event.payload.id,
		},
		create: {
			projectId: project.id,
			publicId: event.payload.id,
			...mapRunMetadata(event.payload),
			framework: event.payload.runner,
			frameworkVersion: event.payload.runnerVersion ?? 'unknown',
			browser: event.payload.browserName ?? 'unknown',
			browserVersion: event.payload.browserVersion ?? 'unknown',
			os: formatOs(event.payload.osName, event.payload.osVersion),
			status: 'running',
			startedAt: parseOptionalDate(event.payload.startedAt) ?? new Date(),
			lastActivityAt: new Date(),
			attributes: attributes && attributes.length > 0 ? { create: mapRunAttributes(attributes) } : undefined,
		},
		update: {
			projectId: project.id,
			...mapRunMetadata(event.payload),
			framework: event.payload.runner,
			frameworkVersion: event.payload.runnerVersion ?? 'unknown',
			browser: event.payload.browserName ?? 'unknown',
			browserVersion: event.payload.browserVersion ?? 'unknown',
			os: formatOs(event.payload.osName, event.payload.osVersion),
			status: 'running',
			startedAt: parseOptionalDate(event.payload.startedAt) ?? new Date(),
			endedAt: null,
			lastActivityAt: new Date(),
			attributes:
				attributes === undefined
					? undefined
					: {
							deleteMany: {},
							create: mapRunAttributes(attributes),
						},
		},
	});
}

function formatOs(osName: string | undefined, osVersion: string | undefined): string {
	return [osName, osVersion].filter(Boolean).join(' ') || 'unknown';
}

function parseOptionalDate(value: string | undefined): Date | undefined {
	if (!value) {
		return undefined;
	}

	return new Date(value);
}
