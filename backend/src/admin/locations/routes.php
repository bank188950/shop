<?php
declare(strict_types=1);

function location_route(string $method, string $path): bool
{
    $db = app_db();
    if ($method === 'GET' && $path === '/admin/locations') {
        json_response(['data' => array_map('location_to_api', location_list($db))]);
    }

    if (!preg_match('#^/admin/locations/(\d+)$#', $path, $matches) && !($method === 'POST' && $path === '/admin/locations')) return false;
    $id = isset($matches[1]) ? (int) $matches[1] : null;

    if ($method === 'GET' && $id) {
        $location = location_find($db, $id);
        if (!$location) json_response(['message' => 'ไม่พบสถานที่รับสินค้า'], 404);
        json_response(['data' => location_to_api($location)]);
    }
    if ($method === 'DELETE' && $id) {
        if (!location_find($db, $id)) json_response(['message' => 'ไม่พบสถานที่รับสินค้า'], 404);
        try {
            location_remove($db, $id);
            json_response(['message' => 'ลบสถานที่รับสินค้าแล้ว']);
        } catch (PDOException) {
            json_response(['message' => 'ไม่สามารถลบสถานที่รับสินค้าที่ถูกใช้งานอยู่ได้'], 409);
        }
    }
    if ($method !== 'POST') return false;

    $current = $id ? location_find($db, $id) : null;
    if ($id && !$current) json_response(['message' => 'ไม่พบสถานที่รับสินค้า'], 404);
    [$data, $errors] = location_validate_input($_POST);
    if (!$errors && location_name_is_taken($db, $data['name'], $id)) $errors['name'] = 'มีชื่อสถานที่รับสินค้านี้แล้ว';
    if ($errors) json_response(['message' => 'ข้อมูลสถานที่รับสินค้าไม่ถูกต้อง', 'errors' => $errors], 422);

    $locationId = $id ?? location_insert($db, $data);
    if ($id) location_update($db, $id, $data);
    json_response(['data' => location_to_api(location_find($db, $locationId))], $id ? 200 : 201);
}
