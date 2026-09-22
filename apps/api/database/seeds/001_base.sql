INSERT INTO tenants (id,name,slug,is_demo) VALUES ('8b83f3a0-37d8-4e43-b8e0-3d3494c2f66a','栖序','qixu',FALSE);

INSERT INTO sites (id,tenant_id,name,slug,domain,timezone,currency,status,is_default)
VALUES ('d21842d0-8438-4581-95d1-971b33216d1f','8b83f3a0-37d8-4e43-b8e0-3d3494c2f66a','PETLF 主站','main','petlf.com','Asia/Shanghai','CNY','PENDING',TRUE);

INSERT INTO integrations (id,tenant_id,site_id,provider,name,status)
VALUES
('35faee5d-00a2-4100-aeb7-730cbbd0c193','8b83f3a0-37d8-4e43-b8e0-3d3494c2f66a','d21842d0-8438-4581-95d1-971b33216d1f','WOOCOMMERCE','PETLF 主站 · WooCommerce','NOT_CONFIGURED'),
('76472825-29be-4bb1-83ad-1b61d879f604','8b83f3a0-37d8-4e43-b8e0-3d3494c2f66a','d21842d0-8438-4581-95d1-971b33216d1f','GA4','Google Analytics 4','NOT_CONFIGURED'),
('862e3610-718a-4f2d-87b8-030be2d76d15','8b83f3a0-37d8-4e43-b8e0-3d3494c2f66a','d21842d0-8438-4581-95d1-971b33216d1f','SEARCH_CONSOLE','Search Console','NOT_CONFIGURED');
