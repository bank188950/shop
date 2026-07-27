<?php
declare(strict_types=1);

function customer_message_validate_input(array $input, bool $hasImage, bool $isUpdate): array
{
    $body = trim((string) ($input['body'] ?? ''));
    $removeImage = ($input['remove_image'] ?? '0') === '1';
    $errors = [];

    if ($isUpdate && $removeImage && !$body && !$hasImage) {
        $errors['body'] = 'ข้อความต้องมีข้อความหรือรูปภาพอย่างน้อย 1 รายการ';
    }
    if (!$isUpdate && !$body && !$hasImage) {
        $errors['body'] = 'กรุณาระบุข้อความหรือแนบรูปภาพ';
    }

    return [[
        'body' => $body ?: null,
        'remove_image' => $removeImage,
    ], $errors];
}
