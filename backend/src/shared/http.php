<?php
declare(strict_types=1);

function json_response(array $data, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function api_path(): string
{
    $path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?? '/';
    return preg_replace('#^/api#', '', $path) ?: '/';
}

function public_url(?string $path): ?string
{
    if (!$path) return null;
    return rtrim($_ENV['APP_URL'] ?? 'http://localhost:8000', '/') . '/' . ltrim($path, '/');
}
