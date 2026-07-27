<?php
declare(strict_types=1);

function admin_profile_validate_input(array $input): array
{
    $name = trim((string) ($input['name'] ?? ''));
    $errors = [];
    if ($name === '') $errors['name'] = 'กรุณาระบุชื่อผู้ดูแลระบบ';
    if (mb_strlen($name) > 150) $errors['name'] = 'ชื่อผู้ดูแลระบบยาวเกิน 150 ตัวอักษร';

    return [['display_name' => $name], $errors];
}
