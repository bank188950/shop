<?php
declare(strict_types=1);

function customer_profile_validate_input(array $input): array
{
    $name = trim((string) ($input['name'] ?? ''));
    $phone = trim((string) ($input['phone'] ?? ''));
    $lineId = trim((string) ($input['line_id'] ?? ''));
    $locationId = filter_var($input['location_id'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
    $errors = [];
    if ($name === '') $errors['name'] = 'กรุณากรอกชื่อลูกค้า';
    if (!preg_match('/^\d{10}$/', $phone)) $errors['phone'] = 'กรุณากรอกเบอร์โทรศัพท์ 10 หลัก';
    if ($locationId === false) $errors['location_id'] = 'กรุณาเลือกสถานที่ส่งของ';

    return [[
        'full_name' => $name,
        'phone' => $phone,
        'line_account' => $lineId ?: null,
        'default_location_id' => $locationId,
    ], $errors];
}
