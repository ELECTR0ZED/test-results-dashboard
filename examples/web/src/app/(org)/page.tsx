import React from 'react';
import { Divider } from '@/components/catalyst/divider';
import { Heading } from '@/components/catalyst/heading';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Home',
}

export default async function Home() {

  return (
    <>
      <Heading>Home</Heading>
      <Divider className="my-10 mt-6" />
    </>
  )
}
