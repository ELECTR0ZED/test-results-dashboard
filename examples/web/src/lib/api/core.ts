import { z } from 'zod';
import type { ApiResponse, ApiSuccess } from '@electr0zed/test-results-dashboard-api-types';
import { getCloudflareContext } from '@opennextjs/cloudflare';

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

export type Options = {
	apiFetcher?: ApiFetcher;
};

export const serviceBindingFetcher: ApiFetcher = (path, init) => {
	const { env } = getCloudflareContext();
	const url = new URL(path, 'https://api.internal');

	return env.API.fetch(new Request(url, init));
};

export async function apiRequest<T>(
	path: string,
	schema: z.Schema<T>,
	options: ApiRequestOptions = {},
): Promise<ApiSuccess<T>> {
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
		const data = schema.parse(json.data);
		return {
			...json,
			data,
		}
	} catch (error) {
		console.error('Failed to parse API response:', error);
		throw new Error('Failed to parse API response');
	}
}