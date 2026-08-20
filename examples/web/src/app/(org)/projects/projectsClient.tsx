'use client';

import { Divider } from '@/components/catalyst/divider';
import { Heading } from '@/components/catalyst/heading';
import { Text } from '@/components/catalyst/text';
import { useToast } from '@/contexts/toastContext';
import { getProjects } from '@/lib/api/projects';
import type { Project } from '@electr0zed/test-results-dashboard-api-types';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import CreateProject from './createProject';

export function ProjectsClient() {
	const { addToast } = useToast();
	const [projects, setProjects] = useState<Project[]>([]);
	const [loading, setLoading] = useState(true);

	const refreshProjects = useCallback(() => {
		setLoading(true);
		getProjects()
			.then((response) => setProjects(response.data))
			.catch((error) => {
				console.error(error);
				addToast('Failed to load projects', error.message, 'error');
			})
			.finally(() => {
				setLoading(false);
			});
	}, [addToast]);

	useEffect(() => {
		refreshProjects();
	}, [refreshProjects]);

	return (
		<>
			<div className="mx-auto flex w-full">
				<div className="w-1/2 pr-4">
					<Heading>Projects</Heading>
				</div>
				<div className="flex w-1/2 justify-end pr-4">
					<CreateProject refreshProjects={refreshProjects} />
				</div>
			</div>

			<Divider className="my-10 mt-6" />

			{loading && <Text className="text-center">Loading projects...</Text>}

			{!loading && projects.length === 0 && <Text className="text-center">No projects found.</Text>}

			{!loading && projects.length > 0 && (
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
					{projects.map((project) => (
						<div key={project.id} className="rounded-lg border border-gray-300 p-4 shadow-sm">
							<Link href={`/projects/${project.publicId}`} className="text-blue-500 hover:underline">
								<h2 className="text-lg font-semibold">{project.name}</h2>
							</Link>
						</div>
					))}
				</div>
			)}
		</>
	);
}
