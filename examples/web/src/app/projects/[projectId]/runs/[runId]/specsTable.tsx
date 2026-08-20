'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useProject } from '@/contexts/projectContext';
import { DEFAULT_PAGE_SIZE, PaginationMeta, FullSpec } from '@electr0zed/test-results-dashboard-api-types';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/catalyst/table';
import { useToast } from '@/contexts/toastContext';
import { useSearchParams } from "next/navigation";
import { Paginator } from '@/components/paginator';
import { getRunSpecs } from '@/lib/api/specs';
import { useRun } from '@/contexts/runContext';
import { SpecCard } from '@/components/specCard';

export default function SpecsList() {
    const searchParams = useSearchParams();
    const { project } = useProject();
    const { run } = useRun();
    const { addToast } = useToast();
    const [specs, setSpecs] = useState<FullSpec[]>([]);
    const [pagination, setPagination] = useState<PaginationMeta>({
        page: 1,
        pageSize: DEFAULT_PAGE_SIZE,
        total: 0,
        totalPages: 0,
    });
    const [loading, setLoading] = useState(true);

    const fetchSpecs = useCallback(async (page: number) => {
        setLoading(true);
        setSpecs([]);
        try {
            const response = await getRunSpecs(project.publicId, run.publicId, page, pagination.pageSize);
            setSpecs(response.data);
            setPagination(response.meta.pagination);
        } catch (error) {
            addToast('Failed to fetch specs', error instanceof Error ? error.message : 'Unknown error', 'error');
        } finally {
            setLoading(false);
        }
    }, [project.publicId, run.publicId, addToast, pagination.pageSize]);

    useEffect(() => {
        const currentPage = Number.parseInt(searchParams.get('page') ?? '1', 10);
        fetchSpecs(currentPage);
    }, [fetchSpecs, searchParams]);

    return (
        <>
            <div className="space-y-4">
				{loading ? (
					<SpecsLoadingState />
				) : specs.length === 0 ? (
					<div className="rounded-xl border border-dashed border-zinc-950/10 px-6 py-12 text-center text-sm text-zinc-500 dark:border-white/10 dark:text-zinc-400">
						No specs have been recorded for this run.
					</div>
				) : (
					specs.map((spec) => (
						<SpecCard key={spec.id} spec={spec} />
					))
				)}
			</div>
            
            <Paginator
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                pathname={`/projects/${project.publicId}/runs/${run.publicId}`}
            />
        </>
    )
}

function SpecsLoadingState() {
	return (
		<div className="space-y-4" aria-label="Loading specs">
			{Array.from({ length: 3 }).map((_, index) => (
				<div
					key={index}
					className="h-24 animate-pulse rounded-xl bg-zinc-950/5 dark:bg-white/5"
				/>
			))}
		</div>
	);
}