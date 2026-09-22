<?php
declare(strict_types=1);

namespace Qixu;

use PDO;
use RuntimeException;

final class Env
{
    private static ?array $fileConfig = null;

    public static function get(string $key, ?string $default = null): string
    {
        $value = getenv($key);
        if (($value === false || $value === '') && self::$fileConfig === null) {
            $path = dirname(__DIR__) . '/config.local.php';
            self::$fileConfig = is_file($path) ? (array) require $path : [];
        }
        if ($value === false || $value === '') $value = self::$fileConfig[$key] ?? false;
        if ($value === false || $value === '') {
            if ($default !== null) return $default;
            throw new RuntimeException("Missing environment variable: {$key}");
        }
        return $value;
    }
}

final class Database
{
    private static ?PDO $connection = null;

    public static function connection(): PDO
    {
        if (self::$connection) return self::$connection;
        $dsn = sprintf(
            'mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',
            Env::get('DB_HOST', 'localhost'),
            Env::get('DB_PORT', '3306'),
            Env::get('DB_DATABASE')
        );
        self::$connection = new PDO($dsn, Env::get('DB_USERNAME'), Env::get('DB_PASSWORD'), [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
        self::$connection->exec("SET time_zone = '+00:00'");
        return self::$connection;
    }
}

final class HttpError extends RuntimeException
{
    public function __construct(public readonly int $status, string $message, public readonly string $code = 'REQUEST_FAILED')
    {
        parent::__construct($message);
    }
}

final class Http
{
    public static function json(array $body, int $status = 200): never
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        header('X-Content-Type-Options: nosniff');
        echo json_encode($body, JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES);
        exit;
    }

    public static function body(): array
    {
        $raw = file_get_contents('php://input') ?: '{}';
        $data = json_decode($raw, true);
        if (!is_array($data)) throw new HttpError(400, 'Request body must be a JSON object.', 'INVALID_JSON');
        return $data;
    }

    public static function bearer(): ?string
    {
        $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        return preg_match('/^Bearer\s+(.+)$/i', $header, $match) ? trim($match[1]) : null;
    }

    public static function redirect(string $url, int $status = 302): never
    {
        header('Cache-Control: no-store');
        header('Location: ' . $url, true, $status);
        exit;
    }
}

final class Id
{
    public static function uuid(): string
    {
        $bytes = random_bytes(16);
        $bytes[6] = chr((ord($bytes[6]) & 0x0f) | 0x40);
        $bytes[8] = chr((ord($bytes[8]) & 0x3f) | 0x80);
        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($bytes), 4));
    }
}
