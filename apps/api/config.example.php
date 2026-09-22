<?php
return [
    'APP_ENV' => 'production',
    'DB_HOST' => 'localhost',
    'DB_PORT' => '3306',
    'DB_DATABASE' => 'qixu_operations',
    'DB_USERNAME' => 'qixu_operations',
    'DB_PASSWORD' => 'replace-me',
    'APP_KEY' => 'replace-with-base64-encoded-32-byte-key',
    'CRON_SECRET' => 'replace-with-at-least-32-random-characters',
    'APP_URL' => 'http://localhost:3000',
    'GOOGLE_CLIENT_ID' => 'replace-with-google-oauth-client-id',
    'GOOGLE_CLIENT_SECRET' => 'replace-with-google-oauth-client-secret',
    'GOOGLE_REDIRECT_URI' => 'http://localhost:8080/api/v1/integrations/google/callback',
];
