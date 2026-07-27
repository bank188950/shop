<?php
declare(strict_types=1);

function category_validate_input(array $input): array
{
    $name = trim((string) ($input['name'] ?? ''));
    $errors = [];
    if ($name === '') $errors['name'] = 'กรุณาระบุชื่อหมวดสินค้า';

    return [[
        'name' => $name,
        'tracks_piece_quantity' => ($input['tracks_piece_quantity'] ?? '0') === '1' ? 1 : 0,
        'is_active' => ($input['is_active'] ?? '1') === '1' ? 1 : 0,
    ], $errors];
}
