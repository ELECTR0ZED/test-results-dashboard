import 'server-only';

import type {
	CreateProject,
	EditProject,
} from '@electr0zed/test-results-dashboard-api-types';
import { serviceBindingFetcher } from './core.server';
import {
	createProject as createProjectBase,
	editProject as editProjectBase,
	getProject as getProjectBase,
	getProjects as getProjectsBase,
	deleteProject as deleteProjectBase,
} from './projects';

export function getProjects() {
	return getProjectsBase({
		apiFetcher: serviceBindingFetcher,
	});
}

export function getProject(publicId: string) {
	return getProjectBase(publicId, {
		apiFetcher: serviceBindingFetcher,
	});
}

export function createProject(project: CreateProject) {
	return createProjectBase(project, {
		apiFetcher: serviceBindingFetcher,
	});
}

export function editProject(
	publicId: string,
	project: EditProject,
) {
	return editProjectBase(publicId, project, {
		apiFetcher: serviceBindingFetcher,
	});
}

export function deleteProject(publicId: string) {
    return deleteProjectBase(publicId, {
        apiFetcher: serviceBindingFetcher,
    });
}
