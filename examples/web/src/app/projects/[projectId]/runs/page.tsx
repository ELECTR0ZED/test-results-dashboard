import React from 'react';
import { Divider } from '@/components/catalyst/divider';
import { Heading } from '@/components/catalyst/heading';
import { Metadata } from 'next';
import ProjectRunsTable from './projectRunsTable';

export const metadata: Metadata = {
  title: 'Project Runs',
}

export default async function ProjectRuns() {

  return (
    <>
      <Heading>Project Runs</Heading>
      <Divider className="my-10 mt-6" />

      <ProjectRunsTable />
    </>
  )
}
