<?php
declare(strict_types=1);

namespace Qixu;

use PDO;

final class Sites
{
    public function __construct(private readonly PDO $db) {}

    public function list(string $tenantId): array
    {
        $query = $this->db->prepare('SELECT id,name,slug,domain,timezone,currency,status,is_default,updated_at FROM sites WHERE tenant_id=? ORDER BY is_default DESC,name');
        $query->execute([$tenantId]);
        return $query->fetchAll();
    }

    public function create(string $tenantId, array $input): array
    {
        $name = trim((string)($input['name'] ?? ''));
        $domain = strtolower(trim((string)($input['domain'] ?? '')));
        $domain = preg_replace('#^https?://#', '', $domain) ?? $domain;
        $domain = rtrim($domain, '/');
        if ($name === '' || !filter_var('https://' . $domain, FILTER_VALIDATE_URL)) {
            throw new HttpError(422, 'A valid site name and domain are required.', 'INVALID_SITE');
        }
        $slug = trim(preg_replace('/[^a-z0-9]+/', '-', strtolower((string)($input['slug'] ?? $name))), '-');
        if ($slug === '') $slug = 'site-' . substr(Id::uuid(), 0, 8);
        $id = Id::uuid();
        $this->db->beginTransaction();
        try {
            $site = $this->db->prepare("INSERT INTO sites (id,tenant_id,name,slug,domain,timezone,currency,status,is_default,created_at,updated_at) VALUES (?,?,?,?,?,? ,?,'PENDING',FALSE,UTC_TIMESTAMP(),UTC_TIMESTAMP())");
            $site->execute([$id,$tenantId,$name,$slug,$domain,(string)($input['timezone'] ?? 'Asia/Shanghai'),strtoupper((string)($input['currency'] ?? 'CNY'))]);
            $integration = $this->db->prepare("INSERT INTO integrations (id,tenant_id,site_id,provider,name,status,created_at,updated_at) VALUES (?,?,?,?,?,'NOT_CONFIGURED',UTC_TIMESTAMP(),UTC_TIMESTAMP())");
            foreach ([['WOOCOMMERCE','WooCommerce'],['GA4','Google Analytics 4'],['SEARCH_CONSOLE','Search Console']] as [$provider,$label]) {
                $integration->execute([Id::uuid(),$tenantId,$id,$provider,$label]);
            }
            $this->db->commit();
        } catch (\Throwable $error) {
            $this->db->rollBack();
            throw $error;
        }
        return ['id'=>$id,'name'=>$name,'slug'=>$slug,'domain'=>$domain,'timezone'=>$input['timezone'] ?? 'Asia/Shanghai','currency'=>strtoupper((string)($input['currency'] ?? 'CNY')),'status'=>'PENDING','is_default'=>false];
    }

    public function resolve(string $tenantId, ?string $siteId): string
    {
        if ($siteId && preg_match('/^[0-9a-f-]{36}$/i', $siteId)) {
            $query = $this->db->prepare('SELECT id FROM sites WHERE tenant_id=? AND id=? LIMIT 1');
            $query->execute([$tenantId,$siteId]);
            if ($id = $query->fetchColumn()) return (string)$id;
        }
        $query = $this->db->prepare('SELECT id FROM sites WHERE tenant_id=? ORDER BY is_default DESC,created_at LIMIT 1');
        $query->execute([$tenantId]);
        $id = $query->fetchColumn();
        if (!$id) throw new HttpError(409, 'No site is configured for this account.', 'SITE_NOT_CONFIGURED');
        return (string)$id;
    }
}
