<?php
declare(strict_types=1);

namespace Qixu;

use PDO;
use RuntimeException;

final class Integrations
{
    public function __construct(private readonly PDO $db, private readonly Jobs $jobs) {}

    public function list(string $tenantId, string $siteId): array
    {
        $query = $this->db->prepare('SELECT id,provider,name,status,config,last_synced_at,last_error,updated_at FROM integrations WHERE tenant_id=? AND site_id=? ORDER BY provider');
        $query->execute([$tenantId,$siteId]);
        return $query->fetchAll();
    }

    public function requestSync(string $tenantId, string $siteId, string $provider): array
    {
        if ($provider !== 'woocommerce') throw new HttpError(422, 'Only WooCommerce sync is available on this hosting profile.', 'PROVIDER_NOT_AVAILABLE');
        $query = $this->db->prepare("SELECT id,status FROM integrations WHERE tenant_id=? AND site_id=? AND provider='WOOCOMMERCE' LIMIT 1");
        $query->execute([$tenantId,$siteId]);
        $integration = $query->fetch();
        if (!$integration || $integration['status'] === 'NOT_CONFIGURED') throw new HttpError(409, 'WooCommerce is not configured.', 'NOT_CONFIGURED');
        return $this->jobs->enqueue($tenantId, $siteId, 'woocommerce.products.sync', ['page' => 1], 'woocommerce-products-' . gmdate('Y-m-d-H'));
    }

    public function syncWooCommercePage(string $tenantId, string $siteId, array $payload): void
    {
        $query = $this->db->prepare("SELECT i.id,i.config,c.ciphertext,c.nonce FROM integrations i JOIN integration_credentials c ON c.integration_id=i.id WHERE i.tenant_id=? AND i.site_id=? AND i.provider='WOOCOMMERCE' LIMIT 1");
        $query->execute([$tenantId,$siteId]);
        $integration = $query->fetch();
        if (!$integration) throw new RuntimeException('WooCommerce credentials are not configured.');
        $config = json_decode($integration['config'], true, 512, JSON_THROW_ON_ERROR);
        $credentials = $this->decrypt($integration['ciphertext'], $integration['nonce']);
        $page = max(1, (int)($payload['page'] ?? 1));
        $base = rtrim((string)$config['storeUrl'], '/');
        $url = $base . '/wp-json/wc/v3/products?per_page=25&page=' . $page;
        $curl = curl_init($url);
        curl_setopt_array($curl, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 40, CURLOPT_USERPWD => $credentials['consumerKey'] . ':' . $credentials['consumerSecret'], CURLOPT_HTTPHEADER => ['Accept: application/json']]);
        $body = curl_exec($curl);
        $status = (int)curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
        if ($body === false || $status < 200 || $status >= 300) throw new RuntimeException('WooCommerce request failed with HTTP ' . $status . '.');
        $products = json_decode($body, true, 512, JSON_THROW_ON_ERROR);
        $this->db->beginTransaction();
        try {
            $upsert = $this->db->prepare("INSERT INTO products (id,tenant_id,site_id,source,external_id,sku,name,slug,status,price,currency,image_url,sync_status,last_synced_at,created_at,updated_at) VALUES (?,?,?,'WOOCOMMERCE',?,?,?,?,?,?,?,?, 'SYNCED',UTC_TIMESTAMP(),UTC_TIMESTAMP(),UTC_TIMESTAMP()) ON DUPLICATE KEY UPDATE sku=VALUES(sku),name=VALUES(name),slug=VALUES(slug),status=VALUES(status),price=VALUES(price),currency=VALUES(currency),image_url=VALUES(image_url),sync_status='SYNCED',last_synced_at=UTC_TIMESTAMP(),updated_at=UTC_TIMESTAMP()");
            foreach ($products as $product) {
                $image = $product['images'][0]['src'] ?? null;
                $upsert->execute([Id::uuid(), $tenantId, $siteId, (string)$product['id'], $product['sku'] ?: null, (string)$product['name'], (string)$product['slug'], (string)$product['status'], (string)($product['price'] ?: '0'), (string)($product['currency'] ?? 'USD'), $image]);
            }
            $updated = $this->db->prepare("UPDATE integrations SET status='SYNCED',last_synced_at=UTC_TIMESTAMP(),last_error=NULL,updated_at=UTC_TIMESTAMP() WHERE id=?");
            $updated->execute([$integration['id']]);
            $this->db->commit();
        } catch (\Throwable $error) {
            $this->db->rollBack();
            throw $error;
        }
        if (count($products) === 25) $this->jobs->enqueue($tenantId, $siteId, 'woocommerce.products.sync', ['page' => $page + 1], 'woocommerce-products-page-' . ($page + 1) . '-' . gmdate('Y-m-d-H'));
    }

    private function decrypt(string $ciphertext, string $nonce): array
    {
        $key = base64_decode(Env::get('APP_KEY'), true);
        if ($key === false || strlen($key) !== SODIUM_CRYPTO_SECRETBOX_KEYBYTES) throw new RuntimeException('APP_KEY must be a base64-encoded 32-byte key.');
        $plain = sodium_crypto_secretbox_open($ciphertext, $nonce, $key);
        if ($plain === false) throw new RuntimeException('Stored integration credentials could not be decrypted.');
        return json_decode($plain, true, 512, JSON_THROW_ON_ERROR);
    }
}
