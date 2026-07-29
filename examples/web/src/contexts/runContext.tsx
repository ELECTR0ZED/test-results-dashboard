'use client';

import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
	type ReactNode,
} from 'react';
import type { Run } from '@electr0zed/test-results-dashboard-api-types';
import { getProjectRun } from '@/lib/api/runs';

type RunContextValue = {
	run: Run;
	refreshRun: () => Promise<void>;
	setRun: (run: Run) => void;
};

const RunContext = createContext<RunContextValue | undefined>(undefined);

type RunProviderProps = {
	projectId: string;
	runId: string;
	initialRun: Run;
	children: ReactNode;
};

export function RunProvider({
	projectId,
	runId,
	initialRun,
	children,
}: RunProviderProps) {
	const [run, setRun] = useState(initialRun);

	const refreshRun = useCallback(async () => {
		const response = await getProjectRun(projectId, runId);

		setRun(response.data);
	}, [projectId, runId]);

	const value = useMemo(() => ({
		run,
		refreshRun,
		setRun,
	}), [run, refreshRun]);

	return (
		<RunContext.Provider value={value}>
			{children}
		</RunContext.Provider>
	);
}

export function useRun(): RunContextValue {
	const context = useContext(RunContext);

	if (!context) {
		throw new Error('useRun must be used within a RunProvider');
	}

	return context;
}