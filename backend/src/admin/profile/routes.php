<?php
declare(strict_types=1);

function admin_profile_route(string $method, string $path): bool
{
    if ($path !== '/admin/profile') return false;
    $db = app_db();
    if ($method === 'GET') json_response(['data' => admin_profile_to_api(admin_profile_find($db))]);
    if ($method !== 'POST') return false;

    [$data, $errors] = admin_profile_validate_input($_POST);
    if ($errors) json_response(['message' => 'ข้อมูลผู้ดูแลระบบไม่ถูกต้อง', 'errors' => $errors], 422);
    $current = admin_profile_find($db);
    $newAvatarFilename = admin_profile_upload_avatar($_FILES['avatar'] ?? null);
    $data['avatar_filename'] = $newAvatarFilename ?? $current['avatar_filename'];

    try {
        admin_profile_update($db, $data);
    } catch (Throwable) {
        if ($newAvatarFilename) admin_profile_delete_avatar($newAvatarFilename);
        json_response(['message' => 'ไม่สามารถบันทึกข้อมูลผู้ดูแลระบบได้'], 500);
    }

    if ($newAvatarFilename) admin_profile_delete_avatar($current['avatar_filename']);
    json_response(['data' => admin_profile_to_api(admin_profile_find($db))]);
}
