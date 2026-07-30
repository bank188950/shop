<?php
declare(strict_types=1);

function order_cleanup_route(string $method, string $path): bool
{
    if ($path !== '/admin/order-cleanup') return false;

    $input = $method === 'GET' ? $_GET : $_POST;
    $range = order_cleanup_range((string) ($input['period'] ?? ''), (string) ($input['value'] ?? ''));
    if (!$range) json_response(['message' => 'ช่วงเวลาที่เลือกไม่ถูกต้อง'], 422);

    $db = app_db();
    $slips = order_cleanup_slip_paths($db, $range[0], $range[1]);

    if ($method === 'GET') json_response(['data' => ['slipCount' => count($slips)]]);

    if ($method === 'POST') {
        $cleared = order_cleanup_clear_slips($db, $slips);
        json_response([
            'data' => ['slipCount' => 0, 'clearedCount' => $cleared],
            'message' => $cleared ? sprintf('ล้างไฟล์สลิปแล้ว %d ไฟล์', $cleared) : 'ไม่มีไฟล์สลิปในช่วงเวลาที่เลือก',
        ]);
    }

    return false;
}
