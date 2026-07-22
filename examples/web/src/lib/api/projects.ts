import {
	CreateProject,
	EditProject,
	Project,
	ProjectSchema,
} from '@electr0zed/test-results-dashboard-api-types';
import { z } from 'zod';
import { apiRequest, type ApiFetcher } from './core';

const ProjectsSchema = z.array(ProjectSchema);

type Options = {
	apiFetcher?: ApiFetcher;
};

export function getProjects(options: Options = {}): Promise<Project[]> {
	return apiRequest('/api/projects', ProjectsSchema, {
		cache: 'no-store',
        apiFetcher: options.apiFetcher,
	});
}

export function getProject(
	publicId: string,
	options: Options = {},
): Promise<Project> {
	return apiRequest(`/api/projects/${publicId}`, ProjectSchema, {
		cache: 'no-store',
        apiFetcher: options.apiFetcher,
	});
}

export function createProject(
	project: CreateProject,
	options: Options = {},
): Promise<Project> {
	return apiRequest('/api/projects', ProjectSchema, {
		method: 'POST',
		body: project,
        apiFetcher: options.apiFetcher,
	});
}

export function editProject(
	publicId: string,
	project: EditProject,
	options: Options = {},
): Promise<Project> {
	return apiRequest(`/api/projects/${publicId}`, ProjectSchema, {
		method: 'PATCH',
		body: project,
        apiFetcher: options.apiFetcher,
	});
}

export function deleteProject(
    publicId: string,
    options: Options = {},
): Promise<null> {
    return apiRequest(`/api/projects/${publicId}`, z.null(), {
        method: 'DELETE',
        apiFetcher: options.apiFetcher,
    });
}
