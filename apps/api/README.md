# 栖序 PHP API

PHP 8.2 + PDO MySQL runtime for Hostinger Agency Hosting. The document root is `public/`; no Node.js process, Redis, queue daemon, or Docker runtime is required.

1. Import `database/migrations/001_initial_mysql.sql`, then `database/seeds/001_base.sql`.
2. Copy `config.example.php` to the git-ignored `config.local.php` outside the public document root and set the production secrets. Real environment variables override this file when available.
3. Create the first account with `php bin/create-admin.php email name password`.
4. Set the Google OAuth web-client redirect URI to `/api/v1/integrations/google/callback`, then add the client ID and secret to configuration.
5. Deploy the API folder at `public_html/api/v1`; its root `.htaccess` blocks source/config access and routes requests to `public/index.php`.
6. Schedule `php /absolute/path/apps/api/bin/cron.php 5` every five minutes in hPanel Cron Jobs (UTC).

The MySQL runner uses a named database lock, processes at most ten jobs per invocation, retries failures with backoff, and never requires a persistent worker.
