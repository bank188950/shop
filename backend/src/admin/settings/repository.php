<?php
declare(strict_types=1);

function settings_ensure_row(PDO $db): void { $db->exec('INSERT INTO settings (id) VALUES (1) ON DUPLICATE KEY UPDATE id = id'); }
function settings_find(PDO $db): array { settings_ensure_row($db); return $db->query('SELECT morning_order_cutoff, morning_delivery_start, morning_delivery_end, afternoon_order_cutoff, afternoon_delivery_start, afternoon_delivery_end, payment_account_name, payment_bank_code, payment_account_number, payment_promptpay_type, payment_promptpay_id, payment_slip_account_type, notice_popup_message, is_notice_popup_enabled, is_badge_notification_enabled FROM settings WHERE id = 1')->fetch(); }
function settings_ads(PDO $db): array { return $db->query('SELECT message, is_active FROM announcements ORDER BY display_order, id')->fetchAll(); }
function settings_to_api(array $settings, array $ads): array {
    return ['morningCutoff' => substr($settings['morning_order_cutoff'], 0, 5), 'morningDelivery' => substr($settings['morning_delivery_start'], 0, 5) . '–' . substr($settings['morning_delivery_end'], 0, 5), 'afternoonCutoff' => substr($settings['afternoon_order_cutoff'], 0, 5), 'afternoonDelivery' => substr($settings['afternoon_delivery_start'], 0, 5) . '–' . substr($settings['afternoon_delivery_end'], 0, 5), 'noticeMessage' => $settings['notice_popup_message'] ?? '', 'isNoticePopupEnabled' => (bool) $settings['is_notice_popup_enabled'], 'isBadgeNotificationEnabled' => (bool) $settings['is_badge_notification_enabled'], 'advertisementTexts' => array_map(static fn ($ad) => $ad['message'], $ads), 'isAdvertisementVisible' => (bool) array_filter($ads, static fn ($ad) => $ad['is_active'])];
}
function settings_save(PDO $db, array $data): void {
    $statement = $db->prepare('UPDATE settings SET morning_order_cutoff = :morning_order_cutoff, morning_delivery_start = :morning_delivery_start, morning_delivery_end = :morning_delivery_end, afternoon_order_cutoff = :afternoon_order_cutoff, afternoon_delivery_start = :afternoon_delivery_start, afternoon_delivery_end = :afternoon_delivery_end, notice_popup_message = :notice_popup_message, is_notice_popup_enabled = :is_notice_popup_enabled, is_badge_notification_enabled = :is_badge_notification_enabled WHERE id = 1');
    $statement->execute(array_intersect_key($data, array_flip(['morning_order_cutoff', 'morning_delivery_start', 'morning_delivery_end', 'afternoon_order_cutoff', 'afternoon_delivery_start', 'afternoon_delivery_end', 'notice_popup_message', 'is_notice_popup_enabled', 'is_badge_notification_enabled'])));
    $db->exec('DELETE FROM announcements');
    $adStatement = $db->prepare('INSERT INTO announcements (message, display_order, is_active) VALUES (:message, :display_order, :is_active)');
    foreach ($data['advertisements'] as $index => $message) $adStatement->execute(['message' => $message, 'display_order' => $index, 'is_active' => $data['is_advertisement_visible']]);
}
