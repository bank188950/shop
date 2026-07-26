<?php
declare(strict_types=1);

function category_route(string $method, string $path): bool
{
    $db = app_db();
    if ($method === 'GET' && $path === '/admin/product-categories') {
        $activeOnly = ($_GET['active'] ?? '') === '1';
        json_response(['data' => array_map('category_to_api', category_list($db, $activeOnly))]);
    }

    if (!preg_match('#^/admin/product-categories/(\d+)$#', $path, $matches) && !($method === 'POST' && $path === '/admin/product-categories')) return false;
    $id = isset($matches[1]) ? (int) $matches[1] : null;

    if ($method === 'GET' && $id) {
        $category = category_find($db, $id);
        if (!$category) json_response(['message' => 'ไม่พบหมวดสินค้า'], 404);
        json_response(['data' => category_to_api($category)]);
    }
    if ($method === 'DELETE' && $id) {
        if (!category_find($db, $id)) json_response(['message' => 'ไม่พบหมวดสินค้า'], 404);
        try {
            category_remove($db, $id);
            json_response(['message' => 'ลบหมวดสินค้าแล้ว']);
        } catch (PDOException) {
            json_response(['message' => 'ไม่สามารถลบหมวดสินค้าที่ถูกใช้กับสินค้าอยู่ได้'], 409);
        }
    }
    if ($method !== 'POST') return false;

    $current = $id ? category_find($db, $id) : null;
    if ($id && !$current) json_response(['message' => 'ไม่พบหมวดสินค้า'], 404);
    [$data, $errors] = category_validate_input($_POST);
    if (!$errors && category_name_is_taken($db, $data['name'], $id)) $errors['name'] = 'มีชื่อหมวดสินค้านี้แล้ว';
    if ($errors) json_response(['message' => 'ข้อมูลหมวดสินค้าไม่ถูกต้อง', 'errors' => $errors], 422);

    $categoryId = $id ?? category_insert($db, $data);
    if ($id) category_update($db, $id, $data);
    json_response(['data' => category_to_api(category_find($db, $categoryId))], $id ? 200 : 201);
}
