<?php
declare(strict_types=1);

use App\Http\Response;

require_once dirname(__DIR__, 2) . '/src/bootstrap.php';

$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?? '/';
$path = preg_replace('#^/api#', '', $path) ?: '/';

if ($_SERVER['REQUEST_METHOD'] === 'GET' && $path === '/health') {
    Response::json(['status' => 'ok']);
}

Response::json(['message' => 'ไม่พบ API ที่เรียกใช้'], 404);
