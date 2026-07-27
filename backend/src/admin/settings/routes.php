<?php
declare(strict_types=1);

function settings_route(string $method, string $path): bool
{
    if ($path !== '/admin/settings') return false;
    $db = app_db();
    if ($method === 'GET') {
        json_response(['data' => settings_to_api(settings_find($db), settings_advertisement_list($db))]);
    }
    if ($method !== 'POST') return false;

    [$data, $errors] = settings_validate_input($_POST);
    if ($errors) json_response(['message' => 'ข้อมูลตั้งค่าไม่ถูกต้อง', 'errors' => $errors], 422);

    try {
        $db->beginTransaction();
        settings_ensure_row($db);
        settings_update($db, $data);
        settings_replace_advertisements($db, $data['advertisements'], (bool) $data['is_advertisement_visible']);
        $db->commit();
    } catch (Throwable) {
        if ($db->inTransaction()) $db->rollBack();
        json_response(['message' => 'ไม่สามารถบันทึกการตั้งค่าได้'], 500);
    }

    json_response(['data' => settings_to_api(settings_find($db), settings_advertisement_list($db))]);
}
