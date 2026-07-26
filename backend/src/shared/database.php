<?php
declare(strict_types=1);

use PDO;

function app_db(): PDO
{
    static $connection = null;

    if ($connection instanceof PDO) return $connection;

    $database = $_ENV['DB_DATABASE'] ?? $_ENV['DB_NAME'] ?? 'lorluean_shop_db';
    $dsn = sprintf(
        'mysql:host=%s;port=%s;dbname=%s;charset=%s',
        $_ENV['DB_HOST'] ?? '127.0.0.1',
        $_ENV['DB_PORT'] ?? '3306',
        $database,
        $_ENV['DB_CHARSET'] ?? 'utf8mb4',
    );

    $connection = new PDO($dsn, $_ENV['DB_USERNAME'] ?? $_ENV['DB_USER'] ?? 'root', $_ENV['DB_PASSWORD'] ?? $_ENV['DB_PASS'] ?? '', [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);

    return $connection;
}
