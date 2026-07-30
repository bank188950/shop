-- สวิตช์เปิด/ปิดตัวเลขแจ้งเตือนบนแถบบนของหน้าแอดมิน (ออเดอร์รอตรวจสอบ และสินค้าใกล้หมด)
-- ตั้งค่าเริ่มต้นเป็นเปิด เพราะระบบเดิมแสดงตัวเลขนี้อยู่แล้ว ถ้าตั้งเป็นปิดจะกลายเป็นว่าอัปเดตแล้วแจ้งเตือนหายไปเอง

ALTER TABLE settings
  ADD COLUMN is_badge_notification_enabled TINYINT(1) NOT NULL DEFAULT 1 AFTER is_notice_popup_enabled;
