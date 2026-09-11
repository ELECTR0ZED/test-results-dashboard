import { Divider } from '@/components/catalyst/divider';
import { Subheading } from '@/components/catalyst/heading';
import { Text } from '@/components/catalyst/text';
import type { Metadata } from 'next';
import RunRefreshButton from './runRefreshButton';
import RunSummary from './runSummary';
import SpecsTable from './specsList';

export const metadata: Metadata = {
	title: 'Project Run Details',
};

export default function ProjectRunDetails() {
	return (
		<>
			<RunSummary />

			<div className="mt-6 flex items-end justify-between gap-4">
				<div>
					<Subheading>Specs</Subheading>
					<Text className="mt-1">Results grouped by spec file.</Text>
				</div>

				<RunRefreshButton />
			</div>

			<Divider className="my-4" />

			<SpecsTable />
		</>
	);
}
