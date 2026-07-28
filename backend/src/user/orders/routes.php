<?php
declare(strict_types=1);

function customer_order_create(PDO $db, int $customerId, array $data): int
{
    $db->beginTransaction();
    try {
        $lines = [];
        $total = 0.0;
        foreach ($data['items'] as $productId => $quantity) {
            $product = customer_order_lock_product($db, (int) $productId);
            if (!$product || !$product['is_active']) {
                $db->rollBack();
                json_response(['message' => 'มีสินค้าในตะกร้าที่ไม่เปิดขายแล้ว กรุณาตรวจสอบรายการอีกครั้ง'], 409);
            }
            if ((int) $product['stock_quantity'] < $quantity) {
                $db->rollBack();
                json_response(['message' => sprintf('%s เหลือ %d %s ไม่พอกับที่สั่ง', $product['name'], (int) $product['stock_quantity'], $product['unit_name'])], 409);
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
            customer_order_change_stock($db, $product, $quantity, -1);
        }

        $orderId = customer_order_insert($db, $customerId, $data, $lines, $total);
        $db->commit();
        return $orderId;
    } catch (Throwable $exception) {
        if ($db->inTransaction()) $db->rollBack();
        throw $exception;
    }
}

function customer_order_route(string $method, string $path): bool
{
    if (!str_starts_with($path, '/user/orders')) return false;

    $db = app_db();
    $user = customer_auth_current($db);
    if (!$user) json_response(['message' => 'กรุณาเข้าสู่ระบบก่อนสั่งซื้อ'], 401);
    customer_order_expire_pending($db);
    $customerId = (int) $user['id'];

    if ($method === 'GET' && $path === '/user/orders') {
        json_response(['data' => customer_order_list($db, $customerId)]);
    }

    if ($method === 'POST' && $path === '/user/orders') {
        [$data, $errors] = customer_order_validate_input($_POST);
        if (!$errors && !customer_auth_active_location_exists($db, $data['location_id'])) $errors['location_id'] = 'ไม่พบสถานที่ส่งของที่เลือก';
        if ($errors) json_response(['message' => (string) reset($errors), 'errors' => $errors], 422);

        $cutoff = customer_order_period_cutoff(settings_find($db), $data['delivery_period']);
        if (date('H:i:s') > $cutoff) {
            json_response(['message' => sprintf('เลยเวลาสั่ง%sของวันนี้แล้ว (ปิดรับ %s น.)', customer_order_period_label($data['delivery_period']), substr($cutoff, 0, 5))], 422);
        }

        $orderId = customer_order_create($db, $customerId, $data);
        $order = customer_order_find($db, $orderId, $customerId);
        json_response(['data' => customer_order_to_api($order, customer_order_items($db, $orderId))], 201);
    }

    if ($method === 'POST' && preg_match('#^/user/orders/(\d+)/pay$#', $path, $matches)) {
        $orderId = (int) $matches[1];
        $order = customer_order_find($db, $orderId, $customerId);
        if (!$order) json_response(['message' => 'ไม่พบคำสั่งซื้อนี้'], 404);
        if ($order['order_status'] === 'cancelled') json_response(['message' => 'คำสั่งซื้อนี้ถูกยกเลิกแล้ว กรุณาสั่งซื้อใหม่'], 409);
        if ($order['payment_status'] === 'pending') customer_order_mark_paid($db, $orderId);

        $order = customer_order_find($db, $orderId, $customerId);
        json_response(['data' => customer_order_to_api($order, customer_order_items($db, $orderId))]);
    }

    return false;
}
