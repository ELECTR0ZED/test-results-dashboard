import React from 'react';
import { Divider } from '@/components/catalyst/divider';
import { Heading } from '@/components/catalyst/heading';
import { ApiSuccess, Project } from '@electr0zed/test-results-dashboard-api-types';
import Link from 'next/link';

async function getProjects(): Promise<Project[]> {
	const response = await fetch('/api/projects', {
		cache: 'no-store',
	});

	const json = await response.json() as ApiSuccess<Project[]>;

	return json.data;
}

export default async function Projects() {
	const projects = await getProjects();

  return (
    <>
      <Heading>Projects</Heading>
      <Divider className="my-10 mt-6" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {projects.map((project) => (
          <div key={project.id} className="rounded-lg border border-gray-300 p-4 shadow-sm">
            <Link href={`/projects/${project.publicId}`} className="text-blue-500 hover:underline">
              <h2 className="text-lg font-semibold">{project.name}</h2>
            </Link>
          </div>
        ))}
      </div>
    </>
  )
}
