<?php
declare(strict_types=1);

const USER_ORDER_PAYMENT_MINUTES = 30;

function user_order_validate_input(array $input): array
{
    $locationId = filter_var($input['location_id'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
    $period = (string) ($input['delivery_period'] ?? '');
    $note = trim((string) ($input['user_note'] ?? ''));
    $items = [];
    $errors = [];

    foreach (json_decode((string) ($input['items'] ?? '[]'), true) ?: [] as $item) {
        $productId = filter_var($item['productId'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
        $quantity = filter_var($item['quantity'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
        if ($productId && $quantity) $items[$productId] = ($items[$productId] ?? 0) + $quantity;
    }

    if (!$items) $errors['items'] = 'กรุณาเลือกสินค้าอย่างน้อย 1 รายการ';
    if ($locationId === false) $errors['location_id'] = 'กรุณาเลือกสถานที่ส่งของ';
    if (!in_array($period, ['morning', 'afternoon'], true)) $errors['delivery_period'] = 'กรุณาเลือกรอบการสั่งซื้อ';

    return [['location_id' => $locationId, 'delivery_period' => $period, 'user_note' => $note ?: null, 'items' => $items], $errors];
}

function user_order_period_cutoff(array $settings, string $period): string
{
    return $period === 'morning' ? $settings['morning_order_cutoff'] : $settings['afternoon_order_cutoff'];
}

function user_order_period_label(string $period): string
{
    return $period === 'morning' ? 'รอบเช้า' : 'รอบบ่าย';
}
