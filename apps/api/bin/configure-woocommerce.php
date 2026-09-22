<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/bootstrap.php';

if ($argc < 5) {
    fwrite(STDERR, "Usage: php bin/configure-woocommerce.php <site-slug> <store-url> <consumer-key> <consumer-secret>\n");
    exit(1);
}
$key = base64_decode(Qixu\Env::get('APP_KEY'), true);
if ($key === false || strlen($key) !== SODIUM_CRYPTO_SECRETBOX_KEYBYTES) throw new RuntimeException('APP_KEY must be a base64-encoded 32-byte key.');
$db = Qixu\Database::connection();
$lookup = $db->prepare("SELECT i.id FROM integrations i JOIN sites s ON s.id=i.site_id WHERE i.provider='WOOCOMMERCE' AND s.slug=? LIMIT 1");
$lookup->execute([$argv[1]]);
$integration = $lookup->fetch();
if (!$integration) throw new RuntimeException('Run the database seed before configuring WooCommerce.');
$nonce = random_bytes(SODIUM_CRYPTO_SECRETBOX_NONCEBYTES);
$credentials = json_encode(['consumerKey' => $argv[3], 'consumerSecret' => $argv[4]], JSON_THROW_ON_ERROR);
$ciphertext = sodium_crypto_secretbox($credentials, $nonce, $key);
$db->beginTransaction();
try {
    $config = $db->prepare("UPDATE integrations SET config=?,status='PENDING',updated_at=UTC_TIMESTAMP() WHERE id=?");
    $config->execute([json_encode(['storeUrl' => rtrim($argv[2], '/')], JSON_THROW_ON_ERROR), $integration['id']]);
    $secret = $db->prepare("INSERT INTO integration_credentials (id,integration_id,ciphertext,nonce,key_version,updated_at) VALUES (?,?,?,?, 'v1',UTC_TIMESTAMP()) ON DUPLICATE KEY UPDATE ciphertext=VALUES(ciphertext),nonce=VALUES(nonce),key_version='v1',updated_at=UTC_TIMESTAMP()");
    $secret->execute([Qixu\Id::uuid(), $integration['id'], $ciphertext, $nonce]);
    $db->commit();
} catch (Throwable $error) {
    $db->rollBack();
    throw $error;
}
fwrite(STDOUT, "WooCommerce configured. Credentials were encrypted before storage.\n");
