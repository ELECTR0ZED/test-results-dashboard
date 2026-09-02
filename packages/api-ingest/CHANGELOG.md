# @electr0zed/test-results-dashboard-api-ingest

## 0.5.0

### Minor Changes

- 9f2169f: Add custom run names and filterable run attributes, persist the Cypress reporter metadata that was previously discarded, and expose the new run metadata throughout the dashboard API and web interface.

### Patch Changes

- Updated dependencies [9f2169f]
  - @electr0zed/test-results-dashboard-core@0.5.0
  - @electr0zed/test-results-dashboard-db@0.6.0

## 0.4.1

### Patch Changes

- 937bcc3: Return aggregated statistics from single-run dashboard responses, add project overview APIs and shared schemas for 7, 14, 30, 60, and 90-day test health and duration trends, and update run activity only after complete spec ingestion so live dashboard refreshes cannot observe partially written results.

## 0.4.0

### Minor Changes

- 2d33038: Add project run and spec result APIs, paginated dashboard data, stale-run timeout handling, project-scoped ingestion, detailed test results, and updated database models and indexes.

### Patch Changes

- Updated dependencies [2d33038]
  - @electr0zed/test-results-dashboard-core@0.4.0
  - @electr0zed/test-results-dashboard-db@0.5.0

## 0.3.0

### Minor Changes

- 81971ec: Introduce per project ingestion keys

### Patch Changes

- Updated dependencies [81971ec]
  - @electr0zed/test-results-dashboard-core@0.3.0
  - @electr0zed/test-results-dashboard-db@0.4.0

## 0.2.1

### Patch Changes

- Updated dependencies [8e4d755]
  - @electr0zed/test-results-dashboard-db@0.3.0

## 0.2.0

### Minor Changes

- f400772: Introduce projects

### Patch Changes

- Updated dependencies [f400772]
  - @electr0zed/test-results-dashboard-core@0.2.0
  - @electr0zed/test-results-dashboard-db@0.2.0

## 0.1.3

### Patch Changes

- Updated dependencies [38af6aa]
  - @electr0zed/test-results-dashboard-core@0.1.1

## 0.1.2

### Patch Changes

- f408e1d: Increase error logging

## 0.1.1

### Patch Changes

- dd5f8f6: Fix internal dependency reference
