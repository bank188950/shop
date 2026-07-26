<?php
declare(strict_types=1);

function product_route(string $method, string $path): bool
{
    $db = app_db();

    if ($method === 'GET' && $path === '/admin/products') {
        $page = max(1, (int) ($_GET['page'] ?? 1));
        $perPage = min(100, max(1, (int) ($_GET['per_page'] ?? 10)));
        json_response(product_list($db, $page, $perPage));
    }

    if (!preg_match('#^/admin/products/(\d+)$#', $path, $matches) && !($method === 'POST' && $path === '/admin/products')) return false;

    $id = isset($matches[1]) ? (int) $matches[1] : null;

    if ($method === 'GET' && $id) {
        $product = product_find($db, $id);
        if (!$product) json_response(['message' => 'ไม่พบสินค้า'], 404);
        json_response(['data' => product_to_api($product)]);
    }

    if ($method === 'DELETE' && $id) {
        $product = product_find($db, $id);
        if (!$product) json_response(['message' => 'ไม่พบสินค้า'], 404);
        try {
            product_remove($db, $id);
            product_delete_image($product['image_path']);
            json_response(['message' => 'ลบสินค้าแล้ว']);
        } catch (PDOException) {
            json_response(['message' => 'ไม่สามารถลบสินค้าที่มีข้อมูลอ้างอิงอยู่ได้'], 409);
        }
    }

    if ($method !== 'POST') return false;

    $current = $id ? product_find($db, $id) : null;
    if ($id && !$current) json_response(['message' => 'ไม่พบสินค้า'], 404);

    [$data, $errors] = product_validate_input($_POST);
    if (!$errors) $errors = product_references_exist($db, $data);
    if ($errors) json_response(['message' => 'ข้อมูลสินค้าไม่ถูกต้อง', 'errors' => $errors], 422);

    $data = product_apply_category_stock_rule($db, $data);
    $newImagePath = product_upload_image($_FILES['image'] ?? null);
    $data['image_path'] = $newImagePath ?? $current['image_path'] ?? null;

    try {
        $db->beginTransaction();
        if ($id) {
            product_update($db, $id, $data);
            $productId = $id;
        } else {
            $productId = product_insert($db, $data);
        }
        $db->commit();
    } catch (Throwable) {
        if ($db->inTransaction()) $db->rollBack();
        if ($newImagePath) product_delete_image($newImagePath);
        json_response(['message' => 'ไม่สามารถบันทึกสินค้าได้'], 500);
    }

    if ($current && $newImagePath) product_delete_image($current['image_path']);
    $savedProduct = product_find($db, $productId);
    json_response(['data' => product_to_api($savedProduct)], $id ? 200 : 201);
}
