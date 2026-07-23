import React from 'react';
import { Divider } from '@/components/catalyst/divider';
import { Heading } from '@/components/catalyst/heading';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Project Run Details',
}

export default async function ProjectRunDetails() {

  return (
    <>
      <Heading>Project Run Details</Heading>
      <Divider className="my-10 mt-6" />
    </>
  )
}
