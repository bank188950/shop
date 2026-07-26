<?php
declare(strict_types=1);

function unit_validate_input(array $input): array
{
    $name = trim((string) ($input['name'] ?? ''));
    $errors = [];
    if ($name === '') $errors['name'] = 'กรุณาระบุชื่อหน่วยสินค้า';
    if (mb_strlen($name) > 100) $errors['name'] = 'ชื่อหน่วยสินค้ายาวเกิน 100 ตัวอักษร';
    return [['name' => $name], $errors];
}
