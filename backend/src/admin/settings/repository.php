<?php
declare(strict_types=1);

function settings_ensure_row(PDO $db): void
{
    $db->exec('INSERT INTO settings (id) VALUES (1) ON DUPLICATE KEY UPDATE id = id');
}

function settings_find(PDO $db): array
{
    settings_ensure_row($db);
    return $db->query('SELECT morning_order_cutoff, morning_delivery_start, morning_delivery_end, afternoon_order_cutoff, afternoon_delivery_start, afternoon_delivery_end, notice_popup_message, is_notice_popup_enabled FROM settings WHERE id = 1')->fetch();
}

function settings_advertisement_list(PDO $db): array
{
    return $db->query('SELECT message, is_active FROM announcements ORDER BY display_order, id')->fetchAll();
}

function settings_to_api(array $settings, array $advertisements): array
{
    return [
        'morningOrderCutoff' => substr($settings['morning_order_cutoff'], 0, 5),
        'morningDeliveryStart' => substr($settings['morning_delivery_start'], 0, 5),
        'morningDeliveryEnd' => substr($settings['morning_delivery_end'], 0, 5),
        'afternoonOrderCutoff' => substr($settings['afternoon_order_cutoff'], 0, 5),
        'afternoonDeliveryStart' => substr($settings['afternoon_delivery_start'], 0, 5),
        'afternoonDeliveryEnd' => substr($settings['afternoon_delivery_end'], 0, 5),
        'noticePopupMessage' => $settings['notice_popup_message'] ?? '',
        'isNoticePopupEnabled' => (bool) $settings['is_notice_popup_enabled'],
        'advertisements' => array_map(static fn ($advertisement) => $advertisement['message'], $advertisements),
        'isAdvertisementVisible' => (bool) array_filter($advertisements, static fn ($advertisement) => $advertisement['is_active']),
    ];
}

function settings_update(PDO $db, array $data): void
{
    $statement = $db->prepare('UPDATE settings SET morning_order_cutoff = :morning_order_cutoff, morning_delivery_start = :morning_delivery_start, morning_delivery_end = :morning_delivery_end, afternoon_order_cutoff = :afternoon_order_cutoff, afternoon_delivery_start = :afternoon_delivery_start, afternoon_delivery_end = :afternoon_delivery_end, notice_popup_message = :notice_popup_message, is_notice_popup_enabled = :is_notice_popup_enabled WHERE id = 1');
    $statement->execute([
        'morning_order_cutoff' => $data['morning_order_cutoff'],
        'morning_delivery_start' => $data['morning_delivery_start'],
        'morning_delivery_end' => $data['morning_delivery_end'],
        'afternoon_order_cutoff' => $data['afternoon_order_cutoff'],
        'afternoon_delivery_start' => $data['afternoon_delivery_start'],
        'afternoon_delivery_end' => $data['afternoon_delivery_end'],
        'notice_popup_message' => $data['notice_popup_message'],
        'is_notice_popup_enabled' => $data['is_notice_popup_enabled'],
    ]);
}

function settings_replace_advertisements(PDO $db, array $messages, bool $isVisible): void
{
    $db->exec('DELETE FROM announcements');
    $statement = $db->prepare('INSERT INTO announcements (message, display_order, is_active) VALUES (:message, :display_order, :is_active)');
    foreach ($messages as $index => $message) {
        $statement->execute(['message' => $message, 'display_order' => $index, 'is_active' => $isVisible ? 1 : 0]);
    }
}
