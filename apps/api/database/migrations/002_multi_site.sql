SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE TABLE sites (
  id CHAR(36) PRIMARY KEY,
  tenant_id CHAR(36) NOT NULL,
  name VARCHAR(191) NOT NULL,
  slug VARCHAR(191) NOT NULL,
  domain VARCHAR(255) NOT NULL,
  timezone VARCHAR(64) NOT NULL DEFAULT 'Asia/Shanghai',
  currency CHAR(3) NOT NULL DEFAULT 'CNY',
  status ENUM('ACTIVE','PENDING','DISABLED') NOT NULL DEFAULT 'PENDING',
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY sites_tenant_slug_uq (tenant_id,slug),
  UNIQUE KEY sites_tenant_domain_uq (tenant_id,domain),
  KEY sites_tenant_status_idx (tenant_id,status),
  CONSTRAINT sites_tenant_fk FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO sites (id,tenant_id,name,slug,domain,status,is_default)
SELECT UUID(),id,CONCAT(name,' 主站'),'main','', 'PENDING',TRUE FROM tenants;

ALTER TABLE products ADD COLUMN site_id CHAR(36) NULL AFTER tenant_id;
UPDATE products p JOIN sites s ON s.tenant_id=p.tenant_id AND s.is_default=TRUE SET p.site_id=s.id;
ALTER TABLE products MODIFY site_id CHAR(36) NOT NULL, DROP INDEX products_external_uq,
  ADD UNIQUE KEY products_site_external_uq (site_id,source,external_id),
  ADD KEY products_site_status_idx (site_id,status,updated_at),
  ADD CONSTRAINT products_site_fk FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE;

ALTER TABLE integrations ADD COLUMN site_id CHAR(36) NULL AFTER tenant_id;
UPDATE integrations i JOIN sites s ON s.tenant_id=i.tenant_id AND s.is_default=TRUE SET i.site_id=s.id;
ALTER TABLE integrations MODIFY site_id CHAR(36) NOT NULL, DROP INDEX integrations_tenant_provider_name_uq,
  ADD UNIQUE KEY integrations_site_provider_name_uq (site_id,provider,name),
  ADD KEY integrations_tenant_site_idx (tenant_id,site_id),
  ADD CONSTRAINT integrations_site_fk FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE;

ALTER TABLE oauth_states ADD COLUMN site_id CHAR(36) NULL AFTER tenant_id;
UPDATE oauth_states o JOIN sites s ON s.tenant_id=o.tenant_id AND s.is_default=TRUE SET o.site_id=s.id;
ALTER TABLE oauth_states MODIFY site_id CHAR(36) NOT NULL,
  ADD CONSTRAINT oauth_states_site_fk FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE;

ALTER TABLE automation_runs ADD COLUMN site_id CHAR(36) NULL AFTER tenant_id;
UPDATE automation_runs a JOIN sites s ON s.tenant_id=a.tenant_id AND s.is_default=TRUE SET a.site_id=s.id;
ALTER TABLE automation_runs MODIFY site_id CHAR(36) NOT NULL, DROP INDEX automation_runs_idempotency_uq,
  ADD UNIQUE KEY automation_runs_site_idempotency_uq (site_id,idempotency_key),
  ADD KEY automation_runs_site_date_idx (site_id,created_at),
  ADD CONSTRAINT automation_runs_site_fk FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE;
