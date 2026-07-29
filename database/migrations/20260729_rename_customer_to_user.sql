-- เปลี่ยนชื่อ table, column, index และ foreign key ที่ใช้คำว่า customer ให้เป็น user ทั้งหมด
-- รวมถึงค่าใน users.role และ path รูปข้อความที่เก็บไว้ในฐานข้อมูล

-- 1) ตาราง customer_messages -> user_messages
--    ต้อง DROP foreign key ก่อน เพราะ MySQL เปลี่ยนชื่อ constraint ตรง ๆ ไม่ได้
ALTER TABLE customer_messages
  DROP FOREIGN KEY fk_customer_messages_recipient,
  DROP FOREIGN KEY fk_customer_messages_sender,
  DROP FOREIGN KEY fk_customer_messages_deleted_by,
  DROP CHECK chk_customer_messages_content;

RENAME TABLE customer_messages TO user_messages;

ALTER TABLE user_messages
  RENAME INDEX idx_customer_messages_inbox TO idx_user_messages_inbox,
  RENAME INDEX idx_customer_messages_sender TO idx_user_messages_sender,
  RENAME INDEX fk_customer_messages_deleted_by TO fk_user_messages_deleted_by;

ALTER TABLE user_messages
  ADD CONSTRAINT fk_user_messages_recipient
    FOREIGN KEY (recipient_user_id) REFERENCES users (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT fk_user_messages_sender
    FOREIGN KEY (sender_admin_id) REFERENCES users (id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT fk_user_messages_deleted_by
    FOREIGN KEY (deleted_by) REFERENCES users (id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT chk_user_messages_content
    CHECK (body IS NOT NULL OR image_path IS NOT NULL);

-- 2) คอลัมน์ในตาราง orders
ALTER TABLE orders
  DROP FOREIGN KEY fk_orders_customer;

ALTER TABLE orders
  RENAME COLUMN customer_id TO user_id,
  RENAME COLUMN customer_note TO user_note,
  RENAME INDEX idx_orders_customer_created TO idx_orders_user_created;

ALTER TABLE orders
  ADD CONSTRAINT fk_orders_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE SET NULL ON UPDATE CASCADE;

-- 3) ค่าใน users.role จาก 'customer' เป็น 'user'
--    ขยาย enum ให้รับได้ทั้งสองค่าก่อน แล้วค่อยย้ายข้อมูลและตัดค่าเก่าทิ้ง
ALTER TABLE users
  MODIFY COLUMN role ENUM('customer','user','admin') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'customer';

UPDATE users SET role = 'user' WHERE role = 'customer';

ALTER TABLE users
  MODIFY COLUMN role ENUM('user','admin') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user';

-- 4) path รูปข้อความที่เก็บไว้ ย้ายตามโฟลเดอร์ uploads/customer-messages -> uploads/user-messages
UPDATE user_messages
SET image_path = REPLACE(image_path, 'uploads/customer-messages/', 'uploads/user-messages/')
WHERE image_path LIKE 'uploads/customer-messages/%';
