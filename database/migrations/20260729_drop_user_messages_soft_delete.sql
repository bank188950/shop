-- โปรเจกต์นี้ไม่ใช้ soft delete และโค้ดลบข้อความด้วย DELETE ทั้งแถวอยู่แล้ว
-- คอลัมน์ deleted_at กับ deleted_by จึงเป็น NULL ตลอดและไม่มีโค้ดไหนอ่านหรือเขียน

-- 1) ถอด foreign key ก่อน ไม่งั้น MySQL จะฟ้อง #1828 ว่าคอลัมน์ยังถูกใช้ใน constraint
ALTER TABLE user_messages
  DROP FOREIGN KEY fk_user_messages_deleted_by;

-- 2) ลบ index ที่อ้างถึงคอลัมน์ทั้งสอง แล้วค่อยลบคอลัมน์
ALTER TABLE user_messages
  DROP INDEX fk_user_messages_deleted_by,
  DROP INDEX idx_user_messages_inbox,
  DROP COLUMN deleted_by,
  DROP COLUMN deleted_at;

-- 3) สร้าง index กล่องข้อความใหม่โดยไม่มี deleted_at คั่นกลาง
--    ของเดิมเป็น (recipient_user_id, deleted_at, sent_at) ทำให้เรียงตาม sent_at ได้ไม่เต็มที่
ALTER TABLE user_messages
  ADD KEY idx_user_messages_inbox (recipient_user_id, sent_at);
