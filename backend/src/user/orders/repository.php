<?php
declare(strict_types=1);

function user_order_to_api(array $order, array $items): array
{
    return [
        'id' => (int) $order['id'],
        'orderNumber' => $order['order_number'],
        'orderedAt' => $order['ordered_at'],
        'deliveryDate' => $order['delivery_date'],
        'deliveryPeriod' => $order['delivery_period'],
        'locationName' => $order['location_name'] ?? '',
        'orderStatus' => $order['order_status'],
        'paymentStatus' => $order['payment_status'],
        'totalAmount' => (float) $order['total_amount'],
        'userNote' => $order['user_note'] ?? '',
        'items' => array_map(static fn (array $item) => [
            'name' => $item['product_name'],
            'unitName' => $item['unit_name'],
            'quantity' => (int) $item['quantity'],
            'unitPrice' => (float) $item['unit_price'],
            'lineTotal' => (float) $item['line_total'],
        ], $items),
    ];
}

function user_order_lock_product(PDO $db, int $productId): ?array
{
    $statement = $db->prepare('SELECT id, name, sale_price, stock_quantity, stock_piece_count, pieces_per_sale, category_id, unit_id, is_active FROM products WHERE id = :id FOR UPDATE');
    $statement->execute(['id' => $productId]);
    $product = $statement->fetch();
    if (!$product) return null;

    $details = $db->prepare('SELECT c.tracks_piece_quantity, u.name AS unit_name FROM product_categories c, product_units u WHERE c.id = :category_id AND u.id = :unit_id');
    $details->execute(['category_id' => $product['category_id'], 'unit_id' => $product['unit_id']]);
    return array_merge($product, $details->fetch() ?: ['tracks_piece_quantity' => 0, 'unit_name' => '']);
}

/** $sign = -1 คือตัดสต็อกตอนสร้างออเดอร์, +1 คือคืนสต็อกตอนยกเลิก */
function user_order_change_stock(PDO $db, array $product, int $quantity, int $sign): void
{
    $piecesPerSale = (int) $product['pieces_per_sale'];
    if ((bool) $product['tracks_piece_quantity'] && $piecesPerSale > 0) {
        $pieceCount = max(0, (int) $product['stock_piece_count'] + $sign * $quantity * $piecesPerSale);
        $statement = $db->prepare('UPDATE products SET stock_piece_count = :piece_count, stock_quantity = :stock_quantity WHERE id = :id');
        $statement->execute(['piece_count' => $pieceCount, 'stock_quantity' => intdiv($pieceCount, $piecesPerSale), 'id' => $product['id']]);
        return;
    }
    $statement = $db->prepare('UPDATE products SET stock_quantity = :stock_quantity WHERE id = :id');
    $statement->execute(['stock_quantity' => max(0, (int) $product['stock_quantity'] + $sign * $quantity), 'id' => $product['id']]);
}

