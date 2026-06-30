'use client';

import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
	type ReactNode,
} from 'react';
import type { Project } from '@electr0zed/test-results-dashboard-api-types';
import { getProject } from '@/lib/api/projects';

type ProjectContextValue = {
	project: Project;
	refreshProject: () => Promise<void>;
	setProject: (project: Project) => void;
};

const ProjectContext = createContext<ProjectContextValue | undefined>(undefined);

type ProjectProviderProps = {
	projectId: string;
	initialProject: Project;
	children: ReactNode;
};

export function ProjectProvider({
	projectId,
	initialProject,
	children,
}: ProjectProviderProps) {
	const [project, setProject] = useState<Project>(initialProject);

	const refreshProject = useCallback(async () => {
		const project = await getProject(projectId);

		setProject(project);
	}, [projectId]);

	const value = useMemo(() => ({
		project,
		refreshProject,
		setProject,
	}), [project, refreshProject]);

	return (
		<ProjectContext.Provider value={value}>
			{children}
		</ProjectContext.Provider>
	);
}

export function useProject() {
	const context = useContext(ProjectContext);

	if (!context) {
		throw new Error('useProject must be used within a ProjectProvider');
	}

	return context;
}