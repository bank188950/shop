<?php
declare(strict_types=1);

function user_inbox_route(string $method, string $path): bool
{
    if ($method !== 'GET' || $path !== '/user/messages') return false;

    $db = app_db();
    $user = user_auth_current($db);
    if (!$user) json_response(['message' => 'กรุณาเข้าสู่ระบบเพื่อดูข้อความ'], 401);

    // ใช้ repository ตัวเดียวกับฝั่งแอดมิน ข้อความที่ลูกค้าเห็นจะได้ตรงกับที่แอดมินส่งเสมอ
    json_response(['data' => [
        'adminAvatarUrl' => admin_profile_to_api(admin_profile_find($db))['avatarUrl'],
        'messages' => array_map('user_message_to_api', user_message_list($db, (int) $user['id'])),
    ]]);
}
