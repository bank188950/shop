<?php
declare(strict_types=1);

const ADMIN_ORDER_STATUSES = ['pending_payment', 'pending_review', 'preparing', 'ready_for_delivery', 'delivered', 'cancelled'];
const ADMIN_ORDER_PAYMENT_STATUSES = ['pending', 'paid'];

/** คอลัมน์เวลาที่ต้องประทับเมื่อรายการสั่งซื้อเข้าสถานะนั้น */
const ADMIN_ORDER_STATUS_TIMESTAMPS = [
    'preparing' => 'preparing_at',
    'ready_for_delivery' => 'ready_at',
    'delivered' => 'delivered_at',
    'cancelled' => 'cancelled_at',
];

function admin_order_to_api(array $order, array $items): array
{
    return [
        'id' => (int) $order['id'],
        'orderNumber' => $order['order_number'],
        'orderedAt' => date(DATE_ATOM, strtotime($order['ordered_at'])),
        'deliveryDate' => $order['delivery_date'],
        'deliveryPeriod' => $order['delivery_period'],
        'locationId' => (int) $order['location_id'],
        'locationName' => $order['location_name'] ?? '',
        'userName' => $order['full_name'] ?? 'ลูกค้า',
        'phone' => $order['phone'] ?? '',
        'lineId' => $order['line_account'] ?? '',
        'orderStatus' => $order['order_status'],
        'paymentStatus' => $order['payment_status'],
        'totalAmount' => (float) $order['total_amount'],
        'userNote' => $order['user_note'] ?? '',
        // ไฟล์สลิปอยู่นอก public จึงส่งได้แค่ว่ามีหรือไม่ ตัวรูปต้องเรียกผ่าน /admin/orders/{id}/slip ที่ตรวจสิทธิ์แล้ว
        'hasSlip' => !empty($order['slip_image_path']),
        'items' => array_map(static fn (array $item) => [
            'name' => $item['product_name'],
            'unitName' => $item['unit_name'],
            'quantity' => (int) $item['quantity'],
            'unitPrice' => (float) $item['unit_price'],
            'lineTotal' => (float) $item['line_total'],
        ], $items),
    ];
}

function admin_order_items(PDO $db, int $orderId): array
{
    $statement = $db->prepare('SELECT product_id, product_name, unit_name, quantity, unit_price, line_total FROM order_items WHERE order_id = :order_id ORDER BY id');
    $statement->execute(['order_id' => $orderId]);
    return $statement->fetchAll();
}

function admin_order_select(): string
{
    return 'SELECT o.*, l.name AS location_name, u.full_name, u.phone, u.line_account, p.slip_image_path
        FROM orders o
        INNER JOIN locations l ON l.id = o.location_id
        LEFT JOIN users u ON u.id = o.user_id
        LEFT JOIN order_payments p ON p.order_id = o.id';
}

/** พาธเต็มของไฟล์สลิปที่มีอยู่จริง คืน null เมื่อยังไม่แนบสลิป หรือไฟล์ถูกล้างไปแล้วจากหน้าจัดการพื้นที่ */
function admin_order_slip_file(PDO $db, int $orderId): ?string
{
    $statement = $db->prepare('SELECT slip_image_path FROM order_payments WHERE order_id = :order_id');
    $statement->execute(['order_id' => $orderId]);
    $path = (string) ($statement->fetchColumn() ?: '');
    if (!str_starts_with($path, 'storage/slips/')) return null;

    $file = dirname(__DIR__, 3) . '/storage/slips/' . basename($path);
    return is_file($file) ? $file : null;
}

/** $filters: delivery_date (บังคับ), delivery_period, location_id, order_status, q */
function admin_order_list(PDO $db, array $filters): array
{
    $sql = admin_order_select() . ' WHERE o.delivery_date = :delivery_date';
    $params = ['delivery_date' => $filters['delivery_date']];

    if ($filters['delivery_period']) {
        $sql .= ' AND o.delivery_period = :delivery_period';
        $params['delivery_period'] = $filters['delivery_period'];
    }
    if ($filters['location_id']) {
        $sql .= ' AND o.location_id = :location_id';
        $params['location_id'] = $filters['location_id'];
    }
    if ($filters['order_status']) {
        $sql .= ' AND o.order_status = :order_status';
        $params['order_status'] = $filters['order_status'];
    }
    if ($filters['q'] !== '') {
        // แยก placeholder สองตัวเพราะ prepared statement จริงของ MySQL ใช้ชื่อเดียวซ้ำสองที่ไม่ได้
        $sql .= ' AND (o.order_number LIKE :order_keyword OR u.full_name LIKE :name_keyword)';
        $params['order_keyword'] = '%' . $filters['q'] . '%';
        $params['name_keyword'] = '%' . $filters['q'] . '%';
    }

    $statement = $db->prepare($sql . ' ORDER BY o.ordered_at DESC, o.id DESC');
    $statement->execute($params);
    return array_map(static fn (array $order) => admin_order_to_api($order, admin_order_items($db, (int) $order['id'])), $statement->fetchAll());
}

