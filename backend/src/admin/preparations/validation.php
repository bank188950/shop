<?php
declare(strict_types=1);

const PREPARATION_DELIVERY_PERIODS = ['morning', 'afternoon'];

function preparation_validate_filters(array $input): array
{
    $date = (string) ($input['delivery_date'] ?? '');
    $period = (string) ($input['delivery_period'] ?? '');
    $locationId = filter_var($input['location_id'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);

    return [
        'delivery_date' => preg_match('/^\d{4}-\d{2}-\d{2}$/', $date) ? $date : date('Y-m-d'),
        'delivery_period' => in_array($period, PREPARATION_DELIVERY_PERIODS, true) ? $period : 'morning',
        'location_id' => $locationId ?: 0,
    ];
}

function preparation_validate_order_ids(array $input): array
{
    $orderIds = [];
    foreach (json_decode((string) ($input['order_ids'] ?? '[]'), true) ?: [] as $orderId) {
        $id = filter_var($orderId, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
        if ($id) $orderIds[$id] = $id;
    }

    return [array_values($orderIds), $orderIds ? [] : ['order_ids' => 'กรุณาเลือกรายการสั่งซื้ออย่างน้อย 1 รายการ']];
}
