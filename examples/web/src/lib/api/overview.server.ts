import 'server-only';

import { OverviewPeriodDays } from '@electr0zed/test-results-dashboard-api-types';
import { serviceBindingFetcher } from './core.server';
import { getProjectOverview as getProjectOverviewBase } from './overview';

export function getProjectOverview(publicId: string, days: OverviewPeriodDays) {
	return getProjectOverviewBase(publicId, days, {
		apiFetcher: serviceBindingFetcher,
	});
}
