<?php
declare(strict_types=1);

ini_set('display_errors', '0');
ini_set('log_errors', '1');

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
require_once dirname(__DIR__, 2) . '/src/admin/locations/validation.php';
require_once dirname(__DIR__, 2) . '/src/admin/locations/repository.php';
require_once dirname(__DIR__, 2) . '/src/admin/locations/routes.php';
require_once dirname(__DIR__, 2) . '/src/admin/banners/validation.php';
require_once dirname(__DIR__, 2) . '/src/admin/banners/upload.php';
require_once dirname(__DIR__, 2) . '/src/admin/banners/repository.php';
require_once dirname(__DIR__, 2) . '/src/admin/banners/routes.php';
require_once dirname(__DIR__, 2) . '/src/admin/settings/validation.php';
require_once dirname(__DIR__, 2) . '/src/admin/settings/repository.php';
require_once dirname(__DIR__, 2) . '/src/admin/settings/routes.php';
require_once dirname(__DIR__, 2) . '/src/admin/auth/repository.php';
require_once dirname(__DIR__, 2) . '/src/admin/auth/session.php';
require_once dirname(__DIR__, 2) . '/src/admin/auth/routes.php';
require_once dirname(__DIR__, 2) . '/src/admin/profile/validation.php';
require_once dirname(__DIR__, 2) . '/src/admin/profile/upload.php';
require_once dirname(__DIR__, 2) . '/src/admin/profile/repository.php';
require_once dirname(__DIR__, 2) . '/src/admin/profile/routes.php';
require_once dirname(__DIR__, 2) . '/src/admin/users/validation.php';
require_once dirname(__DIR__, 2) . '/src/admin/users/repository.php';
require_once dirname(__DIR__, 2) . '/src/admin/users/routes.php';
require_once dirname(__DIR__, 2) . '/src/admin/user-messages/validation.php';
require_once dirname(__DIR__, 2) . '/src/admin/user-messages/upload.php';
require_once dirname(__DIR__, 2) . '/src/admin/user-messages/repository.php';
require_once dirname(__DIR__, 2) . '/src/admin/user-messages/routes.php';
require_once dirname(__DIR__, 2) . '/src/user/auth/validation.php';
require_once dirname(__DIR__, 2) . '/src/user/auth/repository.php';
require_once dirname(__DIR__, 2) . '/src/user/auth/session.php';
require_once dirname(__DIR__, 2) . '/src/user/auth/routes.php';
require_once dirname(__DIR__, 2) . '/src/user/locations/routes.php';
require_once dirname(__DIR__, 2) . '/src/user/products/routes.php';
require_once dirname(__DIR__, 2) . '/src/user/profile/validation.php';
require_once dirname(__DIR__, 2) . '/src/user/profile/repository.php';
require_once dirname(__DIR__, 2) . '/src/user/profile/routes.php';
require_once dirname(__DIR__, 2) . '/src/user/orders/validation.php';
require_once dirname(__DIR__, 2) . '/src/user/orders/repository.php';
require_once dirname(__DIR__, 2) . '/src/user/orders/routes.php';
require_once dirname(__DIR__, 2) . '/src/user/settings/routes.php';
require_once dirname(__DIR__, 2) . '/src/user/messages/routes.php';
require_once dirname(__DIR__, 2) . '/src/user/banners/routes.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$path = api_path();

try {
    if ($method === 'GET' && $path === '/health') json_response(['status' => 'ok']);
    if (admin_auth_route($method, $path)) exit;
    if (user_auth_route($method, $path)) exit;
    if (user_location_route($method, $path)) exit;
    if (user_product_route($method, $path)) exit;
    if (user_profile_route($method, $path)) exit;
    if (user_settings_route($method, $path)) exit;
    if (user_announcement_route($method, $path)) exit;
    if (user_banner_route($method, $path)) exit;
    if (user_recent_order_route($method, $path)) exit;
    if (user_order_route($method, $path)) exit;
    if (user_inbox_route($method, $path)) exit;
    if (str_starts_with($path, '/admin/') && !admin_auth_current(app_db())) json_response(['message' => 'กรุณาเข้าสู่ระบบ'], 401);
    if (product_route($method, $path)) exit;
    if (category_route($method, $path)) exit;
    if (unit_route($method, $path)) exit;
    if (location_route($method, $path)) exit;
    if (banner_route($method, $path)) exit;
    if (settings_route($method, $path)) exit;
    if (admin_profile_route($method, $path)) exit;
    if (user_message_route($method, $path)) exit;
    if (user_route($method, $path)) exit;
} catch (Throwable $exception) {
    $message = 'ไม่สามารถเชื่อมต่อฐานข้อมูลหรือประมวลผล API ได้';
    if (($_ENV['APP_ENV'] ?? '') === 'local') $message .= ': ' . $exception->getMessage();
    json_response(['message' => $message], 500);
}

json_response(['message' => 'ไม่พบ API ที่เรียกใช้'], 404);
