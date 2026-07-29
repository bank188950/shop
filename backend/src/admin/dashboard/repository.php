<?php
declare(strict_types=1);

/** สถานะที่ถือว่ายังมีงานค้างต้องทำต่อ ใช้ทั้งการ์ดสรุปและตารางแยกจุดรับสินค้า */
const ADMIN_DASHBOARD_ACTIVE_STATUSES = "o.order_status IN ('pending_review', 'preparing', 'ready_for_delivery')";
const ADMIN_DASHBOARD_PAID_TOTAL = "COALESCE(SUM(CASE WHEN o.payment_status = 'paid' THEN o.total_amount ELSE 0 END), 0)";
const ADMIN_DASHBOARD_THAI_MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const ADMIN_DASHBOARD_THAI_WEEKDAYS = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์'];

/** เงื่อนไขร่วมของการ์ดสรุปและตาราง ยึด delivery_date เพราะทั้งหน้าอ่านตามรอบส่ง ไม่ใช่เวลาที่ลูกค้ากดสั่ง */
function admin_dashboard_where(array $filters, array &$params): string
{
    $sql = ' WHERE o.delivery_date = :delivery_date';
    $params['delivery_date'] = $filters['delivery_date'];

    if ($filters['delivery_period']) {
        $sql .= ' AND o.delivery_period = :delivery_period';
        $params['delivery_period'] = $filters['delivery_period'];
    }
    if ($filters['location_id']) {
        $sql .= ' AND o.location_id = :location_id';
        $params['location_id'] = $filters['location_id'];
    }

    return $sql;
}

