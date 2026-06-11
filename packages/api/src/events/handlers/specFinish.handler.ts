import type { SpecFinishEvent } from '@electr0zed/test-results-dashboard-core';
import type { AppCtx } from '../../types';

export async function handleSpecFinish(
	ctx: AppCtx,
	event: SpecFinishEvent,
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

	await db.$transaction(async (tx) => {
		const filename = getSpecFilename(event.payload.spec);

		const spec = await tx.spec.upsert({
			where: {
				runId_filename: {
					runId: run.id,
					filename,
				},
			},
			create: {
				runId: run.id,
				filename,
				tests: event.payload.spec.tests,
				passed: event.payload.spec.passes,
				failed: event.payload.spec.failures,
				pending: event.payload.spec.pending,
				skipped: event.payload.spec.skipped,
				duration: event.payload.spec.duration ?? 0,
				startedAt: new Date(event.payload.spec.startedAt),
				endedAt: new Date(event.payload.spec.endedAt),
				status: getSpecStatus(event),
				message: getSpecMessage(event),
			},
			update: {
				tests: event.payload.spec.tests,
				passed: event.payload.spec.passes,
				failed: event.payload.spec.failures,
				pending: event.payload.spec.pending,
				skipped: event.payload.spec.skipped,
				duration: event.payload.spec.duration ?? 0,
				startedAt: new Date(event.payload.spec.startedAt),
				endedAt: new Date(event.payload.spec.endedAt),
				status: getSpecStatus(event),
				message: getSpecMessage(event),
			},
			select: {
				id: true,
			},
		});

		await tx.specTestAttempt.deleteMany({
			where: {
				specTest: {
					specId: spec.id,
				},
			},
		});

		await tx.specTest.deleteMany({
			where: {
				specId: spec.id,
			},
		});

		for (const test of event.payload.tests) {
			const specTest = await tx.specTest.create({
				data: {
					specId: spec.id,
					title: test.title.join(' > '),
					status: test.status,
					duration: test.duration ?? 0,
					message: test.displayError,
				},
				select: {
					id: true,
				},
			});

			if (!test.attempts?.length) {
				continue;
			}

			await tx.specTestAttempt.createMany({
				data: test.attempts.map((attempt) => ({
					specTestId: specTest.id,
					status: attempt.state ?? test.status,
					message: attempt.state === 'failed'
						? test.displayError
						: undefined,
				})),
			});
		}
	});
}

function getSpecFilename(spec: SpecFinishEvent['payload']['spec']): string {
	return spec.relative ?? spec.name;
}

function getSpecStatus(event: SpecFinishEvent): string {
	if (event.payload.spec.failures > 0) {
		return 'failed';
	}

	if (event.payload.spec.pending > 0 || event.payload.spec.skipped > 0) {
		return 'partial';
	}

	return 'passed';
}

function getSpecMessage(event: SpecFinishEvent): string | undefined {
	const firstFailedTest = event.payload.tests.find((test) => test.displayError);

	return firstFailedTest?.displayError;
}
