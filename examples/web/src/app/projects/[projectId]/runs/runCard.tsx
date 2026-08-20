'use client';

import { Badge } from '@/components/catalyst/badge';
import { RunResults } from '@/components/runResults';
import type { RunWithStats } from '@electr0zed/test-results-dashboard-api-types';
import {
	CheckCircleIcon,
	ChevronRightIcon,
	ClockIcon,
	ExclamationTriangleIcon,
	StopCircleIcon,
	XCircleIcon,
} from '@heroicons/react/20/solid';
import clsx from 'clsx';
import Link from 'next/link';

type RunCardProps = {
	projectPublicId: string;
	run: RunWithStats;
};

type RunDisplayStatus =
	| 'passed'
	| 'failed'
	| 'running'
	| 'timedOut'
	| 'interrupted'
	| 'finished';

type BadgeColour =
	| 'green'
	| 'red'
	| 'amber'
	| 'orange'
	| 'zinc';

type StatusStyle = {
	label: string;
	badgeColour: BadgeColour;
	accentColour: string;
	iconColour: string;
};

export function RunCard({
	projectPublicId,
	run,
}: RunCardProps) {
	const displayStatus = getRunDisplayStatus(run);
	const statusStyle = getStatusStyle(displayStatus);

	const duration =
		run.status === 'running'
			? 'In progress'
			: formatDuration(run.stats.duration);

	const framework = formatVersionedName(
		run.framework,
		run.frameworkVersion,
	);

	const browser = formatVersionedName(
		run.browser,
		run.browserVersion,
	);

	const environmentMetadata = [
		framework,
		browser,
		run.os !== 'unknown' ? run.os : undefined,
	].filter((value): value is string => Boolean(value));

	return (
		<Link
			href={`/projects/${projectPublicId}/runs/${run.publicId}`}
			className={clsx(
				'group relative block overflow-hidden rounded-xl border bg-white shadow-sm transition',
				'border-zinc-950/10 hover:border-zinc-950/20 hover:shadow-md',
				'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500',
				'dark:border-white/10 dark:bg-zinc-900 dark:hover:border-white/20',
			)}
		>
			<div
				className={clsx(
					'absolute inset-y-0 left-0 w-1',
					statusStyle.accentColour,
				)}
				aria-hidden="true"
			/>

			<div className="flex items-start gap-3 py-4 pr-4 pl-5 sm:items-center sm:gap-4 sm:px-6">
				<RunStatusIcon
					status={displayStatus}
					className={clsx(
						'mt-0.5 size-6 shrink-0 sm:mt-0',
						statusStyle.iconColour,
					)}
				/>

				<div className="min-w-0 flex-1">
					<div className="flex flex-wrap items-center gap-2">
						<span className="font-semibold text-zinc-950 dark:text-white">
							{formatName(run.framework)} run
						</span>

						<Badge color={statusStyle.badgeColour}>
							{statusStyle.label}
						</Badge>
					</div>

					<div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-zinc-500 dark:text-zinc-400">
						<time dateTime={run.startedAt.toISOString()}>
							{formatRunDate(run.startedAt)}
						</time>

						<Separator />

						<span>
							{run.stats.specs}{' '}
							{run.stats.specs === 1 ? 'spec' : 'specs'}
						</span>

						<Separator />

						<span>
							{run.stats.tests}{' '}
							{run.stats.tests === 1 ? 'test' : 'tests'}
						</span>

						<Separator />

						<span>{duration}</span>
					</div>

					{environmentMetadata.length > 0 && (
						<div
							className="mt-1 truncate text-xs text-zinc-400 dark:text-zinc-500"
							title={environmentMetadata.join(' · ')}
						>
							{environmentMetadata.join(' · ')}
						</div>
					)}
				</div>

				<div className="hidden shrink-0 md:block">
					<RunResults
						passed={run.stats.passed}
						failed={run.stats.failed}
						pending={run.stats.pending}
						skipped={run.stats.skipped}
					/>
				</div>

				<ChevronRightIcon
					className="size-5 shrink-0 text-zinc-400 transition-transform group-hover:translate-x-0.5"
					aria-hidden="true"
				/>
			</div>

			<div className="border-t border-zinc-950/5 px-4 py-3 md:hidden dark:border-white/5">
				<RunResults
					passed={run.stats.passed}
					failed={run.stats.failed}
					pending={run.stats.pending}
					skipped={run.stats.skipped}
				/>
			</div>
		</Link>
	);
}

