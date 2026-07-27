<?php
declare(strict_types=1);

function location_validate_input(array $input): array
{
    $name = trim((string) ($input['name'] ?? ''));
    $errors = [];
    if ($name === '') $errors['name'] = 'กรุณาระบุชื่อสถานที่รับสินค้า';

    return [[
        'name' => $name,
        'is_active' => ($input['is_active'] ?? '1') === '1' ? 1 : 0,
    ], $errors];
}
