'use client';

import { Button } from '@/components/catalyst/button';
import { Combobox, ComboboxOption } from '@/components/catalyst/combobox';
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
import { useEffect, useState } from 'react';
import { RunCard } from './runCard';

export default function ProjectRunsList() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const { project } = useProject();
	const { addToast } = useToast();

	const [runs, setRuns] = useState<RunWithStats[]>([]);
	const [loadedRequestKey, setLoadedRequestKey] = useState<string>();
	const [availableAttributes, setAvailableAttributes] = useState<AvailableRunAttribute[]>([]);
	const [pagination, setPagination] = useState<PaginationMeta>({
		page: 1,
		pageSize: DEFAULT_PAGE_SIZE,
		total: 0,
		totalPages: 0,
	});

	const requestedPage = Number.parseInt(searchParams.get('page') ?? '1', 10);

	const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;

	const selectedAttributeKey = searchParams.get('attributeKey') ?? '';

	const selectedAttributeValue = searchParams.get('attributeValue') ?? '';

	const requestKey = JSON.stringify([project.publicId, page, selectedAttributeKey, selectedAttributeValue]);

	const loading = loadedRequestKey !== requestKey;

	useEffect(() => {
		let cancelled = false;

		void getProjectRuns(project.publicId, {
			page,
			pageSize: DEFAULT_PAGE_SIZE,
			attributeKey: selectedAttributeKey || undefined,
			attributeValue: selectedAttributeValue || undefined,
		})
			.then((response) => {
				if (cancelled) {
					return;
				}

				setRuns(response.data);
				setPagination(response.meta.pagination);
				setAvailableAttributes(response.meta.availableAttributes);
				setLoadedRequestKey(requestKey);
			})
			.catch((error: unknown) => {
				if (cancelled) {
					return;
				}

				addToast('Failed to fetch runs', error instanceof Error ? error.message : 'Unknown error', 'error');

				setRuns([]);
				setPagination({
					page,
					pageSize: DEFAULT_PAGE_SIZE,
					total: 0,
					totalPages: 0,
				});
				setLoadedRequestKey(requestKey);
			});

		return () => {
			cancelled = true;
		};
	}, [addToast, page, project.publicId, requestKey, selectedAttributeKey, selectedAttributeValue]);

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

							<AttributeValueFilter
								key={`${selectedAttributeKey}:${selectedAttributeValue}`}
								attributeKey={selectedAttributeKey}
								attributeValue={selectedAttributeValue}
								suggestions={selectedAttribute?.values ?? []}
								applyFilter={(attributeValue) =>
									updateFilters(selectedAttributeKey || undefined, attributeValue)
								}
							/>

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

function AttributeValueFilter({
	attributeKey,
	attributeValue,
	suggestions,
	applyFilter,
}: {
	attributeKey: string;
	attributeValue: string;
	suggestions: string[];
	applyFilter: (attributeValue?: string) => void;
}) {
	const [value, setValue] = useState(attributeValue);

	return (
		<form
			className="flex w-full gap-2 sm:w-auto"
			onSubmit={(event) => {
				event.preventDefault();

				applyFilter(value.trim() || undefined);
			}}
		>
			<Combobox<string>
				aria-label="Filter runs by attribute value"
				className="min-w-0 flex-1 sm:w-44 sm:flex-none"
				disabled={!attributeKey}
				options={suggestions}
				value={value || undefined}
				onChange={(selectedValue) => {
					const nextValue = selectedValue ?? '';

					setValue(nextValue);
					applyFilter(nextValue.trim() || undefined);
				}}
				onQueryChange={setValue}
				displayValue={(selectedValue) => selectedValue ?? ''}
				placeholder="Any value"
			>
				{(suggestion) => <ComboboxOption value={suggestion}>{suggestion}</ComboboxOption>}
			</Combobox>

			<Button type="submit" outline disabled={!attributeKey} className="cursor-pointer">
				Apply
			</Button>
		</form>
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