function RunStatusIcon({
	status,
	className,
}: {
	status: RunDisplayStatus;
	className?: string;
}) {
	switch (status) {
		case 'passed':
			return (
				<CheckCircleIcon
					className={className}
					aria-label="Passed"
				/>
			);

		case 'failed':
			return (
				<XCircleIcon
					className={className}
					aria-label="Failed"
				/>
			);

		case 'running':
			return (
				<ClockIcon
					className={className}
					aria-label="Running"
				/>
			);

		case 'timedOut':
			return (
				<ExclamationTriangleIcon
					className={className}
					aria-label="Timed out"
				/>
			);

		case 'interrupted':
			return (
				<StopCircleIcon
					className={className}
					aria-label="Interrupted"
				/>
			);

		case 'finished':
			return (
				<CheckCircleIcon
					className={className}
					aria-label="Finished"
				/>
			);
	}
}

function Separator() {
	return (
		<span
			className="text-zinc-300 dark:text-zinc-600"
			aria-hidden="true"
		>
			·
		</span>
	);
}

function getRunDisplayStatus(
	run: RunWithStats,
): RunDisplayStatus {
	const status = run.status.toLowerCase();

	if (status === 'running') {
		return 'running';
	}

	if (status === 'timedout') {
		return 'timedOut';
	}

	if (status === 'interrupted') {
		return 'interrupted';
	}

	if (status === 'failed' || run.stats.failed > 0) {
		return 'failed';
	}

	if (
		status === 'finished' &&
		run.stats.tests === 0
	) {
		return 'finished';
	}

	if (
		status === 'finished' ||
		status === 'passed'
	) {
		return 'passed';
	}

	return 'finished';
}

function getStatusStyle(
	status: RunDisplayStatus,
): StatusStyle {
	switch (status) {
		case 'passed':
			return {
				label: 'Passed',
				badgeColour: 'green',
				accentColour: 'bg-green-500',
				iconColour:
					'text-green-600 dark:text-green-400',
			};

		case 'failed':
			return {
				label: 'Failed',
				badgeColour: 'red',
				accentColour: 'bg-red-500',
				iconColour:
					'text-red-600 dark:text-red-400',
			};

		case 'running':
			return {
				label: 'Running',
				badgeColour: 'amber',
				accentColour: 'bg-amber-400',
				iconColour:
					'text-amber-500 dark:text-amber-400',
			};

		case 'timedOut':
			return {
				label: 'Timed out',
				badgeColour: 'red',
				accentColour: 'bg-red-500',
				iconColour:
					'text-red-600 dark:text-red-400',
			};

		case 'interrupted':
			return {
				label: 'Interrupted',
				badgeColour: 'orange',
				accentColour: 'bg-orange-500',
				iconColour:
					'text-orange-500 dark:text-orange-400',
			};

		case 'finished':
			return {
				label: 'Finished',
				badgeColour: 'zinc',
				accentColour: 'bg-zinc-400',
				iconColour:
					'text-zinc-500 dark:text-zinc-400',
			};
	}
}

function formatVersionedName(
	name: string,
	version: string,
) {
	const formattedName = formatName(name);

	if (
		!version ||
		version.toLowerCase() === 'unknown'
	) {
		return formattedName;
	}

	return `${formattedName} ${version}`;
}

function formatName(value: string) {
	if (!value || value.toLowerCase() === 'unknown') {
		return 'Unknown';
	}

	return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

function formatRunDate(date: Date) {
	return new Intl.DateTimeFormat('en-GB', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	}).format(date);
}

function formatDuration(milliseconds: number) {
	if (milliseconds < 1_000) {
		return `${milliseconds}ms`;
	}

	if (milliseconds < 60_000) {
		return `${(milliseconds / 1_000).toFixed(1)}s`;
	}

	const minutes = Math.floor(milliseconds / 60_000);
	const seconds = Math.floor(
		(milliseconds % 60_000) / 1_000,
	);

	if (minutes < 60) {
		return `${minutes}m ${seconds}s`;
	}

	const hours = Math.floor(minutes / 60);
	const remainingMinutes = minutes % 60;

	return `${hours}h ${remainingMinutes}m`;
}