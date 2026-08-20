import { Divider } from '@/components/catalyst/divider';
import { Heading } from '@/components/catalyst/heading';
import { Metadata } from 'next';
import ProjectSettingsClient from './projectSettingsClient';

export const metadata: Metadata = {
	title: 'Project Settings',
};

export default async function ProjectSettings() {
	return (
		<>
			<Heading>Project Settings</Heading>
			<Divider className="my-10 mt-6" />

			<ProjectSettingsClient />
		</>
	);
}
