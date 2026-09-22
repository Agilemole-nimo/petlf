<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/bootstrap.php';

if ($argc < 4) {
    fwrite(STDERR, "Usage: php bin/create-admin.php <email> <name> <password>\n");
    exit(1);
}
$db = Qixu\Database::connection();
$tenantId = $db->query('SELECT id FROM tenants ORDER BY created_at LIMIT 1')->fetchColumn();
if (!$tenantId) throw new RuntimeException('Run the database seed before creating an admin.');
$query = $db->prepare("INSERT INTO users (id,tenant_id,email,name,password_hash,role,status,created_at,updated_at) VALUES (?,?,?,?,?,'SUPER_ADMIN','ACTIVE',UTC_TIMESTAMP(),UTC_TIMESTAMP())");
$query->execute([Qixu\Id::uuid(), $tenantId, strtolower($argv[1]), $argv[2], password_hash($argv[3], PASSWORD_ARGON2ID)]);
fwrite(STDOUT, "Admin created.\n");
