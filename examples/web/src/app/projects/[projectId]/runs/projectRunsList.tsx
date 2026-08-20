'use client';

import { Paginator } from '@/components/paginator';
import { useProject } from '@/contexts/projectContext';
import { useToast } from '@/contexts/toastContext';
import { getProjectRuns } from '@/lib/api/runs';
import {
	DEFAULT_PAGE_SIZE,
	type PaginationMeta,
	type RunWithStats,
} from '@electr0zed/test-results-dashboard-api-types';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { RunCard } from './runCard';

export default function ProjectRunsList() {
	const searchParams = useSearchParams();
	const { project } = useProject();
	const { addToast } = useToast();

	const [runs, setRuns] = useState<RunWithStats[]>([]);
	const [loading, setLoading] = useState(true);
	const [pagination, setPagination] = useState<PaginationMeta>({
		page: 1,
		pageSize: DEFAULT_PAGE_SIZE,
		total: 0,
		totalPages: 0,
	});

	const fetchRuns = useCallback(
		async (page: number) => {
			setLoading(true);
			setRuns([]);

			try {
				const response = await getProjectRuns(project.publicId, page, pagination.pageSize);

				setRuns(response.data);
				setPagination(response.meta.pagination);
			} catch (error) {
				addToast('Failed to fetch runs', error instanceof Error ? error.message : 'Unknown error', 'error');
			} finally {
				setLoading(false);
			}
		},
		[project.publicId, addToast, pagination.pageSize]
	);

	useEffect(() => {
		const requestedPage = Number.parseInt(searchParams.get('page') ?? '1', 10);

		const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;

		fetchRuns(page);
	}, [fetchRuns, searchParams]);

	return (
		<>
			{!loading && pagination.total > 0 && (
				<div className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
					{pagination.total} {pagination.total === 1 ? 'run' : 'runs'}
				</div>
			)}

			<div className="space-y-3">
				{loading ? (
					<RunsLoadingState />
				) : runs.length === 0 ? (
					<RunsEmptyState />
				) : (
					runs.map((run) => <RunCard key={run.publicId} projectPublicId={project.publicId} run={run} />)
				)}
			</div>

			{!loading && pagination.totalPages > 1 && (
				<div className="mx-auto my-6 max-w-2xl">
					<Paginator
						currentPage={pagination.page}
						totalPages={pagination.totalPages}
						pathname={`/projects/${project.publicId}/runs`}
					/>
				</div>
			)}
		</>
	);
}

function RunsLoadingState() {
	return (
		<div className="space-y-3" aria-label="Loading runs">
			{Array.from({ length: 4 }).map((_, index) => (
				<div key={index} className="h-28 animate-pulse rounded-xl bg-zinc-950/5 dark:bg-white/5" />
			))}
		</div>
	);
}

function RunsEmptyState() {
	return (
		<div className="rounded-xl border border-dashed border-zinc-950/10 px-6 py-12 text-center dark:border-white/10">
			<div className="text-sm font-medium text-zinc-950 dark:text-white">No runs yet</div>

			<div className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
				Runs will appear here after results are sent by a configured reporter.
			</div>
		</div>
	);
}
