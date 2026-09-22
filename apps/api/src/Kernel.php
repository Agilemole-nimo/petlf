<?php
declare(strict_types=1);

namespace Qixu;

use PDO;
use Throwable;

final class Kernel
{
    private Auth $auth;
    private Jobs $jobs;
    private Sites $sites;
    private Integrations $integrations;
    private GoogleOAuth $google;

    public function __construct(private readonly PDO $db)
    {
        $this->auth = new Auth($db);
        $this->sites = new Sites($db);
        $this->jobs = new Jobs($db);
        $this->integrations = new Integrations($db, $this->jobs);
        $this->google = new GoogleOAuth($db);
    }

    public function handle(): never
    {
        try {
            $method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
            $path = '/' . trim((string)(parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/'), '/');
            $path = preg_replace('#^/api/v1#', '', $path) ?: '/';
            if ($method === 'GET' && $path === '/system/health') $this->health();
            if ($method === 'POST' && $path === '/auth/login') Http::json(['data' => $this->auth->login(Http::body())]);
            if ($method === 'POST' && $path === '/cron/run') $this->cron();

            $user = $this->auth->user();
            if ($method !== 'GET') $this->auth->requireCsrf();
            if ($method === 'GET' && $path === '/auth/me') Http::json(['data' => $user]);
            if ($method === 'POST' && $path === '/auth/logout') { $this->auth->logout(); Http::json(['data' => ['ok' => true]]); }
            if ($method === 'GET' && $path === '/sites') Http::json(['data' => $this->sites->list($user['tenant_id'])]);
            if ($method === 'POST' && $path === '/sites') Http::json(['data' => $this->sites->create($user['tenant_id'], Http::body())], 201);
            $siteId = $this->sites->resolve($user['tenant_id'], (string)($_SERVER['HTTP_X_SITE_ID'] ?? $_GET['siteId'] ?? ''));
            if ($method === 'GET' && $path === '/products') $this->products($user['tenant_id'], $siteId);
            if ($method === 'GET' && preg_match('#^/products/([0-9a-f-]{36})$#i', $path, $match)) $this->product($user['tenant_id'], $siteId, $match[1]);
            if ($method === 'GET' && $path === '/integrations') Http::json(['data' => $this->integrations->list($user['tenant_id'], $siteId)]);
            if ($method === 'GET' && $path === '/integrations/google/connect') $this->google->start($user, $siteId, (string)($_GET['provider'] ?? ''));
            if ($method === 'GET' && $path === '/integrations/google/callback') $this->google->callback($user, $_GET);
            if ($method === 'POST' && preg_match('#^/integrations/([a-z-]+)/sync$#', $path, $match)) Http::json(['data' => $this->integrations->requestSync($user['tenant_id'], $siteId, $match[1])], 202);
            if ($method === 'GET' && $path === '/jobs') Http::json(['data' => $this->jobs->list($user['tenant_id'], $siteId, (int)($_GET['limit'] ?? 25))]);
            throw new HttpError(404, 'Route not found.', 'NOT_FOUND');
        } catch (HttpError $error) {
            Http::json(['error' => ['code' => $error->code, 'message' => $error->getMessage(), 'requestId' => $_SERVER['HTTP_X_REQUEST_ID'] ?? null]], $error->status);
        } catch (Throwable $error) {
            error_log($error->__toString());
            Http::json(['error' => ['code' => 'INTERNAL_ERROR', 'message' => 'The request could not be completed.']], 500);
        }
    }

    private function health(): never
    {
        $start = microtime(true);
        $this->db->query('SELECT 1');
        Http::json(['data' => ['status' => 'HEALTHY', 'checks' => ['api' => ['status' => 'HEALTHY'], 'mysql' => ['status' => 'HEALTHY', 'latencyMs' => round((microtime(true) - $start) * 1000)], 'cron' => ['status' => 'SCHEDULED']], 'checkedAt' => gmdate(DATE_ATOM)]]);
    }

    private function cron(): never
    {
        $secret = Env::get('CRON_SECRET');
        if (!Http::bearer() || !hash_equals($secret, (string)Http::bearer())) throw new HttpError(401, 'Invalid cron secret.', 'INVALID_CRON_SECRET');
        Http::json(['data' => $this->jobs->runBatch((int)($_GET['limit'] ?? 5))]);
    }

    private function products(string $tenantId, string $siteId): never
    {
        $page = max(1, (int)($_GET['page'] ?? 1));
        $pageSize = min(100, max(1, (int)($_GET['pageSize'] ?? 25)));
        $count = $this->db->prepare('SELECT COUNT(*) FROM products WHERE tenant_id=? AND site_id=? AND deleted_at IS NULL');
        $count->execute([$tenantId,$siteId]);
        $query = $this->db->prepare('SELECT id,external_id,sku,name,slug,status,price,currency,image_url,sync_status,last_synced_at,updated_at FROM products WHERE tenant_id=? AND site_id=? AND deleted_at IS NULL ORDER BY updated_at DESC LIMIT ? OFFSET ?');
        $query->bindValue(1, $tenantId);
        $query->bindValue(2, $siteId);
        $query->bindValue(3, $pageSize, PDO::PARAM_INT);
        $query->bindValue(4, ($page - 1) * $pageSize, PDO::PARAM_INT);
        $query->execute();
        Http::json(['data' => $query->fetchAll(), 'meta' => ['page' => $page, 'pageSize' => $pageSize, 'total' => (int)$count->fetchColumn()]]);
    }

    private function product(string $tenantId, string $siteId, string $id): never
    {
        $query = $this->db->prepare('SELECT p.*,i.quantity,i.low_stock_threshold FROM products p LEFT JOIN inventory i ON i.product_id=p.id WHERE p.tenant_id=? AND p.site_id=? AND p.id=? AND p.deleted_at IS NULL LIMIT 1');
        $query->execute([$tenantId, $siteId, $id]);
        $product = $query->fetch();
        if (!$product) throw new HttpError(404, 'Product not found.', 'NOT_FOUND');
        Http::json(['data' => $product]);
    }
}
