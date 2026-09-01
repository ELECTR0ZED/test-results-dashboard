import { Heading } from '@/components/catalyst/heading';
import { Text } from '@/components/catalyst/text';
import type { Metadata } from 'next';
import ProjectSettingsClient from './projectSettingsClient';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = {
	title: 'Project Settings',
};

export default async function ProjectSettings() {
	return (
		<div>
			<Heading>Project settings</Heading>
			<Text className="mt-2">Manage project identity, ingestion access, and stored test results.</Text>

			<ProjectSettingsClient />
		</div>
	);
}