# Security

- Opaque random sessions are stored server-side; cookies are `HttpOnly`, `SameSite=Lax`, and `Secure` in production.
- Passwords use Argon2id. The initial release has no password-reset endpoint; account creation is an SSH-only CLI operation.
- Roles are stored now; granular permission enforcement is a required follow-up before enabling additional write modules.
- State-changing cookie requests require CSRF verification. CORS is an explicit allowlist.
- Web-server security headers, strict request validation, PDO prepared statements, contextual output escaping, and sanitized logs are mandatory.
- Provider credentials are encrypted at rest and are never returned by read APIs. Secret fields display only configured/not-configured state.
- Login responses do not reveal whether an account exists.
- Dependency scanning belongs in CI. There is no production Swagger or container image in this hosting profile.

Report vulnerabilities privately to the repository owner. Do not put credentials or customer data in issues.
