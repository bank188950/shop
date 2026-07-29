<?php
declare(strict_types=1);

/** สถานะที่เปลี่ยนแบบกลุ่มได้ ไม่รวม `pending_payment` เพราะย้อนกลับไปรอชำระเงินไม่ได้จากหน้ารายการ */
const ADMIN_ORDER_BULK_STATUSES = ['pending_review', 'preparing', 'ready_for_delivery', 'delivered', 'cancelled'];

/** สถานะรายการสั่งซื้อที่เลือกได้ ขึ้นกับสถานะการชำระเงินตาม design-admin.md */
function admin_order_statuses_for_payment(string $paymentStatus): array
{
    return $paymentStatus === 'paid'
        ? ['pending_review', 'preparing', 'ready_for_delivery', 'delivered']
        : ['pending_payment', 'cancelled'];
}

function admin_order_validate_filters(array $input): array
{
    $date = (string) ($input['delivery_date'] ?? '');
    $period = (string) ($input['delivery_period'] ?? '');
    $status = (string) ($input['order_status'] ?? '');
    $locationId = filter_var($input['location_id'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);

    return [
        'delivery_date' => preg_match('/^\d{4}-\d{2}-\d{2}$/', $date) ? $date : date('Y-m-d'),
        'delivery_period' => in_array($period, ['morning', 'afternoon'], true) ? $period : '',
        'location_id' => $locationId ?: 0,
        'order_status' => in_array($status, ADMIN_ORDER_STATUSES, true) ? $status : '',
        'q' => trim((string) ($input['q'] ?? '')),
    ];
}

function admin_order_validate_bulk_input(array $input): array
{
    $status = (string) ($input['order_status'] ?? '');
    $orderIds = [];
    $errors = [];

    foreach (json_decode((string) ($input['order_ids'] ?? '[]'), true) ?: [] as $orderId) {
        $id = filter_var($orderId, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
        if ($id) $orderIds[$id] = $id;
    }

    if (!$orderIds) $errors['order_ids'] = 'กรุณาเลือกรายการสั่งซื้ออย่างน้อย 1 รายการ';
    if (!in_array($status, ADMIN_ORDER_BULK_STATUSES, true)) $errors['order_status'] = 'กรุณาเลือกสถานะใหม่';

    return [['order_ids' => array_values($orderIds), 'order_status' => $status], $errors];
}

function admin_order_validate_status_input(array $input): array
{
    $paymentStatus = (string) ($input['payment_status'] ?? '');
    $orderStatus = (string) ($input['order_status'] ?? '');
    $errors = [];

    if (!in_array($paymentStatus, ADMIN_ORDER_PAYMENT_STATUSES, true)) {
        $errors['payment_status'] = 'กรุณาเลือกสถานะการชำระเงิน';
    } elseif (!in_array($orderStatus, admin_order_statuses_for_payment($paymentStatus), true)) {
        $errors['order_status'] = 'สถานะรายการสั่งซื้อไม่ตรงกับสถานะการชำระเงิน';
    }

    return [['payment_status' => $paymentStatus, 'order_status' => $orderStatus], $errors];
}
