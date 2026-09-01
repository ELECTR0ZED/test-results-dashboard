import { Divider } from '@/components/catalyst/divider';
import { Subheading } from '@/components/catalyst/heading';
import { Text } from '@/components/catalyst/text';
import type { Metadata } from 'next';
import RunSummary from './runSummary';
import SpecsTable from './specsList';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = {
	title: 'Project Run Details',
};

export default function ProjectRunDetails() {
	return (
		<>
			<RunSummary />

			<div className="mt-10">
				<Subheading>Specs</Subheading>
				<Text className="mt-1">Results grouped by spec file.</Text>
			</div>

			<Divider className="my-6" />

			<SpecsTable />
		</>
	);
}
