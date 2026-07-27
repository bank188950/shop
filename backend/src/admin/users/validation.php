<?php
declare(strict_types=1);

function user_validate_input(array $input, bool $isCreate): array
{
    $name = trim((string) ($input['name'] ?? ''));
    $phone = trim((string) ($input['phone'] ?? ''));
    $lineId = trim((string) ($input['line_id'] ?? ''));
    $locationId = filter_var($input['location_id'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
    $password = (string) ($input['password'] ?? '');
    $confirmPassword = (string) ($input['confirm_password'] ?? '');
    $errors = [];
    if ($name === '') $errors['name'] = 'กรุณาระบุชื่อลูกค้า';
    if (!preg_match('/^\d{10}$/', $phone)) $errors['phone'] = 'กรุณาระบุเบอร์โทรศัพท์ 10 หลัก';
    if ($locationId === false) $errors['location_id'] = 'กรุณาเลือกจุดรับสินค้า';
    if ($isCreate && $password === '') $errors['password'] = 'กรุณาระบุรหัสผ่าน';
    if (($isCreate || $password !== '' || $confirmPassword !== '') && $password !== $confirmPassword) $errors['confirm_password'] = 'ยืนยันรหัสผ่านไม่ตรงกัน';

    return [[
        'full_name' => $name,
        'phone' => $phone,
        'line_account' => $lineId ?: null,
        'default_location_id' => $locationId,
        'is_active' => ($input['is_active'] ?? '1') === '1' ? 1 : 0,
        'password' => $password,
    ], $errors];
}
