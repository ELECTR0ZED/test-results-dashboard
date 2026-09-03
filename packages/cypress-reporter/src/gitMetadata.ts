import { execFileSync } from 'node:child_process';

export interface GitMetadata {
	branch?: string;
	commitSha?: string;
	commitMessage?: string;
}

const BRANCH_MAX_LENGTH = 255;
const COMMIT_SHA_MAX_LENGTH = 128;
const COMMIT_MESSAGE_MAX_LENGTH = 4_096;

export function resolveGitMetadata(
	projectRoot: string,
	overrides: GitMetadata = {}
): GitMetadata {
	return {
		branch:
			normalizeBranch(overrides.branch) ??
			normalizeBranch(getEnvironmentBranch()) ??
			normalizeBranch(runGit(projectRoot, ['branch', '--show-current'])),
		commitSha:
			normalizeValue(overrides.commitSha, COMMIT_SHA_MAX_LENGTH) ??
			normalizeValue(getEnvironmentCommitSha(), COMMIT_SHA_MAX_LENGTH) ??
			normalizeValue(
				runGit(projectRoot, ['rev-parse', 'HEAD']),
				COMMIT_SHA_MAX_LENGTH
			),
		commitMessage:
			normalizeValue(
				overrides.commitMessage,
				COMMIT_MESSAGE_MAX_LENGTH
			) ??
			normalizeValue(
				getEnvironmentCommitMessage(),
				COMMIT_MESSAGE_MAX_LENGTH
			) ??
			normalizeValue(
				runGit(projectRoot, [
					'show',
					'-s',
					'--format=%B',
					'HEAD',
				]),
				COMMIT_MESSAGE_MAX_LENGTH
			),
	};
}

function getEnvironmentBranch(): string | undefined {
	return getFirstEnvironmentValue(
		// Explicit Cypress-compatible values
		'COMMIT_INFO_BRANCH',

		// Azure DevOps
		'SYSTEM_PULLREQUEST_SOURCEBRANCH',
		'BUILD_SOURCEBRANCH',

		// GitHub Actions
		'GITHUB_HEAD_REF',
		'GITHUB_REF_NAME',

		// GitLab
		'CI_COMMIT_REF_NAME',

		// CircleCI
		'CIRCLE_BRANCH',

		// Bitbucket Pipelines
		'BITBUCKET_BRANCH',

		// Jenkins
		'BRANCH_NAME'
	);
}

function getEnvironmentCommitSha(): string | undefined {
	return getFirstEnvironmentValue(
		'COMMIT_INFO_SHA',

		// Azure DevOps
		'BUILD_SOURCEVERSION',

		// GitHub Actions
		'GITHUB_SHA',

		// GitLab
		'CI_COMMIT_SHA',

		// CircleCI
		'CIRCLE_SHA1',

		// Bitbucket Pipelines
		'BITBUCKET_COMMIT',

		// Jenkins
		'GIT_COMMIT'
	);
}

function getEnvironmentCommitMessage(): string | undefined {
	return getFirstEnvironmentValue(
		'COMMIT_INFO_MESSAGE',

		// Azure DevOps
		'BUILD_SOURCEVERSIONMESSAGE',

		// GitLab
		'CI_COMMIT_MESSAGE'
	);
}

function getFirstEnvironmentValue(
	...names: string[]
): string | undefined {
	for (const name of names) {
		const value = process.env[name]?.trim();

		if (value) {
			return value;
		}
	}

	return undefined;
}

function runGit(
	projectRoot: string,
	args: string[]
): string | undefined {
	try {
		const value = execFileSync('git', args, {
			cwd: projectRoot,
			encoding: 'utf8',
			stdio: ['ignore', 'pipe', 'ignore'],
		});

		return value.trim() || undefined;
	} catch {
		return undefined;
	}
}

function normalizeBranch(
	value: string | undefined
): string | undefined {
	const normalized = normalizeValue(
		value,
		BRANCH_MAX_LENGTH
	)
		?.replace(/^refs\/heads\//, '')
		.replace(/^refs\/remotes\/origin\//, '')
		.replace(/^origin\//, '');

	if (!normalized || normalized === 'HEAD') {
		return undefined;
	}

	return normalized;
}

function normalizeValue(
	value: string | undefined,
	maxLength: number
): string | undefined {
	const normalized = value?.trim();

	if (!normalized) {
		return undefined;
	}

	return normalized.slice(0, maxLength);
}