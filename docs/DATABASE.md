# MySQL database design

The canonical schema is the ordered set in `apps/api/database/migrations/*.sql`. It targets MySQL 8 with InnoDB, `utf8mb4`, UTC `DATETIME(3)` values, `CHAR(36)` UUIDs, explicit provider/external IDs, compound uniqueness, and foreign keys.

Production tables cover tenants, sites, users/sessions, site-scoped products/inventory/costs, integrations/credentials/sync logs, recoverable site-scoped automation runs, and audit logs. High-volume analytics and additional business modules remain disabled until their real provider workflows are implemented; the system does not ship placeholder production data.

All schema changes are append-only reviewed SQL migrations. Never edit production tables manually. Credentials are encrypted application-side with Sodium secretbox; passwords use Argon2id; session and CSRF tokens are stored only as hashes.
