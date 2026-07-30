<?php
declare(strict_types=1);

function admin_order_route(string $method, string $path): bool
{
    if (!str_starts_with($path, '/admin/orders')) return false;

    $db = app_db();

    if ($method === 'GET' && $path === '/admin/orders') {
        $filters = admin_order_validate_filters($_GET);
        json_response([
            'data' => admin_order_list($db, $filters),
            'locations' => admin_order_locations($db, $filters['delivery_date']),
        ]);
    }

    // เปลี่ยนสถานะแบบกลุ่มจากหน้ารายการ รายการที่ยังรอชำระเงินจะถูกกันไว้ทั้งฝั่ง UI และที่นี่
    if ($method === 'POST' && $path === '/admin/orders/status') {
        [$data, $errors] = admin_order_validate_bulk_input($_POST);
        if ($errors) json_response(['message' => (string) reset($errors), 'errors' => $errors], 422);

        $orders = admin_orders_by_ids($db, $data['order_ids']);
        if (count($orders) !== count($data['order_ids'])) json_response(['message' => 'ไม่พบรายการสั่งซื้อที่เลือกบางรายการ'], 404);
        foreach ($orders as $order) {
            if ($order['payment_status'] !== 'paid') json_response(['message' => 'รายการสั่งซื้อที่รอชำระเงินไม่สามารถเปลี่ยนสถานะได้'], 409);
        }

        json_response(['message' => sprintf('เปลี่ยนสถานะแล้ว %d รายการสั่งซื้อ', admin_order_set_status($db, $orders, $data['order_status']))]);
    }

    // ส่งไฟล์สลิปผ่าน API เพราะเก็บไว้ใน storage ไม่ใช่ public จึงเปิดจาก URL ตรง ๆ ไม่ได้ และต้องผ่านการตรวจสิทธิ์แอดมินก่อน
    if ($method === 'GET' && preg_match('#^/admin/orders/(\d+)/slip$#', $path, $matches)) {
        $file = admin_order_slip_file($db, (int) $matches[1]);
        if (!$file) json_response(['message' => 'ไม่พบรูปสลิปของรายการสั่งซื้อนี้'], 404);

        header('Content-Type: ' . ((new finfo(FILEINFO_MIME_TYPE))->file($file) ?: 'application/octet-stream'));
        header('Content-Length: ' . filesize($file));
        header('Cache-Control: private, no-store');
        readfile($file);
        exit;
    }

    if (!preg_match('#^/admin/orders/(\d+)$#', $path, $matches)) return false;
    $orderId = (int) $matches[1];
    $order = admin_order_find($db, $orderId);
    if (!$order) json_response(['message' => 'ไม่พบรายการสั่งซื้อ'], 404);

    if ($method === 'GET') json_response(['data' => admin_order_to_api($order, admin_order_items($db, $orderId))]);
    if ($method !== 'POST') return false;

    [$data, $errors] = admin_order_validate_status_input($_POST);
    if ($errors) json_response(['message' => (string) reset($errors), 'errors' => $errors], 422);

    if ($data['payment_status'] !== $order['payment_status']) admin_order_set_payment_status($db, $orderId, $data['payment_status']);
    admin_order_set_status($db, [['id' => $orderId, 'order_status' => $order['order_status'], 'payment_status' => $data['payment_status']]], $data['order_status']);

    json_response(['data' => admin_order_to_api(admin_order_find($db, $orderId), admin_order_items($db, $orderId))]);
}
