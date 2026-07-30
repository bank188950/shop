-- สวิตช์เปิด/ปิดตัวเลขแจ้งเตือนบนแถบบนของหน้าแอดมิน (ออเดอร์รอตรวจสอบ และสินค้าใกล้หมด)
-- ตั้งค่าเริ่มต้นเป็นปิด ให้แอดมินเข้าไปติ๊กเปิดเองในหน้าตั้งค่า จะได้ไม่มี request วิ่งอยู่เบื้องหลังโดยที่ยังไม่มีใครสั่ง

ALTER TABLE settings
  ADD COLUMN is_badge_notification_enabled TINYINT(1) NOT NULL DEFAULT 0 AFTER is_notice_popup_enabled;
