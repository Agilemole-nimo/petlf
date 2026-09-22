<?php
declare(strict_types=1);

namespace Qixu;

use PDO;
use RuntimeException;

final class GoogleOAuth
{
    private const PROVIDERS = [
        'ga4' => [
            'database' => 'GA4',
            'scope' => 'https://www.googleapis.com/auth/analytics.readonly',
            'verifyUrl' => 'https://analyticsadmin.googleapis.com/v1beta/accountSummaries?pageSize=200',
            'resourceKey' => 'accountSummaries',
        ],
        'search-console' => [
            'database' => 'SEARCH_CONSOLE',
            'scope' => 'https://www.googleapis.com/auth/webmasters.readonly',
            'verifyUrl' => 'https://www.googleapis.com/webmasters/v3/sites',
            'resourceKey' => 'siteEntry',
        ],
    ];

    public function __construct(private readonly PDO $db) {}

    public function start(array $user, string $siteId, string $provider): never
    {
        $definition = self::PROVIDERS[$provider] ?? null;
        if (!$definition) throw new HttpError(422, 'Unsupported Google provider.', 'INVALID_PROVIDER');

        $state = bin2hex(random_bytes(32));
        $query = $this->db->prepare('INSERT INTO oauth_states (id,tenant_id,site_id,user_id,provider,state_hash,expires_at,created_at) VALUES (?,?,?,?,?,?,DATE_ADD(UTC_TIMESTAMP(),INTERVAL 10 MINUTE),UTC_TIMESTAMP())');
        $query->execute([Id::uuid(),$user['tenant_id'],$siteId,$user['id'],$definition['database'],hash('sha256', $state)]);

        $parameters = [
            'client_id' => Env::get('GOOGLE_CLIENT_ID'),
            'redirect_uri' => Env::get('GOOGLE_REDIRECT_URI'),
            'response_type' => 'code',
            'scope' => $definition['scope'],
            'access_type' => 'offline',
            'include_granted_scopes' => 'true',
            'prompt' => 'consent',
            'state' => $state,
        ];
        Http::redirect('https://accounts.google.com/o/oauth2/v2/auth?' . http_build_query($parameters, '', '&', PHP_QUERY_RFC3986));
    }

