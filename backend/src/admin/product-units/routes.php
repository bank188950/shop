<?php
declare(strict_types=1);

function unit_route(string $method, string $path): bool
{
    $db = app_db();
    if ($method === 'GET' && $path === '/admin/product-units') {
        json_response(['data' => array_map('unit_to_api', unit_list($db))]);
    }

    if (!preg_match('#^/admin/product-units/(\d+)$#', $path, $matches) && !($method === 'POST' && $path === '/admin/product-units')) return false;
    $id = isset($matches[1]) ? (int) $matches[1] : null;
    if ($method === 'GET' && $id) {
        $unit = unit_find($db, $id);
        if (!$unit) json_response(['message' => 'ไม่พบหน่วยสินค้า'], 404);
        json_response(['data' => unit_to_api($unit)]);
    }
    if ($method === 'DELETE' && $id) {
        if (!unit_find($db, $id)) json_response(['message' => 'ไม่พบหน่วยสินค้า'], 404);
        try {
            unit_remove($db, $id);
            json_response(['message' => 'ลบหน่วยสินค้าแล้ว']);
        } catch (PDOException) {
            json_response(['message' => 'ไม่สามารถลบหน่วยสินค้าที่ถูกใช้กับสินค้าอยู่ได้'], 409);
        }
    }
    if ($method !== 'POST') return false;

    $current = $id ? unit_find($db, $id) : null;
    if ($id && !$current) json_response(['message' => 'ไม่พบหน่วยสินค้า'], 404);
    [$data, $errors] = unit_validate_input($_POST);
    if (!$errors && unit_name_is_taken($db, $data['name'], $id)) $errors['name'] = 'มีชื่อหน่วยสินค้านี้แล้ว';
    if ($errors) json_response(['message' => 'ข้อมูลหน่วยสินค้าไม่ถูกต้อง', 'errors' => $errors], 422);

    $unitId = $id ?? unit_insert($db, $data);
    if ($id) unit_update($db, $id, $data);
    json_response(['data' => unit_to_api(unit_find($db, $unitId))], $id ? 200 : 201);
}
