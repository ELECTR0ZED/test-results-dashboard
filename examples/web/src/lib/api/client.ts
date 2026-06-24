import { z } from 'zod';
import type { ApiResponse } from '@electr0zed/test-results-dashboard-api-types';

type ApiRequestOptions = Omit<RequestInit, 'body'> & {
	body?: unknown;
};

export async function apiRequest<T>(
	path: string,
	schema: z.Schema<T>,
	options: ApiRequestOptions = {},
): Promise<T> {
	const headers = new Headers(options.headers);

	if (options.body !== undefined && !headers.has('Content-Type')) {
		headers.set('Content-Type', 'application/json');
	}

	const response = await fetch(path, {
		...options,
		headers,
		body: options.body === undefined
			? undefined
			: JSON.stringify(options.body),
	});

	const json = await response.json() as ApiResponse<unknown>;

	if (!response.ok || !json.success) {
		throw new Error(!json.success ? json.error.message : 'API request failed');
	}

    let parsedData: T;

    try {
        parsedData = schema.parse(json.data);
    } catch (error) {
        console.error('Failed to parse API response:', error);
        throw new Error('Failed to parse API response');
    }

	return parsedData;
}