<?php
declare(strict_types=1);

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
