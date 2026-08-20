'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useProject } from '@/contexts/projectContext';
import { DEFAULT_PAGE_SIZE, PaginationMeta, RunWithStats } from '@electr0zed/test-results-dashboard-api-types';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/catalyst/table';
import { useToast } from '@/contexts/toastContext';
import { getProjectRuns } from '@/lib/api/runs';
import { useSearchParams } from "next/navigation";
import { Paginator } from '@/components/paginator';
import { RunResults } from '@/components/runResults';

export default function ProjectRunsTable() {
    const searchParams = useSearchParams();
    const { project } = useProject();
    const { addToast } = useToast();
    const [runs, setRuns] = useState<RunWithStats[]>([]);
    const [pagination, setPagination] = useState<PaginationMeta>({
        page: 1,
        pageSize: DEFAULT_PAGE_SIZE,
        total: 0,
        totalPages: 0,
    });
    const [loading, setLoading] = useState(true);

    const fetchRuns = useCallback(async (page: number) => {
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
    }, [project.publicId, addToast, pagination.pageSize]);

    useEffect(() => {
        const currentPage = Number.parseInt(searchParams.get('page') ?? '1', 10);
        fetchRuns(currentPage);
    }, [fetchRuns, searchParams]);

    return (
        <>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Framework</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Started At</TableCell>
                        <TableCell>Ended At</TableCell>
                        <TableCell>Results</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {loading ? (
                        <TableRow className="animate-pulse mx-auto">
                            <TableCell colSpan={5}>Loading...</TableCell>
                        </TableRow>
                    ) : runs.length === 0 ? (
                        <TableRow className='mx-auto'>
                            <TableCell colSpan={5}>No runs yet.</TableCell>
                        </TableRow>
                    ) : (
                        runs.map((run) => {
                            return (
                                <TableRow key={run.publicId} href={`/projects/${project.publicId}/runs/${run.publicId}`}>
                                    <TableCell>{run.framework} ({run.frameworkVersion})</TableCell>
                                    <TableCell>{run.status}</TableCell>
                                    <TableCell>{new Date(run.startedAt).toLocaleString()}</TableCell>
                                    <TableCell>{run.endedAt ? new Date(run.endedAt).toLocaleString() : 'Never'}</TableCell>
                                    <TableCell>
                                        <RunResults
                                            passed={run.stats.passed}
                                            failed={run.stats.failed}
                                            pending={run.stats.pending}
                                            skipped={run.stats.skipped}
                                        />
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>

            <div className="my-6 max-w-2xl mx-auto">
                <Paginator
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    pathname={`/projects/${project.publicId}/runs`}
                />
            </div>
        </>
    )
}
