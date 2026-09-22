# 栖序 · 多站运营台

Agency Hosting 版本：中文 Next.js 静态运营界面、模块化 PHP 8.2 REST API、MySQL 8 存储和短时 hPanel Cron 任务。各 WordPress + WooCommerce 前台网站保持不变，栖序只连接和管理数据。

## Production runtime

- `apps/web`: statically exported React/Next.js application; Node.js is required only at build time.
- `apps/api`: PHP API、会话认证、多网站管理、按网站隔离的商品/集成、MySQL 任务与 WooCommerce 同步。
- `apps/api/database`: reviewed MySQL migrations and base seed.
- `packages/shared`: pure TypeScript business calculations used during frontend development.

PostgreSQL, Redis, BullMQ, persistent workers, and Docker are not production dependencies. The previous VPS implementation is preserved under the git-ignored `archive/vps-stack` directory for recovery only and is not part of the workspace or deployment.

## Local checks

```bash
pnpm install
pnpm verify
php -l apps/api/public/index.php
```

The frontend export is written to `apps/web/out`. PHP setup and Cron instructions are in `apps/api/README.md`; deployment is documented in `docs/DEPLOYMENT.md`.
