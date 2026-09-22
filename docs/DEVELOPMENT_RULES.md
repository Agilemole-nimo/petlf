# Development rules

1. Preserve module boundaries and public contracts.
2. Keep business logic in application/domain services, not controllers or React components.
3. UI calls only the internal API; third parties live behind integration adapters.
4. AI calls go through the AI Gateway; deferred work goes through the MySQL task service and bounded Cron runner.
5. Schema changes require migrations; source-of-truth facts are never silently overwritten.
6. Shared components own recurring interaction and state behavior.
7. Add structured logs without secrets or PII.
8. Update architecture, API, security, and module docs with durable decisions.
9. Run lint, typecheck, tests, build, migration checks, and browser tests after major stages.
