<?php
declare(strict_types=1);

/** สถานะรายการสั่งซื้อที่ยังอยู่ในรอบที่ปิดแล้ว ใช้แยกออกมาแสดงเป็นรอบจัดการสินค้า */
const PREPARATION_DELIVERY_STATUSES = ['ready_for_delivery', 'delivered'];

function preparation_order_select(): string
{
    return 'SELECT o.id, o.order_number, o.location_id, o.order_status, o.total_amount, o.preparation_group_id, l.name AS location_name, u.full_name
        FROM orders o
        INNER JOIN locations l ON l.id = o.location_id
        LEFT JOIN users u ON u.id = o.user_id';
}

/** สินค้าของทุกรายการสั่งซื้อที่ระบุในคำสั่งเดียว จัดกลุ่มตาม order_id เพื่อไม่ query ทีละรายการ */
function preparation_items_by_order(PDO $db, array $orderIds): array
{
    if (!$orderIds) return [];
    $placeholders = implode(',', array_fill(0, count($orderIds), '?'));
    $statement = $db->prepare("SELECT oi.order_id, oi.product_name, oi.unit_name, oi.quantity, COALESCE(p.pieces_per_sale, 0) AS pieces_per_sale
        FROM order_items oi
        LEFT JOIN products p ON p.id = oi.product_id
        WHERE oi.order_id IN ($placeholders)
        ORDER BY oi.id");
    $statement->execute($orderIds);

    $items = [];
    foreach ($statement->fetchAll() as $item) {
        // สินค้าในหมวดที่ไม่ระบุจำนวนชิ้นต่อ (1 สินค้า) จะได้ pieces เป็น 0 และฝั่ง UI จะไม่แสดงจำนวนชิ้น
        $items[(int) $item['order_id']][] = [
            'name' => $item['product_name'],
            'unitName' => $item['unit_name'],
            'quantity' => (int) $item['quantity'],
            'pieces' => (int) $item['quantity'] * (int) $item['pieces_per_sale'],
        ];
    }
    return $items;
}

function preparation_order_to_api(array $order, array $items): array
{
    return [
        'id' => (int) $order['id'],
        'orderNumber' => $order['order_number'],
        'userName' => $order['full_name'] ?? 'ลูกค้า',
        'locationId' => (int) $order['location_id'],
        'locationName' => $order['location_name'] ?? '',
        'orderStatus' => $order['order_status'],
        'totalAmount' => (float) $order['total_amount'],
        'items' => $items[(int) $order['id']] ?? [],
    ];
}

function preparation_rows_to_api(PDO $db, array $rows): array
{
    $items = preparation_items_by_order($db, array_map(static fn (array $order) => (int) $order['id'], $rows));
    return array_map(static fn (array $order) => preparation_order_to_api($order, $items), $rows);
}

/** คิวที่รอสร้างรอบ คือรายการที่ชำระเงินแล้ว ยังรอตรวจสอบ และยังไม่ถูกจัดเข้ารอบใด */
function preparation_queue(PDO $db, array $filters): array
{
    $sql = preparation_order_select() . " WHERE o.delivery_date = :delivery_date AND o.delivery_period = :delivery_period
        AND o.payment_status = 'paid' AND o.order_status = 'pending_review' AND o.preparation_group_id IS NULL";
    $params = ['delivery_date' => $filters['delivery_date'], 'delivery_period' => $filters['delivery_period']];

    if ($filters['location_id']) {
        $sql .= ' AND o.location_id = :location_id';
        $params['location_id'] = $filters['location_id'];
    }

    $statement = $db->prepare($sql . ' ORDER BY o.ordered_at, o.id');
    $statement->execute($params);
    return preparation_rows_to_api($db, $statement->fetchAll());
}

function preparation_group_list(PDO $db, string $deliveryDate, string $deliveryPeriod): array
{
    $statement = $db->prepare('SELECT * FROM preparation_groups WHERE delivery_date = :delivery_date AND delivery_period = :delivery_period ORDER BY created_at, id');
    $statement->execute(['delivery_date' => $deliveryDate, 'delivery_period' => $deliveryPeriod]);
    return $statement->fetchAll();
}

/** รายการสั่งซื้อของทุกรอบที่ระบุ จัดกลุ่มตาม preparation_group_id */
function preparation_orders_by_group(PDO $db, array $groupIds, int $locationId): array
{
    if (!$groupIds) return [];
    $placeholders = implode(',', array_fill(0, count($groupIds), '?'));
    $sql = preparation_order_select() . " WHERE o.preparation_group_id IN ($placeholders)";
    $params = $groupIds;

    if ($locationId) {
        $sql .= ' AND o.location_id = ?';
        $params[] = $locationId;
    }

    $statement = $db->prepare($sql . ' ORDER BY o.ordered_at, o.id');
    $statement->execute($params);

    $grouped = [];
    foreach ($statement->fetchAll() as $row) $grouped[(int) $row['preparation_group_id']][] = $row;
    return array_map(static fn (array $rows) => preparation_rows_to_api($db, $rows), $grouped);
}

/** จุดรับสินค้าที่มีรายการสั่งซื้อในวันและรอบที่เลือก ใช้เป็นตัวเลือกใน filter */
function preparation_locations(PDO $db, string $deliveryDate, string $deliveryPeriod): array
{
    $statement = $db->prepare('SELECT DISTINCT l.id, l.name FROM orders o INNER JOIN locations l ON l.id = o.location_id
        WHERE o.delivery_date = :delivery_date AND o.delivery_period = :delivery_period ORDER BY l.name');
    $statement->execute(['delivery_date' => $deliveryDate, 'delivery_period' => $deliveryPeriod]);
    return array_map(static fn (array $location) => ['id' => (int) $location['id'], 'name' => $location['name']], $statement->fetchAll());
}

function preparation_board(PDO $db, array $filters): array
{
    $groups = preparation_group_list($db, $filters['delivery_date'], $filters['delivery_period']);
    $ordersByGroup = preparation_orders_by_group($db, array_map(static fn (array $group) => (int) $group['id'], $groups), $filters['location_id']);

    $batches = [];
    $deliveryGroups = [];
    foreach ($groups as $group) {
        // รอบที่ไม่มีรายการสั่งซื้อเหลือในจุดรับที่กรองอยู่ ไม่ต้องแสดงเป็นการ์ดว่าง
        $groupOrders = $ordersByGroup[(int) $group['id']] ?? [];
        if (!$groupOrders) continue;

        if ($group['group_status'] === 'preparing') {
            $batches[] = [
                'id' => (int) $group['id'],
                'createdAt' => date(DATE_ATOM, strtotime($group['created_at'])),
                'orders' => $groupOrders,
            ];
            continue;
        }

        // รอบที่ปิดแล้วรวมเป็นกลุ่มตามจุดส่ง เพราะการส่งจริงทำทีละจุดรับไม่ใช่ทีละรอบ
        foreach ($groupOrders as $order) {
            if (!in_array($order['orderStatus'], PREPARATION_DELIVERY_STATUSES, true)) continue;
            $deliveryGroups[$order['locationId']] ??= ['locationId' => $order['locationId'], 'locationName' => $order['locationName'], 'orders' => []];
            $deliveryGroups[$order['locationId']]['orders'][] = $order;
        }
    }

    return [
        'queue' => preparation_queue($db, $filters),
        'batches' => $batches,
        'deliveryGroups' => array_values($deliveryGroups),
        'locations' => preparation_locations($db, $filters['delivery_date'], $filters['delivery_period']),
    ];
}

function preparation_group_find(PDO $db, int $groupId): ?array
{
    $statement = $db->prepare('SELECT * FROM preparation_groups WHERE id = :id');
    $statement->execute(['id' => $groupId]);
    return $statement->fetch() ?: null;
}

function preparation_orders_by_ids(PDO $db, array $orderIds): array
{
    if (!$orderIds) return [];
    $placeholders = implode(',', array_fill(0, count($orderIds), '?'));
    $statement = $db->prepare("SELECT id, delivery_date, delivery_period, order_status, payment_status, preparation_group_id FROM orders WHERE id IN ($placeholders)");
    $statement->execute($orderIds);
    return $statement->fetchAll();
}

/**
 * สร้างรอบเตรียมสินค้าและย้ายรายการสั่งซื้อที่เลือกเข้ารอบ
 * location_id ของรอบเว้นว่างไว้เพราะหนึ่งรอบเตรียมข้ามจุดรับได้ และ created_by เว้นว่างเพราะ FK ชี้ไปตาราง users ไม่ใช่ admin
 */
function preparation_group_create(PDO $db, string $deliveryDate, string $deliveryPeriod, array $orderIds): int
{
    $db->beginTransaction();
    try {
        $db->prepare("INSERT INTO preparation_groups (delivery_date, delivery_period, group_status) VALUES (:delivery_date, :delivery_period, 'preparing')")
            ->execute(['delivery_date' => $deliveryDate, 'delivery_period' => $deliveryPeriod]);
        $groupId = (int) $db->lastInsertId();

        $statement = $db->prepare("UPDATE orders SET preparation_group_id = :group_id, order_status = 'preparing', preparing_at = NOW()
            WHERE id = :id AND order_status = 'pending_review' AND preparation_group_id IS NULL");
        foreach ($orderIds as $orderId) $statement->execute(['group_id' => $groupId, 'id' => $orderId]);

        $db->commit();
        return $groupId;
    } catch (Throwable $exception) {
        if ($db->inTransaction()) $db->rollBack();
        throw $exception;
    }
}

/** ปิดรอบและเปลี่ยนรายการสั่งซื้อในรอบเป็นพร้อมส่ง คืนจำนวนรายการที่เปลี่ยนจริง */
function preparation_group_mark_ready(PDO $db, int $groupId): int
{
    $db->beginTransaction();
    try {
        $statement = $db->prepare("UPDATE orders SET order_status = 'ready_for_delivery', ready_at = NOW()
            WHERE preparation_group_id = :group_id AND order_status = 'preparing'");
        $statement->execute(['group_id' => $groupId]);
        $changed = $statement->rowCount();

        $db->prepare("UPDATE preparation_groups SET group_status = 'ready', ready_at = NOW() WHERE id = :id")->execute(['id' => $groupId]);
        $db->commit();
        return $changed;
    } catch (Throwable $exception) {
        if ($db->inTransaction()) $db->rollBack();
        throw $exception;
    }
}

function preparation_group_remove_order(PDO $db, int $groupId, int $orderId): void
{
    $db->beginTransaction();
    try {
        $db->prepare("UPDATE orders SET preparation_group_id = NULL, order_status = 'pending_review', preparing_at = NULL WHERE id = :id")
            ->execute(['id' => $orderId]);

        // รอบที่ไม่เหลือรายการสั่งซื้อแล้วไม่มีความหมาย ลบทิ้งไม่ให้ค้างเป็นรอบว่าง
        $remaining = $db->prepare('SELECT COUNT(*) FROM orders WHERE preparation_group_id = :group_id');
        $remaining->execute(['group_id' => $groupId]);
        if (!(int) $remaining->fetchColumn()) $db->prepare('DELETE FROM preparation_groups WHERE id = :id')->execute(['id' => $groupId]);

        $db->commit();
    } catch (Throwable $exception) {
        if ($db->inTransaction()) $db->rollBack();
        throw $exception;
    }
}

/** เปลี่ยนเป็นส่งแล้วเฉพาะรายการที่พร้อมส่งอยู่ คืนจำนวนรายการที่เปลี่ยนจริง */
function preparation_set_delivered(PDO $db, array $orderIds): int
{
    $placeholders = implode(',', array_fill(0, count($orderIds), '?'));
    $statement = $db->prepare("UPDATE orders SET order_status = 'delivered', delivered_at = NOW()
        WHERE id IN ($placeholders) AND order_status = 'ready_for_delivery'");
    $statement->execute($orderIds);
    return $statement->rowCount();
}
