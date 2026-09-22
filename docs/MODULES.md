# Module map

| Module | Owns | Initial release |
|---|---|---|
| Core | auth, users, role field, sessions, audit schema, health | Initial functional slice |
| Commerce | synchronized products, inventory and cost schema | WooCommerce product sync |
| Analytics | normalized GA4, Search Console, WooCommerce metrics and dashboard projections | Deferred; UI foundation only |
| Product Intelligence | cross-module read model and documented profit calculations | Demo UI + pure profit calculation |
| SEO / GEO | queries, pages, metrics, opportunities | Deferred |
| Content | content lifecycle and product/keyword/campaign relationships | Contracts + navigation |
| Marketing | campaigns, UTM and attribution | Contracts + navigation |
| Supplier | suppliers, product sources, MOQ, lead time, historical cost | Contracts + navigation |
| Social | provider-neutral accounts, posts, media, metrics | Contracts + navigation |
| AI | provider gateway, runs, usage, cost, 问问栖序 | Deferred; UI contract only |
| Automation | job definitions, runs, schedules, alerts | MySQL tasks + hPanel Cron |
| Integrations | credentials, status, sync logs, adapters | WooCommerce products; Google deferred |
| System | logs, health, feature flags, observability | Health + task history |

Each module exposes application interfaces. Cross-module dashboards consume read services, not foreign repositories.
