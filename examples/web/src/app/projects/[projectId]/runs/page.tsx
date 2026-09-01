import { Divider } from '@/components/catalyst/divider';
import { Heading } from '@/components/catalyst/heading';
import { Text } from '@/components/catalyst/text';
import type { Metadata } from 'next';
import ProjectRunsList from './projectRunsList';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = {
	title: 'Project Runs',
};

export default function ProjectRuns() {
	return (
		<>
			<Heading>Project Runs</Heading>

			<Text className="mt-2">Review recent test executions and their results.</Text>

			<Divider className="my-6" />

			<ProjectRunsList />
		</>
	);
}