function user_order_insert(PDO $db, int $userId, array $data, array $lines, float $total): int
{
    $statement = $db->prepare('INSERT INTO orders (order_number, user_id, location_id, delivery_date, delivery_period, subtotal_amount, total_amount, user_note)
        VALUES (:order_number, :user_id, :location_id, :delivery_date, :delivery_period, :subtotal, :total, :user_note)');
    $statement->execute([
        'order_number' => 'TMP-' . uniqid(),
        'user_id' => $userId,
        'location_id' => $data['location_id'],
        'delivery_date' => date('Y-m-d'),
        'delivery_period' => $data['delivery_period'],
        'subtotal' => $total,
        'total' => $total,
        'user_note' => $data['user_note'],
    ]);
    $orderId = (int) $db->lastInsertId();

    $number = $db->prepare('UPDATE orders SET order_number = :order_number WHERE id = :id');
    $number->execute(['order_number' => sprintf('PO-%s-%04d', date('ymd'), $orderId), 'id' => $orderId]);

    $itemStatement = $db->prepare('INSERT INTO order_items (order_id, product_id, product_name, unit_name, quantity, unit_price, line_total) VALUES (:order_id, :product_id, :product_name, :unit_name, :quantity, :unit_price, :line_total)');
    foreach ($lines as $line) {
        $itemStatement->execute([
            'order_id' => $orderId,
            'product_id' => $line['product_id'],
            'product_name' => $line['product_name'],
            'unit_name' => $line['unit_name'],
            'quantity' => $line['quantity'],
            'unit_price' => $line['unit_price'],
            'line_total' => $line['line_total'],
        ]);
    }

    $payment = $db->prepare("INSERT INTO order_payments (order_id, payment_method, payment_status, amount) VALUES (:order_id, 'online', 'pending', :amount)");
    $payment->execute(['order_id' => $orderId, 'amount' => $total]);

    return $orderId;
}

function user_order_find(PDO $db, int $orderId, ?int $userId = null): ?array
{
    $sql = 'SELECT o.*, l.name AS location_name FROM orders o INNER JOIN locations l ON l.id = o.location_id WHERE o.id = :id';
    $params = ['id' => $orderId];
    if ($userId) { $sql .= ' AND o.user_id = :user_id'; $params['user_id'] = $userId; }
    $statement = $db->prepare($sql);
    $statement->execute($params);
    return $statement->fetch() ?: null;
}

function user_order_items(PDO $db, int $orderId): array
{
    $statement = $db->prepare('SELECT product_id, product_name, unit_name, quantity, unit_price, line_total FROM order_items WHERE order_id = :order_id ORDER BY id');
    $statement->execute(['order_id' => $orderId]);
    return $statement->fetchAll();
}

function user_order_list(PDO $db, int $userId): array
{
    $statement = $db->prepare('SELECT o.*, l.name AS location_name FROM orders o INNER JOIN locations l ON l.id = o.location_id WHERE o.user_id = :user_id ORDER BY o.ordered_at DESC, o.id DESC');
    $statement->execute(['user_id' => $userId]);
    return array_map(static fn (array $order) => user_order_to_api($order, user_order_items($db, (int) $order['id'])), $statement->fetchAll());
}

function user_order_mark_paid(PDO $db, int $orderId): void
{
    $db->prepare("UPDATE orders SET payment_status = 'paid', order_status = 'pending_review' WHERE id = :id")->execute(['id' => $orderId]);
    $db->prepare("UPDATE order_payments SET payment_status = 'paid', paid_at = NOW() WHERE order_id = :order_id")->execute(['order_id' => $orderId]);
}

function user_order_cancel(PDO $db, int $orderId, string $reason): void
{
    $db->beginTransaction();
    try {
        foreach (user_order_items($db, $orderId) as $item) {
            if (!$item['product_id']) continue;
            $product = user_order_lock_product($db, (int) $item['product_id']);
            if ($product) user_order_change_stock($db, $product, (int) $item['quantity'], 1);
        }
        $db->prepare("UPDATE orders SET order_status = 'cancelled', cancelled_at = NOW(), cancellation_reason = :reason WHERE id = :id")->execute(['reason' => $reason, 'id' => $orderId]);
        $db->prepare("UPDATE order_payments SET payment_status = 'rejected' WHERE order_id = :order_id AND payment_status = 'pending'")->execute(['order_id' => $orderId]);
        $db->commit();
    } catch (Throwable $exception) {
        $db->rollBack();
        throw $exception;
    }
}

/** ยกเลิกออเดอร์ที่ยังไม่จ่ายเมื่อครบ 30 นาที หรือเลยเวลาปิดรับของรอบนั้น แล้วคืนสต็อกอัตโนมัติ */
function user_order_expire_pending(PDO $db): void
{
    $orders = $db->query("SELECT id, delivery_date, delivery_period, ordered_at FROM orders WHERE order_status = 'pending_payment'")->fetchAll();
    if (!$orders) return;

    $settings = settings_find($db);
    $today = date('Y-m-d');
    $now = date('H:i:s');

    foreach ($orders as $order) {
        $expiresAt = strtotime($order['ordered_at']) + USER_ORDER_PAYMENT_MINUTES * 60;
        $pastCutoff = $order['delivery_date'] < $today
            || ($order['delivery_date'] === $today && $now > user_order_period_cutoff($settings, $order['delivery_period']));
        if (time() < $expiresAt && !$pastCutoff) continue;
        user_order_cancel($db, (int) $order['id'], 'ไม่ได้ชำระเงินภายในเวลาที่กำหนด');
    }
}
