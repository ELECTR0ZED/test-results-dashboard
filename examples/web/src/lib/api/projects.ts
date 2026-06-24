import {
	CreateProject,
	EditProject,
	Project,
	ProjectSchema,
} from '@electr0zed/test-results-dashboard-api-types';
import { z } from 'zod';
import { apiRequest } from './client';

const ProjectsSchema = z.array(ProjectSchema);

export function getProjects(): Promise<Project[]> {
	return apiRequest('/api/projects', ProjectsSchema, {
		cache: 'no-store',
	});
}

export function getProject(publicId: string): Promise<Project> {
	return apiRequest(`/api/projects/${publicId}`, ProjectSchema, {
		cache: 'no-store',
	});
}

export function createProject(project: CreateProject): Promise<Project> {
	return apiRequest('/api/projects', ProjectSchema, {
		method: 'POST',
		body: project,
	});
}

export function editProject(
	publicId: string,
	project: EditProject,
): Promise<Project> {
	return apiRequest(`/api/projects/${publicId}`, ProjectSchema, {
		method: 'PATCH',
		body: project,
	});
}