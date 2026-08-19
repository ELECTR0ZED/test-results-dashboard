import 'server-only';

import type { ApiFetcher } from './core';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export const serviceBindingFetcher: ApiFetcher = (path, init) => {
    const { env } = getCloudflareContext();
    const url = new URL(path, 'https://api.internal');

    return env.API.fetch(new Request(url, init));
};