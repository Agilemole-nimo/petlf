SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE TABLE tenants (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(191) NOT NULL,
  slug VARCHAR(191) NOT NULL UNIQUE,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE users (
  id CHAR(36) PRIMARY KEY,
  tenant_id CHAR(36) NOT NULL,
  email VARCHAR(254) NOT NULL,
  name VARCHAR(191) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('SUPER_ADMIN','ADMIN','OPERATOR','ANALYST','CONTENT_MANAGER','READ_ONLY') NOT NULL DEFAULT 'READ_ONLY',
  status ENUM('ACTIVE','INVITED','SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
  last_login_at DATETIME(3) NULL,
  deleted_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY users_tenant_email_uq (tenant_id,email),
  KEY users_tenant_status_idx (tenant_id,status),
  CONSTRAINT users_tenant_fk FOREIGN KEY (tenant_id) REFERENCES tenants(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE sessions (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  token_hash CHAR(64) NOT NULL UNIQUE,
  csrf_hash CHAR(64) NOT NULL,
  expires_at DATETIME(3) NOT NULL,
  last_seen_at DATETIME(3) NOT NULL,
  revoked_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  KEY sessions_user_expiry_idx (user_id,expires_at),
  CONSTRAINT sessions_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE products (
  id CHAR(36) PRIMARY KEY,
  tenant_id CHAR(36) NOT NULL,
  source ENUM('WOOCOMMERCE') NOT NULL DEFAULT 'WOOCOMMERCE',
  external_id VARCHAR(191) NOT NULL,
  sku VARCHAR(191) NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  status VARCHAR(64) NOT NULL,
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  image_url TEXT NULL,
  checksum VARCHAR(191) NULL,
  sync_status ENUM('PENDING','SYNCING','SYNCED','DEGRADED','FAILED','NOT_CONFIGURED') NOT NULL DEFAULT 'PENDING',
  last_synced_at DATETIME(3) NULL,
  deleted_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY products_external_uq (tenant_id,source,external_id),
  KEY products_tenant_status_idx (tenant_id,status,updated_at),
  KEY products_tenant_sku_idx (tenant_id,sku),
  CONSTRAINT products_tenant_fk FOREIGN KEY (tenant_id) REFERENCES tenants(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE inventory (
  id CHAR(36) PRIMARY KEY,
  product_id CHAR(36) NOT NULL UNIQUE,
  quantity INT NOT NULL DEFAULT 0,
  low_stock_threshold INT NULL,
  managed BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT inventory_product_fk FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE product_costs (
  id CHAR(36) PRIMARY KEY,
  product_id CHAR(36) NOT NULL,
  valid_from DATETIME(3) NOT NULL,
  valid_to DATETIME(3) NULL,
  product_cost DECIMAL(12,2) NOT NULL,
  packaging_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
  shipping_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
  payment_fee DECIMAL(12,2) NOT NULL DEFAULT 0,
  platform_fee DECIMAL(12,2) NOT NULL DEFAULT 0,
  advertising_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
  discount_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
  refund_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
  other_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
  notes TEXT NULL,
  KEY product_costs_product_date_idx (product_id,valid_from),
  CONSTRAINT product_costs_product_fk FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE integrations (
  id CHAR(36) PRIMARY KEY,
  tenant_id CHAR(36) NOT NULL,
  provider ENUM('WOOCOMMERCE','GA4','SEARCH_CONSOLE') NOT NULL,
  name VARCHAR(191) NOT NULL,
  status ENUM('PENDING','SYNCING','SYNCED','DEGRADED','FAILED','NOT_CONFIGURED') NOT NULL DEFAULT 'NOT_CONFIGURED',
  config JSON NULL,
  last_synced_at DATETIME(3) NULL,
  last_error TEXT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY integrations_tenant_provider_name_uq (tenant_id,provider,name),
  CONSTRAINT integrations_tenant_fk FOREIGN KEY (tenant_id) REFERENCES tenants(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE integration_credentials (
  id CHAR(36) PRIMARY KEY,
  integration_id CHAR(36) NOT NULL UNIQUE,
  ciphertext BLOB NOT NULL,
  nonce BINARY(24) NOT NULL,
  key_version VARCHAR(64) NOT NULL DEFAULT 'v1',
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT integration_credentials_integration_fk FOREIGN KEY (integration_id) REFERENCES integrations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE oauth_states (
  id CHAR(36) PRIMARY KEY,
  tenant_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  provider ENUM('GA4','SEARCH_CONSOLE') NOT NULL,
  state_hash CHAR(64) NOT NULL UNIQUE,
  expires_at DATETIME(3) NOT NULL,
  used_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  KEY oauth_states_expiry_idx (expires_at),
  CONSTRAINT oauth_states_tenant_fk FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  CONSTRAINT oauth_states_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE sync_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  integration_id CHAR(36) NOT NULL,
  sync_type VARCHAR(100) NOT NULL,
  status ENUM('PENDING','SYNCING','SYNCED','DEGRADED','FAILED','NOT_CONFIGURED') NOT NULL,
  cursor_value VARCHAR(500) NULL,
  records_read INT NOT NULL DEFAULT 0,
  records_written INT NOT NULL DEFAULT 0,
  started_at DATETIME(3) NOT NULL,
  finished_at DATETIME(3) NULL,
  error_code VARCHAR(100) NULL,
  error_message TEXT NULL,
  KEY sync_logs_integration_date_idx (integration_id,started_at),
  CONSTRAINT sync_logs_integration_fk FOREIGN KEY (integration_id) REFERENCES integrations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE automation_runs (
  id CHAR(36) PRIMARY KEY,
  tenant_id CHAR(36) NOT NULL,
  type VARCHAR(120) NOT NULL,
  status ENUM('QUEUED','RUNNING','SUCCEEDED','FAILED','CANCELLED') NOT NULL DEFAULT 'QUEUED',
  attempts SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  max_attempts SMALLINT UNSIGNED NOT NULL DEFAULT 3,
  payload JSON NULL,
  idempotency_key VARCHAR(191) NULL,
  last_error TEXT NULL,
  run_after DATETIME(3) NOT NULL,
  started_at DATETIME(3) NULL,
  finished_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY automation_runs_idempotency_uq (tenant_id,idempotency_key),
  KEY automation_runs_claim_idx (status,run_after,created_at),
  KEY automation_runs_tenant_date_idx (tenant_id,created_at),
  CONSTRAINT automation_runs_tenant_fk FOREIGN KEY (tenant_id) REFERENCES tenants(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE audit_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id CHAR(36) NOT NULL,
  actor_id CHAR(36) NULL,
  action VARCHAR(120) NOT NULL,
  entity_type VARCHAR(120) NOT NULL,
  entity_id VARCHAR(191) NULL,
  request_id VARCHAR(191) NULL,
  metadata JSON NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  KEY audit_logs_tenant_date_idx (tenant_id,created_at),
  KEY audit_logs_entity_idx (entity_type,entity_id),
  CONSTRAINT audit_logs_tenant_fk FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  CONSTRAINT audit_logs_actor_fk FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
