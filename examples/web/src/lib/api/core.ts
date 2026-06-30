import { z } from 'zod';
import type { ApiResponse } from '@electr0zed/test-results-dashboard-api-types';

export type ApiFetcher = (
	path: string,
	init: RequestInit,
) => Promise<Response>;

export type ApiRequestOptions = Omit<RequestInit, 'body'> & {
	body?: unknown;
	apiFetcher?: ApiFetcher;
};

const defaultFetcher: ApiFetcher = (path, init) => {
	return fetch(path, init);
};

export async function apiRequest<T>(
	path: string,
	schema: z.Schema<T>,
	options: ApiRequestOptions = {},
): Promise<T> {
	const {
		body,
		apiFetcher = defaultFetcher,
		...requestOptions
	} = options;

	const headers = new Headers(requestOptions.headers);

	if (body !== undefined && !headers.has('Content-Type')) {
		headers.set('Content-Type', 'application/json');
	}

	const response = await apiFetcher(path, {
		...requestOptions,
		headers,
		body: body === undefined
			? undefined
			: JSON.stringify(body),
	});

	const json = await response.json() as ApiResponse<unknown>;

	if (!response.ok || !json.success) {
		throw new Error(!json.success ? json.error.message : 'API request failed');
	}

	try {
		return schema.parse(json.data);
	} catch (error) {
		console.error('Failed to parse API response:', error);
		throw new Error('Failed to parse API response');
	}
}