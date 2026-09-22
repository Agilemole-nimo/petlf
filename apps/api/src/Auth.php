<?php
declare(strict_types=1);

namespace Qixu;

use PDO;

final class Auth
{
    public function __construct(private readonly PDO $db) {}

    public function login(array $input): array
    {
        $email = strtolower(trim((string)($input['email'] ?? '')));
        $password = (string)($input['password'] ?? '');
        if (!filter_var($email, FILTER_VALIDATE_EMAIL) || $password === '') {
            throw new HttpError(422, 'A valid email and password are required.', 'VALIDATION_FAILED');
        }
        $query = $this->db->prepare('SELECT id, tenant_id, email, name, password_hash, role FROM users WHERE email = ? AND status = \'ACTIVE\' AND deleted_at IS NULL LIMIT 1');
        $query->execute([$email]);
        $user = $query->fetch();
        if (!$user || !password_verify($password, $user['password_hash'])) {
            throw new HttpError(401, 'Invalid email or password.', 'INVALID_CREDENTIALS');
        }
        $token = bin2hex(random_bytes(32));
        $csrf = bin2hex(random_bytes(24));
        $insert = $this->db->prepare('INSERT INTO sessions (id,user_id,token_hash,csrf_hash,expires_at,last_seen_at,created_at) VALUES (?,?,?,?,DATE_ADD(UTC_TIMESTAMP(), INTERVAL 8 HOUR),UTC_TIMESTAMP(),UTC_TIMESTAMP())');
        $insert->execute([Id::uuid(), $user['id'], hash('sha256', $token), hash('sha256', $csrf)]);
        setcookie('qixu_session', $token, ['expires' => time() + 28800, 'path' => '/', 'secure' => Env::get('APP_ENV', 'production') === 'production', 'httponly' => true, 'samesite' => 'Lax']);
        setcookie('qixu_csrf', $csrf, ['expires' => time() + 28800, 'path' => '/', 'secure' => Env::get('APP_ENV', 'production') === 'production', 'httponly' => false, 'samesite' => 'Lax']);
        return ['id' => $user['id'], 'tenantId' => $user['tenant_id'], 'email' => $user['email'], 'name' => $user['name'], 'role' => $user['role']];
    }

    public function user(bool $required = true): ?array
    {
        $token = $_COOKIE['qixu_session'] ?? '';
        if ($token === '') {
            if ($required) throw new HttpError(401, 'Authentication required.', 'UNAUTHENTICATED');
            return null;
        }
        $query = $this->db->prepare('SELECT u.id,u.tenant_id,u.email,u.name,u.role,s.id session_id FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.revoked_at IS NULL AND s.expires_at>UTC_TIMESTAMP() AND u.status=\'ACTIVE\' LIMIT 1');
        $query->execute([hash('sha256', $token)]);
        $user = $query->fetch();
        if (!$user) {
            if ($required) throw new HttpError(401, 'Session expired.', 'SESSION_EXPIRED');
            return null;
        }
        return $user;
    }

    public function logout(): void
    {
        $token = $_COOKIE['qixu_session'] ?? '';
        if ($token !== '') {
            $query = $this->db->prepare('UPDATE sessions SET revoked_at=UTC_TIMESTAMP() WHERE token_hash=? AND revoked_at IS NULL');
            $query->execute([hash('sha256', $token)]);
        }
        setcookie('qixu_session', '', ['expires' => 1, 'path' => '/', 'httponly' => true, 'samesite' => 'Lax']);
        setcookie('qixu_csrf', '', ['expires' => 1, 'path' => '/', 'samesite' => 'Lax']);
    }

    public function requireCsrf(): void
    {
        $cookie = $_COOKIE['qixu_csrf'] ?? '';
        $header = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
        if ($cookie === '' || !hash_equals($cookie, $header)) throw new HttpError(403, 'Invalid CSRF token.', 'CSRF_FAILED');
    }
}
