<?php
declare(strict_types=1);

function banner_validate_input(array $input): array
{
    $title = trim((string) ($input['title'] ?? ''));
    $errors = [];
    if ($title === '') $errors['title'] = 'กรุณาระบุหัวข้อแบนเนอร์';

    return [[
        'title' => $title,
        'is_active' => ($input['is_active'] ?? '1') === '1' ? 1 : 0,
    ], $errors];
}
