# Architecture — Agency Hosting profile

栖序保持模块化单体结构，但运行环境面向托管型 Agency Hosting，而不是 VPS。

```text
Browser -> static Next.js export -> PHP 8.2 /api/v1 -> MySQL 8
                                                   |-> WooCommerce REST API
hPanel Cron (UTC, every 5 minutes) -> PHP CLI -> MySQL task claims -> bounded sync page
```

## Boundaries

- `apps/web` owns presentation and browser state. It never connects to MySQL or providers.
- `apps/api` owns HTTP, secure sessions, CSRF, validation, orchestration, provider calls, and the task runner.
- MySQL is the durable operational store and the queue-of-record for short, idempotent tasks.
- WooCommerce remains the source of truth for catalog and commerce facts.
- `packages/shared` contains pure calculations only.

## Deliberately removed

- No PostgreSQL or PostgreSQL-specific schema features.
- No Redis cache/session store.
- No BullMQ, daemon worker, websocket stream, or seconds-level scheduling.
- No Docker or Compose deployment.
- No long-running bulk sync. Provider data is fetched in pages and continued by later Cron invocations.

The MySQL runner uses `GET_LOCK`, transactional claims, idempotency keys, bounded batches, and retry backoff. It is designed for one shared-hosting Cron process, not high-throughput distributed job execution.
