<?php
declare(strict_types=1);

function user_order_create(PDO $db, int $userId, array $data): int
{
    $db->beginTransaction();
    try {
        $lines = [];
        $shortages = [];
        $total = 0.0;
        foreach ($data['items'] as $productId => $quantity) {
            $product = user_order_lock_product($db, (int) $productId);
            if (!$product || !$product['is_active']) {
                $db->rollBack();
                json_response(['message' => 'มีสินค้าในตะกร้าที่ไม่เปิดขายแล้ว กรุณาตรวจสอบรายการอีกครั้ง'], 409);
            }
            // เก็บของที่ไม่พอไว้ให้ครบทุกตัวก่อน แล้วค่อยตอบทีเดียว ลูกค้าจะได้แก้ตะกร้าจบในรอบเดียว
            if ((int) $product['stock_quantity'] < $quantity) {
                $shortages[] = ['name' => $product['name'], 'remaining' => (int) $product['stock_quantity'], 'unitName' => $product['unit_name']];
                continue;
            }
            $unitPrice = (float) $product['sale_price'];
            $lines[] = [
                'product_id' => (int) $product['id'],
                'product_name' => $product['name'],
                'unit_name' => $product['unit_name'],
                'quantity' => $quantity,
                'unit_price' => $unitPrice,
                'line_total' => $unitPrice * $quantity,
            ];
            $total += $unitPrice * $quantity;
            user_order_change_stock($db, $product, $quantity, -1);
        }

        if ($shortages) {
            $db->rollBack();
            json_response(['message' => 'สินค้าที่มีไม่พอกับที่สั่ง', 'shortages' => $shortages], 409);
        }

        $orderId = user_order_insert($db, $userId, $data, $lines, $total);
        $db->commit();
        return $orderId;
    } catch (Throwable $exception) {
        if ($db->inTransaction()) $db->rollBack();
        throw $exception;
    }
}

function user_order_route(string $method, string $path): bool
{
    if (!str_starts_with($path, '/user/orders')) return false;

    $db = app_db();
    $user = user_auth_current($db);
    if (!$user) json_response(['message' => 'กรุณาเข้าสู่ระบบก่อนสั่งซื้อ'], 401);
    $userId = (int) $user['id'];

    if ($method === 'GET' && $path === '/user/orders') {
        json_response(['data' => user_order_list($db, $userId)]);
    }

    if ($method === 'POST' && $path === '/user/orders') {
        [$data, $errors] = user_order_validate_input($_POST);
        if (!$errors && !user_auth_active_location_exists($db, $data['location_id'])) $errors['location_id'] = 'ไม่พบสถานที่ส่งของที่เลือก';
        if ($errors) json_response(['message' => (string) reset($errors), 'errors' => $errors], 422);

        $cutoff = user_order_period_cutoff(settings_find($db), $data['delivery_period']);
        if (date('H:i:s') > $cutoff) {
            json_response(['message' => sprintf('เลยเวลาสั่ง%sของวันนี้แล้ว (ปิดรับ %s น.)', user_order_period_label($data['delivery_period']), substr($cutoff, 0, 5))], 422);
        }

        $orderId = user_order_create($db, $userId, $data);
        $order = user_order_find($db, $orderId, $userId);
        json_response(['data' => user_order_to_api($order, user_order_items($db, $orderId))], 201);
    }

    if ($method === 'POST' && preg_match('#^/user/orders/(\d+)/pay$#', $path, $matches)) {
        $orderId = (int) $matches[1];
        $order = user_order_find($db, $orderId, $userId);
        if (!$order) json_response(['message' => 'ไม่พบคำสั่งซื้อนี้'], 404);
        if ($order['order_status'] === 'cancelled') json_response(['message' => 'คำสั่งซื้อนี้ถูกยกเลิกแล้ว กรุณาสั่งซื้อใหม่'], 409);
        if ($order['payment_status'] === 'pending') user_order_mark_paid($db, $orderId);

        $order = user_order_find($db, $orderId, $userId);
        json_response(['data' => user_order_to_api($order, user_order_items($db, $orderId))]);
    }

    return false;
}
