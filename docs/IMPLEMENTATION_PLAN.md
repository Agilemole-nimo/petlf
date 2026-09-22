# Implementation plan

1. Establish contracts: architecture, modules, schema, API, UX, design tokens.
2. Bootstrap workspace, database package, structured logging, configuration and health.
3. Implement secure session authentication and permission guards.
4. Implement commerce repositories/services and paged WooCommerce sync through MySQL task records.
5. Implement Google adapters and normalized analytics aggregation.
6. Deliver dashboard and product-intelligence APIs and responsive web UI.
7. Add integration configuration, health/log views, 问问栖序 and hPanel Cron schedules.
8. Add unit, integration, and critical Playwright coverage.
9. Validate static export, PHP syntax, MySQL migrations, secrets, accessibility, responsive behavior, and operations docs.

Every stage keeps disconnected, loading, empty, syncing, degraded, and error states explicit.
