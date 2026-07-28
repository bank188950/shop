<?php
declare(strict_types=1);

function customer_profile_route(string $method, string $path): bool
{
    if (!($method === 'POST' && $path === '/user/profile')) return false;

    $db = app_db();
    $user = customer_auth_current($db);
    if (!$user) json_response(['message' => 'กรุณาเข้าสู่ระบบ'], 401);

    [$data, $errors] = customer_profile_validate_input($_POST);
    if (!$errors && customer_profile_phone_is_taken($db, $data['phone'], (int) $user['id'])) $errors['phone'] = 'มีผู้ใช้งานที่ใช้เบอร์โทรศัพท์นี้แล้ว';
    if (!$errors && !customer_auth_active_location_exists($db, $data['default_location_id'])) $errors['location_id'] = 'ไม่พบสถานที่ส่งของที่เลือก';
    if ($errors) json_response(['message' => (string) reset($errors), 'errors' => $errors], 422);

    customer_profile_update($db, (int) $user['id'], $data);
    json_response(['data' => customer_auth_to_api(customer_auth_find_by_id($db, (int) $user['id']))]);
}
