<?php
declare(strict_types=1);

function admin_auth_current(PDO $db): ?array
{
    $id = admin_auth_current_id();
    return $id ? admin_auth_find_by_id($db, $id) : null;
}

function admin_auth_route(string $method, string $path): bool
{
    if (!in_array($path, ['/admin/auth/login', '/admin/auth/logout', '/admin/auth/me'], true)) return false;
    $db = app_db();

    if ($method === 'GET' && $path === '/admin/auth/me') {
        $admin = admin_auth_current($db);
        if (!$admin) json_response(['message' => 'กรุณาเข้าสู่ระบบ'], 401);
        json_response(['data' => admin_auth_to_api($admin)]);
    }

    if ($method === 'POST' && $path === '/admin/auth/login') {
        $username = trim((string) ($_POST['username'] ?? ''));
        $password = (string) ($_POST['password'] ?? '');
        if ($username === '' || $password === '') json_response(['message' => 'กรุณาระบุชื่อผู้ใช้และรหัสผ่าน'], 422);
        $admin = admin_auth_find_by_username($db, $username);
        if (!$admin || !$admin['password_hash'] || !password_verify($password, $admin['password_hash'])) {
            json_response(['message' => 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'], 401);
        }
        $remember = ($_POST['remember'] ?? '0') === '1';
        admin_auth_login_session((int) $admin['id'], $remember);
        admin_auth_mark_login($db, (int) $admin['id']);
        json_response(['data' => admin_auth_to_api($admin)]);
    }

    if ($method === 'POST' && $path === '/admin/auth/logout') {
        admin_auth_logout();
        json_response(['message' => 'ออกจากระบบแล้ว']);
    }

    return false;
}
