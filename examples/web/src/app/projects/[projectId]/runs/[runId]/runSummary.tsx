'use client';

import { useEffect, type ComponentProps } from 'react';
import {
	ArrowPathIcon,
	CheckCircleIcon,
	ExclamationTriangleIcon,
	StopCircleIcon,
	XCircleIcon,
} from '@heroicons/react/20/solid';
import { Badge } from '@/components/catalyst/badge';
import { Heading } from '@/components/catalyst/heading';
import { Text } from '@/components/catalyst/text';
import { RunResults } from '@/components/runResults';
import { useRun } from '@/contexts/runContext';

type BadgeColour = NonNullable<
	ComponentProps<typeof Badge>['color']
>;

type DisplayStatus =
	| 'running'
	| 'passed'
	| 'failed'
	| 'timedOut'
	| 'interrupted'
	| 'finished';

const statusPresentation: Record<
	DisplayStatus,
	{
		label: string;
		color: BadgeColour;
		accent: string;
		iconColour: string;
		Icon: typeof CheckCircleIcon;
	}
> = {
	running: {
		label: 'Running',
		color: 'blue',
		accent: 'bg-blue-500',
		iconColour: 'text-blue-500',
		Icon: ArrowPathIcon,
	},
	passed: {
		label: 'Passed',
		color: 'green',
		accent: 'bg-green-500',
		iconColour: 'text-green-500',
		Icon: CheckCircleIcon,
	},
	failed: {
		label: 'Failed',
		color: 'red',
		accent: 'bg-red-500',
		iconColour: 'text-red-500',
		Icon: XCircleIcon,
	},
	timedOut: {
		label: 'Timed out',
		color: 'orange',
		accent: 'bg-orange-500',
		iconColour: 'text-orange-500',
		Icon: ExclamationTriangleIcon,
	},
	interrupted: {
		label: 'Interrupted',
		color: 'amber',
		accent: 'bg-amber-500',
		iconColour: 'text-amber-500',
		Icon: StopCircleIcon,
	},
	finished: {
		label: 'Finished',
		color: 'zinc',
		accent: 'bg-zinc-400',
		iconColour: 'text-zinc-500',
		Icon: CheckCircleIcon,
	},
};

export default function RunSummary() {
	const { run, refreshRun } = useRun();
	const displayStatus = getDisplayStatus(run.status, run.stats.failed, run.stats.tests);
	const presentation = statusPresentation[displayStatus];
	const StatusIcon = presentation.Icon;

	useEffect(() => {
		if (displayStatus !== 'running') {
			return;
		}

		const interval = window.setInterval(() => {
			void refreshRun().catch(() => undefined);
		}, 15_000);

		return () => window.clearInterval(interval);
	}, [displayStatus, refreshRun]);

	return (
		<section className="overflow-hidden rounded-xl border border-zinc-950/10 bg-white shadow-xs dark:border-white/10 dark:bg-zinc-900">
			<div className={`h-1 ${presentation.accent}`} />

			<div className="p-5 sm:p-6">
				<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
					<div className="flex min-w-0 items-start gap-3">
						<StatusIcon
							className={`mt-1 size-6 shrink-0 ${presentation.iconColour} ${
								displayStatus === 'running'
									? 'animate-spin'
									: ''
							}`}
							aria-hidden="true"
						/>

						<div className="min-w-0">
							<div className="flex flex-wrap items-center gap-2">
								<Heading>
									{formatName(run.framework)} run
								</Heading>

								<Badge color={presentation.color}>
									{presentation.label}
								</Badge>
							</div>

							<Text className="mt-1">
								Run{' '}
								<span
									className="font-mono text-xs"
									title={run.publicId}
								>
									{run.publicId.slice(0, 8)}
								</span>
							</Text>
						</div>
					</div>

					<RunResults
						passed={run.stats.passed}
						failed={run.stats.failed}
						pending={run.stats.pending}
						skipped={run.stats.skipped}
					/>
				</div>

				<div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-zinc-950/10 pt-5 sm:grid-cols-3 lg:grid-cols-5 dark:border-white/10">
					<MetadataItem
						label="Started"
						value={formatDate(run.startedAt)}
					/>

					<MetadataItem
						label="Finished"
						value={
							run.endedAt
								? formatDate(run.endedAt)
								: 'In progress'
						}
					/>

					<MetadataItem
						label="Elapsed"
						value={
							run.endedAt
								? formatDuration(
										run.endedAt.getTime() -
											run.startedAt.getTime(),
									)
								: '—'
						}
					/>

					<MetadataItem
						label="Specs"
						value={run.stats.specs.toLocaleString()}
					/>

					<MetadataItem
						label="Tests"
						value={run.stats.tests.toLocaleString()}
					/>
				</div>

				<div className="mt-5 flex flex-wrap items-center gap-2 border-t border-zinc-950/10 pt-5 dark:border-white/10">
					<MetadataBadge
						value={formatVersionedName(
							run.framework,
							run.frameworkVersion,
						)}
					/>

					<MetadataBadge
						value={formatVersionedName(
							run.browser,
							run.browserVersion,
						)}
					/>

					{isUsefulValue(run.os) && (
						<MetadataBadge value={run.os} />
					)}

					<MetadataBadge
						value={`${formatDuration(run.stats.duration)} test duration`}
					/>
				</div>
			</div>
		</section>
	);
}

