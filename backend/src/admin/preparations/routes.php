<?php
declare(strict_types=1);

function preparation_route(string $method, string $path): bool
{
    if (!str_starts_with($path, '/admin/preparations')) return false;

    $db = app_db();

    if ($method === 'GET' && $path === '/admin/preparations') {
        json_response(preparation_board($db, preparation_validate_filters($_GET)));
    }

    if ($method === 'POST' && $path === '/admin/preparations') {
        $filters = preparation_validate_filters($_POST);
        [$orderIds, $errors] = preparation_validate_order_ids($_POST);
        if ($errors) json_response(['message' => (string) reset($errors), 'errors' => $errors], 422);

        $orders = preparation_orders_by_ids($db, $orderIds);
        if (count($orders) !== count($orderIds)) json_response(['message' => 'ไม่พบรายการสั่งซื้อที่เลือกบางรายการ'], 404);
        foreach ($orders as $order) {
            if ($order['delivery_date'] !== $filters['delivery_date'] || $order['delivery_period'] !== $filters['delivery_period']) {
                json_response(['message' => 'รายการสั่งซื้อที่เลือกไม่ตรงกับวันจัดส่งหรือรอบส่งที่เลือก'], 409);
            }
            // ตรวจซ้ำฝั่ง backend เผื่อสถานะเปลี่ยนไปแล้วระหว่างที่หน้าเตรียมสินค้าเปิดค้างไว้
            if ($order['payment_status'] !== 'paid' || $order['order_status'] !== 'pending_review' || $order['preparation_group_id'] !== null) {
                json_response(['message' => 'รายการสั่งซื้อที่เลือกบางรายการไม่พร้อมจัดเตรียมแล้ว กรุณาโหลดหน้านี้ใหม่'], 409);
            }
        }

        preparation_group_create($db, $filters['delivery_date'], $filters['delivery_period'], $orderIds);
        json_response(['message' => sprintf('สร้างรอบเตรียมสินค้าสำหรับ %d รายการสั่งซื้อแล้ว', count($orderIds))], 201);
    }

    if ($method === 'POST' && $path === '/admin/preparations/delivered') {
        [$orderIds, $errors] = preparation_validate_order_ids($_POST);
        if ($errors) json_response(['message' => (string) reset($errors), 'errors' => $errors], 422);

        json_response(['message' => sprintf('เปลี่ยนสถานะเป็นส่งแล้ว %d รายการสั่งซื้อ', preparation_set_delivered($db, $orderIds))]);
    }

    if (!preg_match('#^/admin/preparations/(\d+)/(?:ready|orders/(\d+))$#', $path, $matches)) return false;
    $group = preparation_group_find($db, (int) $matches[1]);
    if (!$group) json_response(['message' => 'ไม่พบรอบเตรียมสินค้า'], 404);
    $groupId = (int) $group['id'];

    if ($method === 'DELETE' && isset($matches[2])) {
        if ($group['group_status'] !== 'preparing') json_response(['message' => 'รอบที่พร้อมส่งแล้วไม่สามารถนำรายการสั่งซื้อออกได้'], 409);

        $orderId = (int) $matches[2];
        $order = preparation_orders_by_ids($db, [$orderId])[0] ?? null;
        if (!$order || (int) $order['preparation_group_id'] !== $groupId) json_response(['message' => 'ไม่พบรายการสั่งซื้อในรอบเตรียมสินค้านี้'], 404);

        preparation_group_remove_order($db, $groupId, $orderId);
        json_response(['message' => 'นำรายการสั่งซื้อออกจากรอบเตรียมสินค้าแล้ว']);
    }

    if ($method === 'POST' && !isset($matches[2])) {
        if ($group['group_status'] !== 'preparing') json_response(['message' => 'รอบเตรียมสินค้านี้เปลี่ยนเป็นพร้อมส่งแล้ว'], 409);

        json_response(['message' => sprintf('เปลี่ยนสถานะเป็นพร้อมส่ง %d รายการสั่งซื้อแล้ว', preparation_group_mark_ready($db, $groupId))]);
    }

    return false;
}
