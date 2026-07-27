<?php
declare(strict_types=1);

function setting_validate_time(array $input, string $field, string $label, array &$errors): string
{
    $value = trim((string) ($input[$field] ?? ''));
    if ($value === '') $errors[$field] = "กรุณาระบุ{$label}";
    return $value;
}

function settings_validate_input(array $input): array
{
    $errors = [];
    $advertisements = json_decode((string) ($input['advertisements'] ?? '[]'), true);
    if (!is_array($advertisements)) {
        $errors['advertisements'] = 'ข้อมูลโฆษณาไม่ถูกต้อง';
        $advertisements = [];
    }
    $messages = array_values(array_filter(array_map(static fn ($item) => trim((string) $item), $advertisements), static fn ($item) => $item !== ''));
    if (count($messages) > 3) $errors['advertisements'] = 'เพิ่มข้อความโฆษณาได้สูงสุด 3 ข้อความ';

    return [[
        'morning_order_cutoff' => setting_validate_time($input, 'morning_order_cutoff', 'เวลาปิดรับรอบเช้า', $errors),
        'morning_delivery_start' => setting_validate_time($input, 'morning_delivery_start', 'เวลาเริ่มจัดส่งรอบเช้า', $errors),
        'morning_delivery_end' => setting_validate_time($input, 'morning_delivery_end', 'เวลาสิ้นสุดจัดส่งรอบเช้า', $errors),
        'afternoon_order_cutoff' => setting_validate_time($input, 'afternoon_order_cutoff', 'เวลาปิดรับรอบบ่าย', $errors),
        'afternoon_delivery_start' => setting_validate_time($input, 'afternoon_delivery_start', 'เวลาเริ่มจัดส่งรอบบ่าย', $errors),
        'afternoon_delivery_end' => setting_validate_time($input, 'afternoon_delivery_end', 'เวลาสิ้นสุดจัดส่งรอบบ่าย', $errors),
        'notice_popup_message' => trim((string) ($input['notice_popup_message'] ?? '')) ?: null,
        'is_notice_popup_enabled' => ($input['is_notice_popup_enabled'] ?? '0') === '1' ? 1 : 0,
        'advertisements' => $messages,
        'is_advertisement_visible' => ($input['is_advertisement_visible'] ?? '0') === '1' ? 1 : 0,
    ], $errors];
}
