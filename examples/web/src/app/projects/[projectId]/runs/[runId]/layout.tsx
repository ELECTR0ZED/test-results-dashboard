import 'server-only';

import { notFound } from 'next/navigation';
import { RunProvider } from '@/contexts/runContext';
import { getProjectRun } from '@/lib/api/runs.server';

export default async function RunLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{
		projectId: string;
		runId: string;
	}>;
}) {
	const { projectId, runId } = await params;

	let run;

	try {
		run = await getProjectRun(projectId, runId);
	} catch {
		notFound();
	}

	return (
		<RunProvider
			projectId={projectId}
			runId={runId}
			initialRun={run.data}
		>
			{children}
		</RunProvider>
	);
}