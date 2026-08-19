import React from 'react';
import { Divider } from '@/components/catalyst/divider';
import { Heading } from '@/components/catalyst/heading';
import { Metadata } from 'next';
import SpecsTable from './specsTable';

export const metadata: Metadata = {
  title: 'Project Run Details',
}

export default async function ProjectRunDetails() {

  return (
    <>
      <Heading>Project Run Details</Heading>
      <Divider className="my-10 mt-6" />

      <SpecsTable />
    </>
  )
}
