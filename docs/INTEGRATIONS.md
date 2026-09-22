# Integrations

Every provider implements `IntegrationAdapter`: `connect`, `disconnect`, `testConnection`, `sync`, and `getStatus`. Provider DTOs are validated and normalized before application services persist them.

- WooCommerce: REST API with consumer credentials, incremental `modified_after` sync, idempotent upsert by `(source, externalId)`. It owns catalog and transaction facts.
- GA4: direct Google OAuth 2.0 connection with the read-only Analytics scope. The callback verifies accessible Analytics accounts and encrypts the token. No WordPress plugin is involved.
- Search Console: direct Google OAuth 2.0 connection with `webmasters.readonly`. The callback verifies accessible Search Console properties and encrypts the token. No WordPress plugin is involved.

Missing credentials return `NOT_CONFIGURED`; temporary upstream failure returns `DEGRADED` and never crashes unrelated dashboard panels. Manual sync creates the same idempotent MySQL task records as scheduled runs.

The initial Google implementation connects and verifies access only. It does not automatically import historical reports. GA4 data collection and Search Analytics imports can be added later as bounded Cron tasks using the stored refresh tokens.
