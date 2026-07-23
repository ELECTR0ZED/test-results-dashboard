'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useProject } from '@/contexts/projectContext';
import { PaginationMeta, Run } from '@electr0zed/test-results-dashboard-api-types';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/catalyst/table';
import { useToast } from '@/contexts/toastContext';
import { getProjectRuns } from '@/lib/api/runs';
import { Paginator } from '@/components/paginator';

type ProjectRunsTableProps = {
	currentPage: number;
};

export default function ProjectRunsTable({ currentPage }: ProjectRunsTableProps) {
    const { project } = useProject();
    const { addToast } = useToast();
    const [runs, setRuns] = useState<Run[]>([]);
    const [pagination, setPagination] = useState<PaginationMeta>({
        page: 1,
        pageSize: 25,
        total: 0,
        totalPages: 0,
    });
    const [loading, setLoading] = useState(true);

    const fetchRuns = useCallback(async (page: number) => {
        setLoading(true);
        setRuns([]);
        try {
            const response = await getProjectRuns(project.publicId, page, 25);
            setRuns(response.data);
            setPagination(response.meta?.pagination!);
        } catch (error) {
            addToast('Failed to fetch runs', error instanceof Error ? error.message : 'Unknown error', 'error');
        } finally {
            setLoading(false);
        }
    }, [project.publicId, addToast]);

    useEffect(() => {
        fetchRuns(currentPage);
    }, [fetchRuns, currentPage]);

    return (
        <>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Framework</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Started At</TableCell>
                        <TableCell>Ended At</TableCell>
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
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
            <Paginator
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                pathname={`/projects/${project.publicId}/runs`}
            />
        </>
    )
}