function admin_order_find(PDO $db, int $orderId): ?array
{
    $statement = $db->prepare(admin_order_select() . ' WHERE o.id = :id');
    $statement->execute(['id' => $orderId]);
    return $statement->fetch() ?: null;
}

/** จุดรับสินค้าที่มีรายการสั่งซื้อของวันนั้น ใช้เป็นตัวเลือกใน filter */
function admin_order_locations(PDO $db, string $deliveryDate): array
{
    $statement = $db->prepare('SELECT DISTINCT l.id, l.name FROM orders o INNER JOIN locations l ON l.id = o.location_id WHERE o.delivery_date = :delivery_date ORDER BY l.name');
    $statement->execute(['delivery_date' => $deliveryDate]);
    return array_map(static fn (array $location) => ['id' => (int) $location['id'], 'name' => $location['name']], $statement->fetchAll());
}

function admin_orders_by_ids(PDO $db, array $orderIds): array
{
    if (!$orderIds) return [];
    $placeholders = implode(',', array_fill(0, count($orderIds), '?'));
    $statement = $db->prepare("SELECT id, order_status, payment_status FROM orders WHERE id IN ($placeholders)");
    $statement->execute($orderIds);
    return $statement->fetchAll();
}

/** คืนสต็อกที่ถูกตัดตอนสร้างรายการสั่งซื้อ เรียกเฉพาะตอนเปลี่ยนจากสถานะอื่นมาเป็นยกเลิกเท่านั้น กันคืนซ้ำ */
function admin_order_restore_stock(PDO $db, int $orderId): void
{
    foreach (admin_order_items($db, $orderId) as $item) {
        if (!$item['product_id']) continue;
        $product = user_order_lock_product($db, (int) $item['product_id']);
        if (!$product) continue;
        user_order_change_stock($db, $product, (int) $item['quantity'], 1);
    }
}

function admin_order_update_status(PDO $db, int $orderId, string $status): void
{
    $sql = 'UPDATE orders SET order_status = :order_status';
    if (isset(ADMIN_ORDER_STATUS_TIMESTAMPS[$status])) $sql .= ', ' . ADMIN_ORDER_STATUS_TIMESTAMPS[$status] . ' = NOW()';
    if ($status !== 'cancelled') $sql .= ', cancelled_at = NULL, cancellation_reason = NULL';
    $db->prepare($sql . ' WHERE id = :id')->execute(['order_status' => $status, 'id' => $orderId]);
}

/** เปลี่ยนสถานะหลายรายการในทีเดียว คืนจำนวนรายการที่เปลี่ยนจริง */
function admin_order_set_status(PDO $db, array $orders, string $status): int
{
    $db->beginTransaction();
    try {
        $changed = 0;
        foreach ($orders as $order) {
            if ($order['order_status'] === $status) continue;
            if ($status === 'cancelled' && $order['order_status'] !== 'cancelled') admin_order_restore_stock($db, (int) $order['id']);
            admin_order_update_status($db, (int) $order['id'], $status);
            $changed++;
        }
        $db->commit();
        return $changed;
    } catch (Throwable $exception) {
        if ($db->inTransaction()) $db->rollBack();
        throw $exception;
    }
}

function admin_order_set_payment_status(PDO $db, int $orderId, string $paymentStatus): void
{
    $db->prepare('UPDATE orders SET payment_status = :payment_status WHERE id = :id')->execute(['payment_status' => $paymentStatus, 'id' => $orderId]);
    if ($paymentStatus === 'paid') {
        $db->prepare("UPDATE order_payments SET payment_status = 'paid', paid_at = COALESCE(paid_at, NOW()) WHERE order_id = :order_id")->execute(['order_id' => $orderId]);
        return;
    }
    $db->prepare("UPDATE order_payments SET payment_status = 'pending', paid_at = NULL WHERE order_id = :order_id")->execute(['order_id' => $orderId]);
}
