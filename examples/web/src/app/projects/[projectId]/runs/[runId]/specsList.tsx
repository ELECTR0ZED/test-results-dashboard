'use client';

import { Paginator } from '@/components/paginator';
import { SpecCard } from '@/components/specCard';
import { useProject } from '@/contexts/projectContext';
import { useRun } from '@/contexts/runContext';
import { useToast } from '@/contexts/toastContext';
import { getRunSpecs } from '@/lib/api/specs';
import { DEFAULT_PAGE_SIZE, FullSpec, PaginationMeta } from '@electr0zed/test-results-dashboard-api-types';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SpecsList() {
	const searchParams = useSearchParams();
	const { project } = useProject();
	const { run } = useRun();
	const runUpdatedAt = run.updatedAt.getTime();
	const { addToast } = useToast();
	const [specs, setSpecs] = useState<FullSpec[]>([]);
	const [pagination, setPagination] = useState<PaginationMeta>({
		page: 1,
		pageSize: DEFAULT_PAGE_SIZE,
		total: 0,
		totalPages: 0,
	});
	const [initialLoading, setInitialLoading] = useState(true);

	useEffect(() => {
		let cancelled = false;
		const currentPage = Number.parseInt(searchParams.get('page') ?? '1', 10);

		void getRunSpecs(project.publicId, run.publicId, currentPage, DEFAULT_PAGE_SIZE)
			.then((response) => {
				if (cancelled) {
					return;
				}

				setSpecs(response.data);
				setPagination(response.meta.pagination);
			})
			.catch((error: unknown) => {
				if (cancelled) {
					return;
				}

				addToast('Failed to fetch specs', error instanceof Error ? error.message : 'Unknown error', 'error');
			})
			.finally(() => {
				if (!cancelled) {
					setInitialLoading(false);
				}
			});

		return () => {
			cancelled = true;
		};
	}, [addToast, project.publicId, run.publicId, runUpdatedAt, searchParams]);

	return (
		<>
			<div className="space-y-4">
				{initialLoading ? (
					<SpecsLoadingState />
				) : specs.length === 0 ? (
					<div className="rounded-xl border border-dashed border-zinc-950/10 px-6 py-12 text-center text-sm text-zinc-500 dark:border-white/10 dark:text-zinc-400">
						No specs have been recorded for this run.
					</div>
				) : (
					specs.map((spec) => <SpecCard key={spec.id} spec={spec} />)
				)}
			</div>

			<div className="mx-auto my-6 max-w-2xl">
				<Paginator
					currentPage={pagination.page}
					totalPages={pagination.totalPages}
					pathname={`/projects/${project.publicId}/runs/${run.publicId}`}
				/>
			</div>
		</>
	);
}

function SpecsLoadingState() {
	return (
		<div className="space-y-4" aria-label="Loading specs">
			{Array.from({ length: 3 }).map((_, index) => (
				<div key={index} className="h-24 animate-pulse rounded-xl bg-zinc-950/5 dark:bg-white/5" />
			))}
		</div>
	);
}
