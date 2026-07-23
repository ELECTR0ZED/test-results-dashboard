import React from 'react';
import { Divider } from '@/components/catalyst/divider';
import { Heading } from '@/components/catalyst/heading';
import { Metadata } from 'next';
import ProjectRunsTable from './projectRunsTable';

export const metadata: Metadata = {
  title: 'Project Runs',
}

type ProjectRunsPageProps = {
	searchParams: Promise<{
		page?: string;
		query?: string;
		status?: string;
	}>;
};

export default async function ProjectRuns({
    searchParams,
}: ProjectRunsPageProps) {
  const params = await searchParams;

  const parsedPage = Number.parseInt(params.page ?? '1', 10);
	const page = Number.isInteger(parsedPage) && parsedPage > 0
		? parsedPage
		: 1;

  return (
    <>
      <Heading>Project Runs</Heading>
      <Divider className="my-10 mt-6" />

      <ProjectRunsTable currentPage={page} />
    </>
  )
}
