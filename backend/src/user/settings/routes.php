<?php
declare(strict_types=1);

/** ข้อมูลของบาร์วิ่งหน้าร้าน มี 2 ชุดคือรายการสั่งซื้อของวันนี้ กับคำโฆษณาที่แอดมินตั้งไว้ */
function user_announcement_route(string $method, string $path): bool
{
    if ($method !== 'GET' || $path !== '/user/announcements') return false;

    $db = app_db();
    // เอาออเดอร์ล่าสุดของแต่ละคนคนละ 1 รายการ ไม่งั้นคนที่สั่งหลายรอบจะกินที่จนไม่เห็นคนอื่น
    $orders = $db->query("SELECT id, full_name FROM (
            SELECT o.id, o.ordered_at, u.full_name,
                ROW_NUMBER() OVER (PARTITION BY o.user_id ORDER BY o.ordered_at DESC, o.id DESC) AS latest_rank
            FROM orders o
            LEFT JOIN users u ON u.id = o.user_id
            WHERE DATE(o.ordered_at) = CURDATE() AND o.order_status <> 'cancelled'
        ) latest_orders
        WHERE latest_rank = 1
        ORDER BY ordered_at DESC, id DESC
        LIMIT 5")->fetchAll();

    $itemStatement = $db->prepare('SELECT product_name, quantity, unit_name FROM order_items WHERE order_id = :order_id ORDER BY id');
    $orderLines = [];
    foreach ($orders as $order) {
        $itemStatement->execute(['order_id' => $order['id']]);
        $items = array_map(
            static fn (array $item) => sprintf('%s %d %s', $item['product_name'], (int) $item['quantity'], $item['unit_name']),
            $itemStatement->fetchAll(),
        );
        if (!$items) continue;
        $orderLines[] = sprintf('%s สั่ง %s', $order['full_name'] ?? 'ลูกค้า', implode(', ', $items));
    }

    $advertisements = array_values(array_map(
        static fn (array $ad) => $ad['message'],
        array_filter(settings_ads($db), static fn (array $ad) => (bool) $ad['is_active']),
    ));

    json_response(['data' => ['orders' => $orderLines, 'advertisements' => $advertisements]]);
}

function user_settings_route(string $method, string $path): bool
{
    if ($method !== 'GET' || $path !== '/user/delivery-settings') return false;

    $settings = settings_find(app_db());
    $now = date('H:i:s');
    $period = static fn (string $cutoff, string $start, string $end) => [
        'cutoff' => substr($cutoff, 0, 5),
        'deliveryStart' => substr($start, 0, 5),
        'deliveryEnd' => substr($end, 0, 5),
        'isOpen' => $now <= $cutoff,
    ];

    json_response(['data' => [
        'morning' => $period($settings['morning_order_cutoff'], $settings['morning_delivery_start'], $settings['morning_delivery_end']),
        'afternoon' => $period($settings['afternoon_order_cutoff'], $settings['afternoon_delivery_start'], $settings['afternoon_delivery_end']),
        'paymentMinutes' => USER_ORDER_PAYMENT_MINUTES,
    ]]);
}