    public function callback(array $user, array $input): never
    {
        if (isset($input['error'])) throw new HttpError(400, 'Google authorization was cancelled or denied.', 'GOOGLE_AUTH_DENIED');
        $state = (string)($input['state'] ?? '');
        $code = (string)($input['code'] ?? '');
        if ($state === '' || $code === '') throw new HttpError(400, 'Google callback is missing code or state.', 'INVALID_GOOGLE_CALLBACK');

        $query = $this->db->prepare('SELECT id,site_id,provider FROM oauth_states WHERE state_hash=? AND tenant_id=? AND user_id=? AND used_at IS NULL AND expires_at>UTC_TIMESTAMP() LIMIT 1');
        $query->execute([hash('sha256', $state), $user['tenant_id'], $user['id']]);
        $oauthState = $query->fetch();
        if (!$oauthState) throw new HttpError(400, 'Google connection state expired. Start the connection again.', 'OAUTH_STATE_EXPIRED');

        $providerKey = $oauthState['provider'] === 'GA4' ? 'ga4' : 'search-console';
        $definition = self::PROVIDERS[$providerKey];
        $token = $this->requestForm('https://oauth2.googleapis.com/token', [
            'code' => $code,
            'client_id' => Env::get('GOOGLE_CLIENT_ID'),
            'client_secret' => Env::get('GOOGLE_CLIENT_SECRET'),
            'redirect_uri' => Env::get('GOOGLE_REDIRECT_URI'),
            'grant_type' => 'authorization_code',
        ]);
        if (!isset($token['access_token'])) throw new HttpError(502, 'Google did not return an access token.', 'GOOGLE_TOKEN_FAILED');

        $resources = $this->requestJson($definition['verifyUrl'], (string)$token['access_token']);
        $resourceCount = count($resources[$definition['resourceKey']] ?? []);
        $token['expires_at'] = time() + (int)($token['expires_in'] ?? 3600);
        unset($token['expires_in']);

        [$ciphertext, $nonce] = $this->encrypt($token);
        $this->db->beginTransaction();
        try {
            $markUsed = $this->db->prepare('UPDATE oauth_states SET used_at=UTC_TIMESTAMP() WHERE id=? AND used_at IS NULL');
            $markUsed->execute([$oauthState['id']]);
            if ($markUsed->rowCount() !== 1) throw new RuntimeException('OAuth state was already used.');

            $integrationQuery = $this->db->prepare('SELECT id FROM integrations WHERE tenant_id=? AND site_id=? AND provider=? LIMIT 1');
            $integrationQuery->execute([$user['tenant_id'],$oauthState['site_id'],$definition['database']]);
            $integration = $integrationQuery->fetch();
            if (!$integration) throw new RuntimeException('Google integration seed is missing.');

            $credential = $this->db->prepare("INSERT INTO integration_credentials (id,integration_id,ciphertext,nonce,key_version,updated_at) VALUES (?,?,?,?, 'v1',UTC_TIMESTAMP()) ON DUPLICATE KEY UPDATE ciphertext=VALUES(ciphertext),nonce=VALUES(nonce),key_version='v1',updated_at=UTC_TIMESTAMP()");
            $credential->execute([Id::uuid(), $integration['id'], $ciphertext, $nonce]);

            $config = json_encode([
                'connection' => 'google_oauth',
                'scope' => $definition['scope'],
                'accessibleResourceCount' => $resourceCount,
                'connectedAt' => gmdate(DATE_ATOM),
            ], JSON_THROW_ON_ERROR);
            $update = $this->db->prepare("UPDATE integrations SET status='SYNCED',config=?,last_error=NULL,updated_at=UTC_TIMESTAMP() WHERE id=?");
            $update->execute([$config, $integration['id']]);
            $this->db->commit();
        } catch (\Throwable $error) {
            $this->db->rollBack();
            throw $error;
        }

        Http::redirect(rtrim(Env::get('APP_URL'), '/') . '/integrations/?provider=' . rawurlencode($providerKey) . '&siteId=' . rawurlencode((string)$oauthState['site_id']) . '&status=connected');
    }

    private function requestForm(string $url, array $fields): array
    {
        $curl = curl_init($url);
        curl_setopt_array($curl, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => http_build_query($fields, '', '&', PHP_QUERY_RFC3986),
            CURLOPT_HTTPHEADER => ['Accept: application/json', 'Content-Type: application/x-www-form-urlencoded'],
            CURLOPT_TIMEOUT => 30,
        ]);
        return $this->decodeResponse($curl, 'Google token exchange');
    }

    private function requestJson(string $url, string $accessToken): array
    {
        $curl = curl_init($url);
        curl_setopt_array($curl, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => ['Accept: application/json', 'Authorization: Bearer ' . $accessToken],
            CURLOPT_TIMEOUT => 30,
        ]);
        return $this->decodeResponse($curl, 'Google API verification');
    }

    private function decodeResponse(\CurlHandle $curl, string $operation): array
    {
        $body = curl_exec($curl);
        $status = (int)curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
        $curlError = curl_error($curl);
        curl_close($curl);
        if ($body === false || $status < 200 || $status >= 300) {
            error_log($operation . ' failed with HTTP ' . $status . ($curlError ? ': ' . $curlError : ''));
            throw new HttpError(502, $operation . ' failed. Confirm the API is enabled and the Google account has access.', 'GOOGLE_API_FAILED');
        }
        $decoded = json_decode($body, true);
        if (!is_array($decoded)) throw new HttpError(502, $operation . ' returned invalid JSON.', 'GOOGLE_API_INVALID_RESPONSE');
        return $decoded;
    }

    private function encrypt(array $value): array
    {
        $key = base64_decode(Env::get('APP_KEY'), true);
        if ($key === false || strlen($key) !== SODIUM_CRYPTO_SECRETBOX_KEYBYTES) throw new RuntimeException('APP_KEY must be a base64-encoded 32-byte key.');
        $nonce = random_bytes(SODIUM_CRYPTO_SECRETBOX_NONCEBYTES);
        $plaintext = json_encode($value, JSON_THROW_ON_ERROR);
        return [sodium_crypto_secretbox($plaintext, $nonce, $key), $nonce];
    }
}
