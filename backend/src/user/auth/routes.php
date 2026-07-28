<?php
declare(strict_types=1);

function customer_auth_current(PDO $db): ?array
{
    $id = customer_auth_current_id();
    if (!$id) return null;
    $user = customer_auth_find_by_id($db, $id);
    if ($user && !$user['is_active']) return null;
    return $user;
}

function customer_auth_route(string $method, string $path): bool
{
    if (!in_array($path, ['/user/auth/register', '/user/auth/login', '/user/auth/logout', '/user/auth/me'], true)) return false;
    $db = app_db();

    if ($method === 'GET' && $path === '/user/auth/me') {
        $user = customer_auth_current($db);
        if (!$user) json_response(['message' => 'กรุณาเข้าสู่ระบบ'], 401);
        json_response(['data' => customer_auth_to_api($user)]);
    }

    if ($method === 'POST' && $path === '/user/auth/register') {
        [$data, $errors] = customer_auth_validate_register($_POST);
        if (!$errors && customer_auth_phone_exists($db, $data['phone'])) $errors['phone'] = 'มีผู้ใช้งานที่ใช้เบอร์โทรศัพท์นี้แล้ว';
        if (!$errors && !customer_auth_active_location_exists($db, $data['default_location_id'])) $errors['location_id'] = 'ไม่พบสถานที่ส่งของที่เลือก';
        if ($errors) json_response(['message' => (string) reset($errors), 'errors' => $errors], 422);

        $userId = customer_auth_register($db, $data);
        customer_auth_login_session($userId);
        customer_auth_mark_login($db, $userId);
        json_response(['data' => customer_auth_to_api(customer_auth_find_by_id($db, $userId))], 201);
    }

    if ($method === 'POST' && $path === '/user/auth/login') {
        $phone = trim((string) ($_POST['phone'] ?? ''));
        $password = (string) ($_POST['password'] ?? '');
        if ($phone === '' || $password === '') json_response(['message' => 'กรุณากรอกเบอร์โทรศัพท์และรหัสผ่าน'], 422);

        $user = customer_auth_find_by_phone($db, $phone);
        if (!$user || !password_verify($password, $user['password_hash'])) {
            json_response(['message' => 'เบอร์โทรศัพท์หรือรหัสผ่านไม่ถูกต้อง'], 401);
        }
        if (!$user['is_active']) json_response(['message' => 'บัญชีนี้ถูกระงับการใช้งาน กรุณาติดต่อแอดมิน'], 403);

        customer_auth_login_session((int) $user['id']);
        customer_auth_mark_login($db, (int) $user['id']);
        json_response(['data' => customer_auth_to_api($user)]);
    }

    if ($method === 'POST' && $path === '/user/auth/logout') {
        customer_auth_logout();
        json_response(['message' => 'ออกจากระบบแล้ว']);
    }

    return false;
}
