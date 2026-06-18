import type { ErrorCode } from "./errors.js";

export type ApiSuccess<T> = {
	success: true;
	data: T;
	meta?: ApiMeta;
};

export type ApiFailure = {
	success: false;
	error: ApiError;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export type ApiMeta = {
	pagination?: PaginationMeta;
};

export type PaginationMeta = {
	page: number;
	pageSize: number;
	total: number;
	totalPages: number;
};

export type ApiError = {
	code: ErrorCode;
	message: string;
	details?: unknown;
};