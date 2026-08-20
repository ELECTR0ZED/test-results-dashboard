import { Divider } from '@/components/catalyst/divider';
import { Heading } from '@/components/catalyst/heading';
import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Project Overview',
};

export default async function ProjectOverview() {
	return (
		<>
			<Heading>Project Overview</Heading>
			<Divider className="my-10 mt-6" />
		</>
	);
}
