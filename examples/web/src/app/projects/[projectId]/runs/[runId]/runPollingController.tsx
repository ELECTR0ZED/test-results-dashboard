'use client';

import { useEffect } from 'react';
import { useRun } from '@/contexts/runContext';
import { getRunDisplayStatus } from '@/lib/runPresentation';

const POLLING_INTERVAL_MS = 15_000;

export default function RunPollingController() {
	const { run, refreshRun } = useRun();
	const displayStatus = getRunDisplayStatus(run);

	useEffect(() => {
		if (displayStatus !== 'running') {
			return;
		}

		const interval = window.setInterval(() => {
			void refreshRun().catch(() => undefined);
		}, POLLING_INTERVAL_MS);

		return () => window.clearInterval(interval);
	}, [displayStatus, refreshRun]);

	return null;
}