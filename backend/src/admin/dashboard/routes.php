<?php
declare(strict_types=1);

function admin_dashboard_validate_filters(array $input): array
{
    $date = (string) ($input['delivery_date'] ?? '');
    $period = (string) ($input['delivery_period'] ?? '');
    $locationId = filter_var($input['location_id'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);

    return [
        'delivery_date' => preg_match('/^\d{4}-\d{2}-\d{2}$/', $date) ? $date : date('Y-m-d'),
        'delivery_period' => in_array($period, ['morning', 'afternoon'], true) ? $period : '',
        'location_id' => $locationId ?: 0,
    ];
}

function admin_dashboard_validate_chart_filters(array $input): array
{
    $metric = (string) ($input['metric'] ?? '');
    $range = (string) ($input['range'] ?? '');
    $year = filter_var($input['year'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 2000, 'max_range' => 2200]]);
    $month = filter_var($input['month'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1, 'max_range' => 12]]);
    $locationId = filter_var($input['location_id'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);

    return [
        'metric' => $metric === 'orders' ? 'orders' : 'sales',
        'range' => in_array($range, ['today', 'week'], true) ? $range : 'month',
        'year' => $year ?: (int) date('Y'),
        'month' => $month ?: (int) date('n'),
        'location_id' => $locationId ?: 0,
    ];
}

function admin_dashboard_route(string $method, string $path): bool
{
    if ($method !== 'GET') return false;

    if ($path === '/admin/dashboard') {
        $db = app_db();
        $filters = admin_dashboard_validate_filters($_GET);
        json_response([
            'data' => admin_dashboard_totals($db, $filters) + [
                'pendingOrders' => admin_dashboard_pending_orders($db, $filters),
                'locationSummary' => admin_dashboard_location_summary($db, $filters),
            ],
            'locations' => admin_dashboard_locations($db),
        ]);
    }

    if ($path === '/admin/dashboard/badge-counts') {
        json_response(['data' => admin_dashboard_badge_counts(app_db())]);
    }

    // โควตาของ Slip2Go ไม่ได้อยู่ในฐานข้อมูลเรา ต้องถามจากเขาทุกครั้ง และต้องเรียกจากฝั่ง server เท่านั้นเพราะต้องแนบ secret key
    if ($path === '/admin/dashboard/slip-quota') {
        $info = slip2go_account_info();
        $data = $info['data'];
        $slipRemaining = isset($data['estimatedQuotaSlip']) ? (int) $data['estimatedQuotaSlip'] : 0;

        $daysLeft = null;
        if (!empty($data['packageExpiredDate'])) {
            $expired = date_create_immutable((string) $data['packageExpiredDate']);
            if ($expired) $daysLeft = (int) (new DateTimeImmutable('today'))->diff($expired)->format('%r%a');
        }

        json_response(['data' => [
            'isAvailable' => $info['code'] === '200001',
            'slipRemaining' => $slipRemaining,
            'daysLeft' => $daysLeft,
            'packageName' => $data['package'] ?? null,
            'isLow' => $slipRemaining <= SLIP2GO_ALERT_SLIP_THRESHOLD || ($daysLeft !== null && $daysLeft <= SLIP2GO_ALERT_DAY_THRESHOLD),
        ]]);
    }

    if ($path === '/admin/dashboard/chart') {
        json_response(['data' => admin_dashboard_chart(app_db(), admin_dashboard_validate_chart_filters($_GET))]);
    }

    return false;
}
