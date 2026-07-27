<?php
declare(strict_types=1);

function user_route(string $method, string $path): bool
{
    $db = app_db();
    if ($method === 'GET' && $path === '/admin/users') json_response(['data' => array_map('user_to_api', user_list($db))]);
    if (!preg_match('#^/admin/users/(\d+)$#', $path, $matches) && !($method === 'POST' && $path === '/admin/users')) return false;
    $id = isset($matches[1]) ? (int) $matches[1] : null;
    if ($method === 'GET' && $id) { $user = user_find($db, $id); if (!$user) json_response(['message' => 'ไม่พบผู้ใช้งาน'], 404); json_response(['data' => user_to_api($user)]); }
    if ($method === 'DELETE' && $id) { if (!user_find($db, $id)) json_response(['message' => 'ไม่พบผู้ใช้งาน'], 404); user_remove($db, $id); json_response(['message' => 'ลบผู้ใช้งานแล้ว']); }
    if ($method !== 'POST') return false;
    $current = $id ? user_find($db, $id) : null;
    if ($id && !$current) json_response(['message' => 'ไม่พบผู้ใช้งาน'], 404);
    [$data, $errors] = user_validate_input($_POST, !$id);
    if (!$errors && !user_location_exists($db, $data['default_location_id'])) $errors['location_id'] = 'ไม่พบจุดรับสินค้าที่เลือก';
    if (!$errors && user_phone_is_taken($db, $data['phone'], $id)) $errors['phone'] = 'มีผู้ใช้งานที่ใช้เบอร์โทรศัพท์นี้แล้ว';
    if ($errors) json_response(['message' => 'ข้อมูลผู้ใช้งานไม่ถูกต้อง', 'errors' => $errors], 422);
    if ($id) user_update($db, $id, $data); else $id = user_insert($db, $data);
    json_response(['data' => user_to_api(user_find($db, $id))], $current ? 200 : 201);
}
