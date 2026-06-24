import React from 'react';
import { ProjectsClient } from './projectsClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Projects',
}

export default async function Projects() {

  return (
      <ProjectsClient />
  )
}
