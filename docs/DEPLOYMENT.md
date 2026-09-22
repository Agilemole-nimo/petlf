# Hostinger Agency Hosting deployment

1. 在 hPanel 创建 MySQL 数据库与用户。按文件名顺序导入 `apps/api/database/migrations/*.sql`，再导入 `database/seeds/001_base.sql`。
2. Set PHP to 8.2 or newer with PDO MySQL, cURL, JSON, and Sodium enabled.
3. Copy `apps/api/config.example.php` to `config.local.php` and configure it, or use real environment variables. Keep `APP_KEY`, database password, and `CRON_SECRET` out of the web root.
4. In Google Cloud, enable Google Analytics Admin API, Google Analytics Data API, and Search Console API. Create an OAuth 2.0 Web Application client and register the exact redirect URI `https://admin.petlf.com/api/v1/integrations/google/callback`.
5. Run `pnpm install --frozen-lockfile && pnpm build`. Upload the contents of `apps/web/out` to `public_html`.
6. Upload the contents of `apps/api` to `public_html/api/v1`. Keep its root `.htaccess`; it blocks direct requests to source, database files, CLI scripts, and local configuration.
7. 在 API 目录通过 SSH 运行 `php bin/create-admin.php <email> <name> <password>`。每个网站分别执行 `php bin/configure-woocommerce.php <site-slug> <url> <key> <secret>`。
8. Add an hPanel Cron job every five minutes (hPanel schedules in UTC): `php /absolute/path/public_html/api/v1/bin/cron.php 5`.
9. 验证 `/api/v1/system/health`，登录后先在顶栏添加/选择网站，再从 `/integrations` 为当前网站连接 GA4 与 Search Console。

Back up MySQL and `APP_KEY` separately. Without the same key, encrypted provider credentials cannot be restored. Do not expose the archived VPS stack or deploy it to production.
