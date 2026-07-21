import {
	CreateProject,
	EditProject,
	PublicIngestKeySchema,
	Project,
	ProjectSchema,
	PublicIngestKey,
	IngestionKeyCreatedResponse,
	IngestionKeyCreatedResponseSchema,
} from '@electr0zed/test-results-dashboard-api-types';
import { z } from 'zod';
import { apiRequest, type ApiFetcher } from './core';

type Options = {
	apiFetcher?: ApiFetcher;
};

export function getProjects(options: Options = {}): Promise<Project[]> {
	return apiRequest('/api/projects', z.array(ProjectSchema), {
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

export function getProjectIngestionKeys(
    publicId: string,
    options: Options = {},
): Promise<PublicIngestKey[]> {
    return apiRequest(`/api/projects/${publicId}/ingestion-keys`, z.array(PublicIngestKeySchema), {
        method: 'GET',
        apiFetcher: options.apiFetcher,
    });
}

export function createIngestionKey(
	publicId: string,
	name: string,
	expiresAt: Date | null,
	options: Options = {},
): Promise<IngestionKeyCreatedResponse> {
	return apiRequest(`/api/projects/${publicId}/ingestion-keys`, IngestionKeyCreatedResponseSchema, {
		method: 'POST',
		body: {
			name,
			expiresAt,
		},
		apiFetcher: options.apiFetcher,
	});
}

export function revokeIngestionKey(
	publicId: string,
	keyPublicId: string,
	options: Options = {},
): Promise<null> {
	return apiRequest(`/api/projects/${publicId}/ingestion-keys/${keyPublicId}/revoke`, z.null(), {
		method: 'POST',
		apiFetcher: options.apiFetcher,
	});
}

export function deleteIngestionKey(
	publicId: string,
	keyPublicId: string,
	options: Options = {},
): Promise<null> {
	return apiRequest(`/api/projects/${publicId}/ingestion-keys/${keyPublicId}`, z.null(), {
		method: 'DELETE',
		apiFetcher: options.apiFetcher,
	});
}
