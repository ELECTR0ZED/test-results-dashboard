import type { RunInfo } from '@electr0zed/test-results-dashboard-core';

export function mapRunMetadata(run: RunInfo) {
	return {
		name: run.name,
		branch: run.branch,
		commitSha: run.commitSha,
		commitMessage: run.commitMessage,
		environment: run.environment,
		machineId: run.machineId,
		shardId: run.shardId,
		group: run.group,
		parallel: run.parallel,
	};
}

export function mapRunAttributes(attributes: RunInfo['attributes']) {
	return (attributes ?? []).map((attribute, position) => ({
		key: attribute.key,
		value: attribute.value,
		showOnRunList: attribute.showOnRunList,
		position,
	}));
}
