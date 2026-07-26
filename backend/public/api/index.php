<?php
declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/src/bootstrap.php';
require_once dirname(__DIR__, 2) . '/src/shared/database.php';
require_once dirname(__DIR__, 2) . '/src/shared/http.php';
require_once dirname(__DIR__, 2) . '/src/admin/products/product-validation.php';
require_once dirname(__DIR__, 2) . '/src/admin/products/product-upload.php';
require_once dirname(__DIR__, 2) . '/src/admin/products/product-repository.php';
require_once dirname(__DIR__, 2) . '/src/admin/products/routes.php';
require_once dirname(__DIR__, 2) . '/src/admin/product-categories/validation.php';
require_once dirname(__DIR__, 2) . '/src/admin/product-categories/repository.php';
require_once dirname(__DIR__, 2) . '/src/admin/product-categories/routes.php';
require_once dirname(__DIR__, 2) . '/src/admin/product-units/validation.php';
require_once dirname(__DIR__, 2) . '/src/admin/product-units/repository.php';
require_once dirname(__DIR__, 2) . '/src/admin/product-units/routes.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$path = api_path();

if ($method === 'GET' && $path === '/health') json_response(['status' => 'ok']);
if (product_route($method, $path)) exit;
if (category_route($method, $path)) exit;
if (unit_route($method, $path)) exit;

json_response(['message' => 'ไม่พบ API ที่เรียกใช้'], 404);
