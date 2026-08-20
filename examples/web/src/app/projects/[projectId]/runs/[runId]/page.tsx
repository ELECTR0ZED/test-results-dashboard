import type { Metadata } from 'next';
import { Divider } from '@/components/catalyst/divider';
import { Subheading } from '@/components/catalyst/heading';
import { Text } from '@/components/catalyst/text';
import RunSummary from './runSummary';
import SpecsTable from './specsList';

export const metadata: Metadata = {
	title: 'Project Run Details',
};

export default function ProjectRunDetails() {
	return (
		<>
			<RunSummary />

			<div className="mt-10">
				<Subheading>Specs</Subheading>
				<Text className="mt-1">
					Results grouped by Cypress spec file.
				</Text>
			</div>

			<Divider className="my-6" />

			<SpecsTable />
		</>
	);
}