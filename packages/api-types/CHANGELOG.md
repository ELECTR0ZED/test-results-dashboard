# @electr0zed/test-results-dashboard-api-types

## 0.7.0

### Minor Changes

- 9f2169f: Add custom run names and filterable run attributes, persist the Cypress reporter metadata that was previously discarded, and expose the new run metadata throughout the dashboard API and web interface.

## 0.6.0

### Minor Changes

- 937bcc3: Return aggregated statistics from single-run dashboard responses, add project overview APIs and shared schemas for 7, 14, 30, 60, and 90-day test health and duration trends, and update run activity only after complete spec ingestion so live dashboard refreshes cannot observe partially written results.

## 0.5.0

### Minor Changes

- 2d33038: Add project run and spec result APIs, paginated dashboard data, stale-run timeout handling, project-scoped ingestion, detailed test results, and updated database models and indexes.

## 0.4.0

### Minor Changes

- 81971ec: Introduce per project ingestion keys

## 0.3.0

### Minor Changes

- 8e4d755: Introduce package for dashboard api routes and logic