function admin_dashboard_totals(PDO $db, array $filters): array
{
    $params = [];
    $sql = 'SELECT COUNT(*) AS order_count,
            COALESCE(SUM(o.payment_status = \'paid\'), 0) AS paid_order_count,
            ' . ADMIN_DASHBOARD_PAID_TOTAL . ' AS paid_sales_total,
            COALESCE(SUM(' . ADMIN_DASHBOARD_ACTIVE_STATUSES . '), 0) AS active_order_count,
            COALESCE(SUM(o.payment_status = \'pending\' OR o.order_status = \'cancelled\'), 0) AS pending_order_count
        FROM orders o' . admin_dashboard_where($filters, $params);

    $statement = $db->prepare($sql);
    $statement->execute($params);
    $row = $statement->fetch() ?: [];

    return [
        'orderCount' => (int) ($row['order_count'] ?? 0),
        'paidOrderCount' => (int) ($row['paid_order_count'] ?? 0),
        'paidSalesTotal' => (float) ($row['paid_sales_total'] ?? 0),
        'activeOrderCount' => (int) ($row['active_order_count'] ?? 0),
        'pendingOrderCount' => (int) ($row['pending_order_count'] ?? 0),
    ];
}

/** รายการที่ต้องติดตาม คือยังไม่ชำระเงินหรือถูกยกเลิก แสดงล่าสุด 5 รายการเท่าที่ตารางบนหน้ารองรับ */
function admin_dashboard_pending_orders(PDO $db, array $filters): array
{
    $params = [];
    $sql = 'SELECT o.id, o.order_number, o.delivery_period, o.total_amount, o.order_status, o.payment_status, l.name AS location_name, u.full_name
        FROM orders o
        INNER JOIN locations l ON l.id = o.location_id
        LEFT JOIN users u ON u.id = o.user_id'
        . admin_dashboard_where($filters, $params)
        . " AND (o.payment_status = 'pending' OR o.order_status = 'cancelled')
        ORDER BY o.ordered_at DESC, o.id DESC
        LIMIT 5";

    $statement = $db->prepare($sql);
    $statement->execute($params);

    return array_map(static fn (array $order) => [
        'id' => (int) $order['id'],
        'orderNumber' => $order['order_number'],
        'userName' => $order['full_name'] ?? 'ลูกค้า',
        'locationName' => $order['location_name'],
        'deliveryPeriod' => $order['delivery_period'],
        'totalAmount' => (float) $order['total_amount'],
        'orderStatus' => $order['order_status'],
        'paymentStatus' => $order['payment_status'],
    ], $statement->fetchAll());
}

function admin_dashboard_location_summary(PDO $db, array $filters): array
{
    $params = [];
    $sql = 'SELECT l.id, l.name,
            COALESCE(SUM(o.delivery_period = \'morning\'), 0) AS morning,
            COALESCE(SUM(o.delivery_period = \'afternoon\'), 0) AS afternoon,
            COALESCE(SUM(o.payment_status = \'paid\'), 0) AS paid,
            COALESCE(SUM(' . ADMIN_DASHBOARD_ACTIVE_STATUSES . '), 0) AS active,
            ' . ADMIN_DASHBOARD_PAID_TOTAL . ' AS sales_total
        FROM orders o
        INNER JOIN locations l ON l.id = o.location_id'
        . admin_dashboard_where($filters, $params)
        . ' GROUP BY l.id, l.name ORDER BY l.name';

    $statement = $db->prepare($sql);
    $statement->execute($params);

    return array_map(static fn (array $row) => [
        'locationId' => (int) $row['id'],
        'locationName' => $row['name'],
        'morning' => (int) $row['morning'],
        'afternoon' => (int) $row['afternoon'],
        'paid' => (int) $row['paid'],
        'active' => (int) $row['active'],
        'salesTotal' => (float) $row['sales_total'],
    ], $statement->fetchAll());
}

/** ตัวเลือกจุดรับสินค้าของตัวกรอง ใช้ทุกจุดที่มีอยู่ ไม่ผูกกับวันที่เลือก ตัวกรองจะได้ไม่หายไปตอนเปลี่ยนวัน */
function admin_dashboard_locations(PDO $db): array
{
    return array_map(
        static fn (array $location) => ['id' => (int) $location['id'], 'name' => $location['name']],
        $db->query('SELECT id, name FROM locations ORDER BY name')->fetchAll(),
    );
}

/** ช่วงเวลาของกราฟยึด ordered_at คือเวลาที่ลูกค้ากดสั่ง เพราะรอบวันนี้ต้องแบ่งเป็นช่วงชั่วโมงได้ */
function admin_dashboard_chart(PDO $db, array $filters): array
{
    $params = [];
    $where = " WHERE o.order_status <> 'cancelled'";
    if ($filters['location_id']) {
        $where .= ' AND o.location_id = :location_id';
        $params['location_id'] = $filters['location_id'];
    }

    $value = $filters['metric'] === 'sales' ? ADMIN_DASHBOARD_PAID_TOTAL : 'COUNT(*)';

    if ($filters['range'] === 'today') {
        // จับกลุ่มรายชั่วโมงครบทั้งวัน 24 ช่วง จะได้ไม่ตัดรายการที่สั่งนอกเวลาทำการทิ้ง
        $where .= ' AND DATE(o.ordered_at) = CURDATE()';
        $bucket = 'HOUR(o.ordered_at)';
        $labels = array_map(static fn (int $hour) => sprintf('%02d:00', $hour), range(0, 23));
        $offset = 0;
    } elseif ($filters['range'] === 'week') {
        $monday = date('Y-m-d', strtotime('monday this week'));
        $where .= ' AND DATE(o.ordered_at) BETWEEN :start_date AND :end_date';
        $params['start_date'] = $monday;
        $params['end_date'] = date('Y-m-d', strtotime($monday . ' +6 days'));
        $bucket = 'WEEKDAY(o.ordered_at)';
        $labels = ADMIN_DASHBOARD_THAI_WEEKDAYS;
        $offset = 0;
    } else {
        $where .= ' AND YEAR(o.ordered_at) = :year AND MONTH(o.ordered_at) = :month';
        $params['year'] = $filters['year'];
        $params['month'] = $filters['month'];
        $bucket = 'DAY(o.ordered_at)';
        $dayCount = (int) date('t', mktime(0, 0, 0, $filters['month'], 1, $filters['year']));
        $labels = array_map(
            static fn (int $day) => $day . ' ' . ADMIN_DASHBOARD_THAI_MONTHS[$filters['month'] - 1],
            range(1, $dayCount),
        );
        $offset = 1;
    }

    $statement = $db->prepare("SELECT $bucket AS bucket, $value AS value FROM orders o$where GROUP BY bucket");
    $statement->execute($params);

    $values = array_fill(0, count($labels), 0.0);
    foreach ($statement->fetchAll() as $row) {
        $index = (int) $row['bucket'] - $offset;
        if (isset($values[$index])) $values[$index] = (float) $row['value'];
    }

    return ['labels' => $labels, 'values' => $values];
}
