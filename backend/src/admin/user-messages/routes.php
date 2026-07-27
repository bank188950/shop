<?php
declare(strict_types=1);

function customer_message_route(string $method, string $path): bool
{
    if (!preg_match('#^/admin/users/(\d+)/messages(?:/(\d+))?$#', $path, $matches)) return false;

    $userId = (int) $matches[1];
    $messageId = isset($matches[2]) ? (int) $matches[2] : null;
    $db = app_db();
    if (!user_find($db, $userId)) json_response(['message' => 'ไม่พบผู้ใช้งาน'], 404);

    if ($method === 'GET' && !$messageId) {
        json_response(['data' => array_map('customer_message_to_api', customer_message_list($db, $userId))]);
    }

    if ($method === 'DELETE' && $messageId) {
        $message = customer_message_find($db, $userId, $messageId);
        if (!$message) json_response(['message' => 'ไม่พบข้อความ'], 404);
        customer_message_remove($db, $messageId);
        customer_message_delete_image($message['image_path']);
        json_response(['message' => 'ลบข้อความแล้ว']);
    }

    if ($method !== 'POST' || (!$messageId && $path !== "/admin/users/{$userId}/messages")) return false;
    $current = $messageId ? customer_message_find($db, $userId, $messageId) : null;
    if ($messageId && !$current) json_response(['message' => 'ไม่พบข้อความ'], 404);

    $newImagePath = customer_message_upload_image($_FILES['image'] ?? null);
    [$data, $errors] = customer_message_validate_input($_POST, $newImagePath !== null, $current !== null);
    if ($errors) {
        if ($newImagePath) customer_message_delete_image($newImagePath);
        json_response(['message' => 'ข้อมูลข้อความไม่ถูกต้อง', 'errors' => $errors], 422);
    }

    $data['image_path'] = $newImagePath ?? ($data['remove_image'] ? null : ($current['image_path'] ?? null));
    if (!$data['body'] && !$data['image_path']) {
        if ($newImagePath) customer_message_delete_image($newImagePath);
        json_response(['message' => 'กรุณาระบุข้อความหรือแนบรูปภาพ'], 422);
    }

    try {
        if ($current) {
            customer_message_update($db, $messageId, $data);
            $savedId = $messageId;
        } else {
            $savedId = customer_message_insert($db, $userId, $data);
        }
    } catch (Throwable) {
        if ($newImagePath) customer_message_delete_image($newImagePath);
        json_response(['message' => 'ไม่สามารถบันทึกข้อความได้'], 500);
    }

    if ($current && $newImagePath) customer_message_delete_image($current['image_path']);
    if ($current && $data['remove_image'] && !$newImagePath) customer_message_delete_image($current['image_path']);
    json_response(['data' => customer_message_to_api(customer_message_find($db, $userId, $savedId))], $current ? 200 : 201);
}
