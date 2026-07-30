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

/** รายการสั่งซื้อของวันนี้ที่โชว์หน้าแรก เห็นได้เฉพาะคนที่เข้าสู่ระบบ และเห็นเฉพาะสถานที่ส่งของเดียวกับตัวเอง */
function user_recent_order_route(string $method, string $path): bool
{
    if ($method !== 'GET' || $path !== '/user/recent-orders') return false;

    $db = app_db();
    $user = user_auth_current($db);
    if (!$user) json_response(['message' => 'กรุณาเข้าสู่ระบบเพื่อดูรายการสั่งซื้อ'], 401);
    if (!$user['default_location_id']) json_response(['data' => []]);

    $statement = $db->prepare("SELECT o.id, o.delivery_period, o.ordered_at, o.total_amount, o.payment_status, u.full_name
        FROM orders o
        LEFT JOIN users u ON u.id = o.user_id
        WHERE DATE(o.ordered_at) = CURDATE() AND o.order_status <> 'cancelled' AND o.location_id = :location_id
        ORDER BY o.ordered_at DESC, o.id DESC");
    $statement->execute(['location_id' => (int) $user['default_location_id']]);
    $orders = $statement->fetchAll();

    $itemStatement = $db->prepare('SELECT product_name, quantity, unit_name FROM order_items WHERE order_id = :order_id ORDER BY id');

    json_response(['data' => array_map(static function (array $order) use ($itemStatement) {
        $itemStatement->execute(['order_id' => $order['id']]);
        return [
            'id' => (int) $order['id'],
            'userName' => $order['full_name'] ?? 'ลูกค้า',
            'items' => array_map(
                static fn (array $item) => sprintf('%s %d %s', $item['product_name'], (int) $item['quantity'], $item['unit_name']),
                $itemStatement->fetchAll(),
            ),
            'deliveryPeriod' => $order['delivery_period'],
            'orderedAt' => date(DATE_ATOM, strtotime($order['ordered_at'])),
            'totalAmount' => (float) $order['total_amount'],
            'paymentStatus' => $order['payment_status'],
        ];
    }, $orders)]);
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
        json_response(['data' => user_order_to_api($order, user_order_items($db, $orderId), user_order_payment_qr(settings_find($db), $order))], 201);
    }

    // ยืนยันการชำระเงินด้วยการแนบสลิปแล้วให้ Slip2Go ตรวจ ไม่ใช่ให้ผู้ใช้กดยืนยันเอง
    if ($method === 'POST' && preg_match('#^/user/orders/(\d+)/pay$#', $path, $matches)) {
        $orderId = (int) $matches[1];
        $order = user_order_find($db, $orderId, $userId);
        if (!$order) json_response(['message' => 'ไม่พบคำสั่งซื้อนี้'], 404);
        if ($order['order_status'] === 'cancelled') json_response(['message' => 'คำสั่งซื้อนี้ถูกยกเลิกแล้ว กรุณาสั่งซื้อใหม่'], 409);

        $settings = settings_find($db);
        if ($order['payment_status'] === 'paid') {
            json_response(['data' => user_order_to_api($order, user_order_items($db, $orderId), user_order_payment_qr($settings, $order))]);
        }
        if (!$settings['payment_account_number'] || !$settings['payment_slip_account_type']) {
            json_response(['message' => 'ร้านยังไม่ได้ตั้งค่าบัญชีรับเงิน กรุณาติดต่อแอดมิน'], 503);
        }

        // การนับครั้งและการบันทึกผลตรวจเป็น UPDATE ทั้งหมด ถ้าแถวการชำระเงินหายไปจะไม่มีอะไรถูกเขียนและไม่มี error
        user_order_payment_ensure_row($db, $orderId, (float) $order['total_amount']);

        // เก็บไฟล์ให้ผ่านการตรวจชนิดและขนาดก่อน แล้วจึงตัดโควตา เพราะไฟล์ที่ไม่ผ่านยังไม่ได้ยิงออกไปและไม่ควรเสียสิทธิ์
        $previousSlipPath = user_order_slip_image_path($db, $orderId);
        $slip = user_order_slip_store($_FILES['slip'] ?? null);
        if (!user_order_claim_verify_attempt($db, $orderId)) {
            user_order_slip_delete($slip['path']);
            json_response(['message' => 'ตรวจสอบสลิปไม่สำเร็จหลายครั้งแล้ว กรุณาติดต่อแอดมินเพื่อตรวจสอบให้ครับ'], 429);
        }

        $result = slip2go_verify_image($slip['fullPath'], $slip['mimeType'], user_order_slip_conditions($settings, (float) $order['total_amount']));
        $outcome = user_order_slip_outcome($result['code']);

        try {
            user_order_apply_slip($db, $orderId, user_order_slip_columns($result, $slip['path'], $outcome['isPaid']), $outcome['isPaid']);
            if ($previousSlipPath !== $slip['path']) user_order_slip_delete($previousSlipPath);
        } catch (PDOException $exception) {
            // ชน unique key ของ slip_trans_ref คือสลิปใบนี้เคยใช้ยืนยันคำสั่งซื้ออื่นไปแล้ว
            if ($exception->getCode() !== '23000') throw $exception;
            json_response(['message' => 'สลิปนี้ถูกใช้ยืนยันการชำระเงินของคำสั่งซื้ออื่นแล้ว'], 409);
        }

        if (!$outcome['isPaid']) json_response(['message' => $outcome['message']], 422);

        $order = user_order_find($db, $orderId, $userId);
        json_response(['data' => user_order_to_api($order, user_order_items($db, $orderId), user_order_payment_qr($settings, $order)), 'message' => $outcome['message']]);
    }

    return false;
}
