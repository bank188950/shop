<?php
declare(strict_types=1);

function setting_delivery_range(string $value, string $field, array &$errors): array
{
    $parts = preg_split('/\s*[–-]\s*/u', trim($value)) ?: [];
    if (count($parts) !== 2 || !$parts[0] || !$parts[1]) {
        $errors[$field] = 'กรุณาระบุเวลาจัดส่งในรูปแบบ 09:00–10:00';
        return ['00:00', '00:00'];
    }
    return [$parts[0], $parts[1]];
}

function settings_validate_input(array $input): array
{
    $errors = [];
    $morningCutoff = trim((string) ($input['morning_order_cutoff'] ?? ''));
    $afternoonCutoff = trim((string) ($input['afternoon_order_cutoff'] ?? ''));
    if ($morningCutoff === '') $errors['morning_order_cutoff'] = 'กรุณาระบุเวลาปิดรับรอบเช้า';
    if ($afternoonCutoff === '') $errors['afternoon_order_cutoff'] = 'กรุณาระบุเวลาปิดรับรอบบ่าย';
    [$morningStart, $morningEnd] = setting_delivery_range((string) ($input['morning_delivery'] ?? ''), 'morning_delivery', $errors);
    [$afternoonStart, $afternoonEnd] = setting_delivery_range((string) ($input['afternoon_delivery'] ?? ''), 'afternoon_delivery', $errors);
    $advertisements = json_decode((string) ($input['advertisements'] ?? '[]'), true);
    if (!is_array($advertisements)) $advertisements = [];
    $advertisements = array_values(array_filter(array_map(static fn ($item) => trim((string) $item), $advertisements), static fn ($item) => $item !== ''));
    if (count($advertisements) > 3) $errors['advertisements'] = 'เพิ่มข้อความโฆษณาได้สูงสุด 3 ข้อความ';

    return [[
        'morning_order_cutoff' => $morningCutoff,
        'morning_delivery_start' => $morningStart,
        'morning_delivery_end' => $morningEnd,
        'afternoon_order_cutoff' => $afternoonCutoff,
        'afternoon_delivery_start' => $afternoonStart,
        'afternoon_delivery_end' => $afternoonEnd,
        'notice_popup_message' => trim((string) ($input['notice_popup_message'] ?? '')) ?: null,
        'is_notice_popup_enabled' => ($input['is_notice_popup_enabled'] ?? '0') === '1' ? 1 : 0,
        'advertisements' => $advertisements,
        'is_advertisement_visible' => ($input['is_advertisement_visible'] ?? '0') === '1' ? 1 : 0,
    ], $errors];
}
