import 'server-only';

import {
    getProjectIngestionKeys as getProjectIngestionKeysBase,
    createIngestionKey as createIngestionKeyBase,
    revokeIngestionKey as revokeIngestionKeyBase,
    deleteIngestionKey as deleteIngestionKeyBase,
} from './ingestionKeys';
import { serviceBindingFetcher } from './core.server';

export function getProjectIngestionKeys(publicId: string) {
	return getProjectIngestionKeysBase(publicId, {
		apiFetcher: serviceBindingFetcher,
	});
}

export function createIngestionKey(
	publicId: string,
	name: string,
	expiresAt: Date | null,
) {
	return createIngestionKeyBase(publicId, name, expiresAt, {
		apiFetcher: serviceBindingFetcher,
	});
}

export function revokeIngestionKey(
	publicId: string,
	keyPublicId: string,
) {
	return revokeIngestionKeyBase(publicId, keyPublicId, {
		apiFetcher: serviceBindingFetcher,
	});
}

export function deleteIngestionKey(
	publicId: string,
	keyPublicId: string,
) {
	return deleteIngestionKeyBase(publicId, keyPublicId, {
		apiFetcher: serviceBindingFetcher,
	});
}