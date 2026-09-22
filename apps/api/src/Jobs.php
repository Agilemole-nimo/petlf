<?php
declare(strict_types=1);

namespace Qixu;

use PDO;
use Throwable;

final class Jobs
{
    public function __construct(private readonly PDO $db) {}

    public function enqueue(string $tenantId, string $siteId, string $type, array $payload, ?string $idempotencyKey = null): array
    {
        if ($idempotencyKey) {
            $existing = $this->db->prepare('SELECT id,status FROM automation_runs WHERE tenant_id=? AND site_id=? AND idempotency_key=? LIMIT 1');
            $existing->execute([$tenantId,$siteId,$idempotencyKey]);
            if ($row = $existing->fetch()) return $row;
        }
        $id = Id::uuid();
        $query = $this->db->prepare("INSERT INTO automation_runs (id,tenant_id,site_id,type,status,attempts,max_attempts,payload,idempotency_key,run_after,created_at,updated_at) VALUES (?,?,?,?,'QUEUED',0,3,?,?,UTC_TIMESTAMP(),UTC_TIMESTAMP(),UTC_TIMESTAMP())");
        $query->execute([$id,$tenantId,$siteId,$type,json_encode($payload, JSON_THROW_ON_ERROR),$idempotencyKey]);
        return ['id' => $id, 'status' => 'QUEUED'];
    }

    public function list(string $tenantId, string $siteId, int $limit = 25): array
    {
        $query = $this->db->prepare('SELECT id,type,status,attempts,max_attempts,last_error,run_after,started_at,finished_at,created_at FROM automation_runs WHERE tenant_id=? AND site_id=? ORDER BY created_at DESC LIMIT ?');
        $query->bindValue(1, $tenantId);
        $query->bindValue(2, $siteId);
        $query->bindValue(3, min(100, max(1, $limit)), PDO::PARAM_INT);
        $query->execute();
        return $query->fetchAll();
    }

    public function runBatch(int $limit = 5): array
    {
        $lock = (int)$this->db->query("SELECT GET_LOCK('qixu_cron_runner',0)")->fetchColumn();
        if ($lock !== 1) return ['processed' => 0, 'state' => 'ALREADY_RUNNING'];
        $results = [];
        try {
            for ($i = 0; $i < min(10, max(1, $limit)); $i++) {
                $job = $this->claim();
                if (!$job) break;
                try {
                    $this->dispatch($job);
                    $done = $this->db->prepare("UPDATE automation_runs SET status='SUCCEEDED',finished_at=UTC_TIMESTAMP(),updated_at=UTC_TIMESTAMP() WHERE id=?");
                    $done->execute([$job['id']]);
                    $results[] = ['id' => $job['id'], 'status' => 'SUCCEEDED'];
                } catch (Throwable $error) {
                    $attempt = (int)$job['attempts'];
                    $retry = $attempt < (int)$job['max_attempts'];
                    $failed = $this->db->prepare("UPDATE automation_runs SET status=?,last_error=?,run_after=DATE_ADD(UTC_TIMESTAMP(),INTERVAL ? MINUTE),finished_at=IF(?='FAILED',UTC_TIMESTAMP(),NULL),updated_at=UTC_TIMESTAMP() WHERE id=?");
                    $message = substr($error->getMessage(), 0, 2000);
                    $failed->execute([$retry ? 'QUEUED' : 'FAILED', $message, 2 ** max(0, $attempt - 1), $retry ? 'QUEUED' : 'FAILED', $job['id']]);
                    if ($job['type'] === 'woocommerce.products.sync') {
                        $integration = $this->db->prepare("UPDATE integrations SET status='DEGRADED',last_error=?,updated_at=UTC_TIMESTAMP() WHERE tenant_id=? AND site_id=? AND provider='WOOCOMMERCE'");
                        $integration->execute([$message,$job['tenant_id'],$job['site_id']]);
                    }
                    $results[] = ['id' => $job['id'], 'status' => $retry ? 'RETRY_SCHEDULED' : 'FAILED'];
                }
            }
        } finally {
            $this->db->query("SELECT RELEASE_LOCK('qixu_cron_runner')");
        }
        return ['processed' => count($results), 'state' => 'COMPLETED', 'jobs' => $results];
    }

    private function claim(): ?array
    {
        $this->db->beginTransaction();
        $job = $this->db->query("SELECT * FROM automation_runs WHERE status='QUEUED' AND run_after<=UTC_TIMESTAMP() ORDER BY run_after,created_at LIMIT 1 FOR UPDATE")->fetch();
        if (!$job) {
            $this->db->commit();
            return null;
        }
        $query = $this->db->prepare("UPDATE automation_runs SET status='RUNNING',attempts=attempts+1,started_at=UTC_TIMESTAMP(),last_error=NULL,updated_at=UTC_TIMESTAMP() WHERE id=?");
        $query->execute([$job['id']]);
        $this->db->commit();
        $job['attempts'] = (int)$job['attempts'] + 1;
        return $job;
    }

    private function dispatch(array $job): void
    {
        $payload = json_decode((string)$job['payload'], true, 512, JSON_THROW_ON_ERROR);
        if ($job['type'] !== 'woocommerce.products.sync') throw new \RuntimeException('Unsupported task type: ' . $job['type']);
        (new Integrations($this->db, $this))->syncWooCommercePage($job['tenant_id'], $job['site_id'], $payload);
    }
}
