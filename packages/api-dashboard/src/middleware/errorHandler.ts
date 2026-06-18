// src/middleware/error-handler.ts
import type { ErrorHandler } from 'hono';
import { ZodError } from 'zod';
import { ApiError, InternalServerError, ValidationError } from '../services/errors';
import { ApiFailure, ErrorCode } from '@electr0zed/test-results-dashboard-api-types';
import { z } from 'zod';

export const errorHandler: ErrorHandler = (err, c) => {
	if (err instanceof ZodError) {
		return c.json<ApiFailure>({
			success: false,
			error: {
				code: new ValidationError().code,
				message: new ValidationError().message,
				details: z.flattenError(err),
			},
		}, 400);
	}

	if (err instanceof ApiError) {
		return c.json<ApiFailure>({
			success: false,
			error: {
				code: err.code,
				message: err.message,
				...(err.details ? { details: err.details } : {}),
			},
		}, err.status);
	}

	console.error(err);

	return c.json<ApiFailure>({
		success: false,
		error: {
			code: new InternalServerError().code,
			message: new InternalServerError().message,
		},
	}, new InternalServerError().status);
};