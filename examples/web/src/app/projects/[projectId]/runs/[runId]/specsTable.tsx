'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useProject } from '@/contexts/projectContext';
import { DEFAULT_PAGE_SIZE, PaginationMeta, Spec } from '@electr0zed/test-results-dashboard-api-types';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/catalyst/table';
import { useToast } from '@/contexts/toastContext';
import { useSearchParams } from "next/navigation";
import { Paginator } from '@/components/paginator';
import { getRunSpecs } from '@/lib/api/specs';
import { useRun } from '@/contexts/runContext';

export default function SpecsTable() {
    const searchParams = useSearchParams();
    const { project } = useProject();
    const { run } = useRun();
    const { addToast } = useToast();
    const [specs, setSpecs] = useState<Spec[]>([]);
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
            addToast('Failed to fetch runs', error instanceof Error ? error.message : 'Unknown error', 'error');
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
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Tests</TableCell>
                        <TableCell>Passed</TableCell>
                        <TableCell>Failed</TableCell>
                        <TableCell>Pending</TableCell>
                        <TableCell>Skipped</TableCell>
                        <TableCell>Duration</TableCell>
                        <TableCell>Status</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {loading ? (
                        <TableRow className="animate-pulse mx-auto">
                            <TableCell colSpan={4}>Loading...</TableCell>
                        </TableRow>
                    ) : specs.length === 0 ? (
                        <TableRow className='mx-auto'>
                            <TableCell colSpan={4}>No tests have been run yet.</TableCell>
                        </TableRow>
                    ) : (
                        specs.map((spec) => {
                            return (
                                <TableRow key={spec.id} href={`/projects/${project.publicId}/runs/${run.publicId}`}>
                                    <TableCell>{spec.filename}</TableCell>
                                    <TableCell>{spec.tests}</TableCell>
                                    <TableCell>{spec.passed}</TableCell>
                                    <TableCell>{spec.failed}</TableCell>
                                    <TableCell>{spec.pending}</TableCell>
                                    <TableCell>{spec.skipped}</TableCell>
                                    <TableCell>{spec.duration}</TableCell>
                                    <TableCell>{spec.status}</TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
            <Paginator
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                pathname={`/projects/${project.publicId}/runs/${run.publicId}`}
            />
        </>
    )
}
