'use client';

import { Button } from '@/components/catalyst/button';
import { Select } from '@/components/catalyst/select';
import { Paginator } from '@/components/paginator';
import { useProject } from '@/contexts/projectContext';
import { useToast } from '@/contexts/toastContext';
import { getProjectRuns } from '@/lib/api/runs';
import { formatRunAttributeKey } from '@/lib/runPresentation';
import {
	type AvailableRunAttribute,
	DEFAULT_PAGE_SIZE,
	type PaginationMeta,
	type RunWithStats,
} from '@electr0zed/test-results-dashboard-api-types';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { RunCard } from './runCard';

export default function ProjectRunsList() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const { project } = useProject();
	const { addToast } = useToast();

	const [runs, setRuns] = useState<RunWithStats[]>([]);
	const [loading, setLoading] = useState(true);
	const [availableAttributes, setAvailableAttributes] = useState<AvailableRunAttribute[]>([]);
	const [pagination, setPagination] = useState<PaginationMeta>({
		page: 1,
		pageSize: DEFAULT_PAGE_SIZE,
		total: 0,
		totalPages: 0,
	});

	const fetchRuns = useCallback(
		async (page: number, attributeKey?: string, attributeValue?: string) => {
			setLoading(true);
			setRuns([]);

			try {
				const response = await getProjectRuns(project.publicId, {
					page,
					pageSize: pagination.pageSize,
					attributeKey,
					attributeValue,
				});

				setRuns(response.data);
				setPagination(response.meta.pagination);
				setAvailableAttributes(response.meta.availableAttributes);
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
		const attributeKey = searchParams.get('attributeKey') ?? undefined;
		const attributeValue = searchParams.get('attributeValue') ?? undefined;

		fetchRuns(page, attributeKey, attributeValue);
	}, [fetchRuns, searchParams]);

	const selectedAttributeKey = searchParams.get('attributeKey') ?? '';
	const selectedAttributeValue = searchParams.get('attributeValue') ?? '';
	const selectedAttribute = availableAttributes.find((attribute) => attribute.key === selectedAttributeKey);
	const filtersApplied = Boolean(selectedAttributeKey);

	function updateFilters(attributeKey?: string, attributeValue?: string) {
		const params = new URLSearchParams(searchParams.toString());
		params.delete('page');

		if (attributeKey) {
			params.set('attributeKey', attributeKey);
		} else {
			params.delete('attributeKey');
		}

		if (attributeKey && attributeValue) {
			params.set('attributeValue', attributeValue);
		} else {
			params.delete('attributeValue');
		}

		const queryString = params.toString();
		const pathname = `/projects/${project.publicId}/runs`;

		router.push(queryString ? `${pathname}?${queryString}` : pathname);
	}

	return (
		<>
			{!loading && (pagination.total > 0 || availableAttributes.length > 0 || filtersApplied) && (
				<div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div className="text-sm text-zinc-500 dark:text-zinc-400">
						{pagination.total} {pagination.total === 1 ? 'run' : 'runs'}
					</div>

					{(availableAttributes.length > 0 || filtersApplied) && (
						<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
							<Select
								aria-label="Filter runs by attribute"
								className="sm:w-44"
								value={selectedAttributeKey}
								onChange={(event) => updateFilters(event.target.value || undefined)}
							>
								<option value="">All attributes</option>

								{availableAttributes.map((attribute) => (
									<option key={attribute.key} value={attribute.key}>
										{formatRunAttributeKey(attribute.key)}
									</option>
								))}
							</Select>

							<Select
								aria-label="Filter runs by attribute value"
								className="sm:w-44"
								disabled={!selectedAttributeKey}
								value={selectedAttributeValue}
								onChange={(event) =>
									updateFilters(selectedAttributeKey || undefined, event.target.value || undefined)
								}
							>
								<option value="">Any value</option>

								{selectedAttribute?.values.map((value) => (
									<option key={value} value={value}>
										{value}
									</option>
								))}
							</Select>

							{filtersApplied && (
								<Button type="button" className="cursor-pointer" plain onClick={() => updateFilters()}>
									Clear
								</Button>
							)}
						</div>
					)}
				</div>
			)}

			<div className="space-y-3">
				{loading ? (
					<RunsLoadingState />
				) : runs.length === 0 ? (
					<RunsEmptyState filtered={filtersApplied} clearFilters={() => updateFilters()} />
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
						searchParams={{
							attributeKey: selectedAttributeKey || undefined,
							attributeValue: selectedAttributeValue || undefined,
						}}
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

function RunsEmptyState({ filtered, clearFilters }: { filtered: boolean; clearFilters: () => void }) {
	return (
		<div className="rounded-xl border border-dashed border-zinc-950/10 px-6 py-12 text-center dark:border-white/10">
			<div className="text-sm font-medium text-zinc-950 dark:text-white">
				{filtered ? 'No runs match these filters' : 'No runs yet'}
			</div>

			<div className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
				{filtered
					? 'Try another attribute or clear the current filters.'
					: 'Runs will appear here after results are sent by a configured reporter.'}
			</div>

			{filtered && (
				<Button type="button" outline className="mt-4" onClick={clearFilters}>
					Clear filters
				</Button>
			)}
		</div>
	);
}
