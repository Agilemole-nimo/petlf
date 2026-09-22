# REST API contract

Base path: `/api/v1`. Success envelopes are `{ data, meta? }`; errors are `{ error: { code, message, requestId, details? } }`. List endpoints use `page`, `pageSize`, `sort`, and documented filters. Default page size is 25, maximum 100.

Implemented routes in the Agency Hosting edition:

- `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`
- `GET /sites`, `POST /sites`
- `GET /products`, `GET /products/:id`
- `GET /integrations`, `POST /integrations/:provider/sync`
- `GET /integrations/google/connect?provider=ga4|search-console`
- `GET /integrations/google/callback` (registered Google OAuth redirect URI)
- `GET /jobs`, `GET /system/health`
- `POST /cron/run` with a dedicated bearer secret; hPanel should normally call the PHP CLI runner instead.

Operational routes require an authenticated database session. Site-scoped routes accept `X-Site-ID`; when omitted the tenant default site is used. Cookie-authenticated mutations also require the matching CSRF header. Unsupported module routes return 404 until their real workflows are implemented; the API does not fabricate placeholder responses.