function MetadataItem({
	label,
	value,
}: {
	label: string;
	value: string;
}) {
	return (
		<div>
			<div className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
				{label}
			</div>

			<div className="mt-1 text-sm font-medium text-zinc-950 dark:text-white">
				{value}
			</div>
		</div>
	);
}

function MetadataBadge({ value }: { value: string }) {
	return (
		<span className="rounded-md bg-zinc-950/5 px-2 py-1 text-xs font-medium text-zinc-600 dark:bg-white/5 dark:text-zinc-300">
			{value}
		</span>
	);
}

function getDisplayStatus(
	status: string,
	failed: number,
	tests: number,
): DisplayStatus {
	const normalized = status
		.toLowerCase()
		.replaceAll('-', '')
		.replaceAll('_', '')
		.replaceAll(' ', '');

	if (normalized === 'running') {
		return 'running';
	}

	if (normalized === 'timedout') {
		return 'timedOut';
	}

	if (normalized === 'interrupted') {
		return 'interrupted';
	}

	if (normalized === 'failed' || failed > 0) {
		return 'failed';
	}

	if (tests > 0) {
		return 'passed';
	}

	return 'finished';
}

function formatDate(value: Date): string {
	return new Intl.DateTimeFormat('en-GB', {
		dateStyle: 'medium',
		timeStyle: 'short',
	}).format(value);
}

function formatDuration(milliseconds: number): string {
	if (milliseconds < 1_000) {
		return `${milliseconds} ms`;
	}

	const seconds = milliseconds / 1_000;

	if (seconds < 60) {
		return `${seconds.toFixed(seconds < 10 ? 1 : 0)} s`;
	}

	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = Math.round(seconds % 60);

	if (minutes < 60) {
		return remainingSeconds > 0
			? `${minutes}m ${remainingSeconds}s`
			: `${minutes}m`;
	}

	const hours = Math.floor(minutes / 60);
	const remainingMinutes = minutes % 60;

	return remainingMinutes > 0
		? `${hours}h ${remainingMinutes}m`
		: `${hours}h`;
}

function formatVersionedName(name: string, version: string): string {
	const formattedName = formatName(name);

	return isUsefulValue(version)
		? `${formattedName} ${version}`
		: formattedName;
}

function formatName(value: string): string {
	if (!isUsefulValue(value)) {
		return 'Unknown';
	}

	return value.charAt(0).toUpperCase() + value.slice(1);
}

function isUsefulValue(value: string | null | undefined): value is string {
	return Boolean(
		value &&
			value.trim() &&
			value.toLowerCase() !== 'unknown',
	);
}