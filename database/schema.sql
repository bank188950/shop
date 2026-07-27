-- Schema สำหรับระบบร้านลูกชิ้นทอดล้อเลื่อน
-- MySQL 8.0+ | ใช้สำหรับสร้างฐานข้อมูลใหม่ (ไม่มีคำสั่ง DROP TABLE)
-- รหัสผ่านต้องเก็บเป็น bcrypt หรือ Argon2 hash เท่านั้น ห้ามเก็บ plaintext หรือ MD5

CREATE DATABASE IF NOT EXISTS lorluean_shop_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE lorluean_shop_db;

-- จุดรับสินค้า: ถูกอ้างอิงจากผู้ใช้และรายการสั่งซื้อ
CREATE TABLE IF NOT EXISTS locations (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_locations_name (name),
  KEY idx_locations_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ผู้ใช้และผู้ดูแลใช้ตารางเดียวกัน แยกสิทธิ์ด้วย role เพื่อไม่เก็บข้อมูลซ้ำ
CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
  full_name VARCHAR(150) NOT NULL,
  phone CHAR(10) NOT NULL,
  line_account VARCHAR(150) NULL,
  password_hash VARCHAR(255) NOT NULL,
  default_location_id BIGINT UNSIGNED NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  last_login_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_phone (phone),
  KEY idx_users_role_active (role, is_active),
  CONSTRAINT fk_users_default_location
    FOREIGN KEY (default_location_id) REFERENCES locations(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT chk_users_phone
    CHECK (phone REGEXP '^0[0-9]{9}$')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- หน่วยขาย เช่น ไม้, แก้ว, กล่อง
CREATE TABLE IF NOT EXISTS product_units (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_product_units_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- หมวดสินค้า พร้อม flag ระบุว่าต้องติดตามจำนวนชิ้นย่อยหรือไม่
CREATE TABLE IF NOT EXISTS product_categories (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  tracks_piece_quantity TINYINT(1) NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_product_categories_name (name),
  KEY idx_product_categories_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- สินค้าและสต็อกปัจจุบัน: stock_quantity คือจำนวนตามหน่วยขาย
-- หมวดที่ระบุจำนวนชิ้นต่อ 1 สินค้า จะคำนวณ stock_quantity จาก stock_piece_count หารด้วย pieces_per_sale แบบปัดเศษทิ้ง
-- หมวดที่ไม่ระบุ จะกรอก stock_quantity ตรง ๆ และเก็บ stock_piece_count กับ pieces_per_sale เป็น 0
CREATE TABLE IF NOT EXISTS products (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id BIGINT UNSIGNED NOT NULL,
  unit_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT NULL,
  image_path VARCHAR(255) NULL,
  sale_price DECIMAL(10,2) NOT NULL,
  stock_quantity INT UNSIGNED NOT NULL DEFAULT 0,
  stock_piece_count INT UNSIGNED NOT NULL DEFAULT 0,
  pieces_per_sale INT UNSIGNED NOT NULL DEFAULT 0,
  low_stock_threshold INT UNSIGNED NOT NULL DEFAULT 5,
  is_recommended TINYINT(1) NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_products_category_active (category_id, is_active),
  KEY idx_products_recommended (is_active, is_recommended),
  KEY idx_products_low_stock (is_active, stock_quantity),
  CONSTRAINT fk_products_category
    FOREIGN KEY (category_id) REFERENCES product_categories(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_products_unit
    FOREIGN KEY (unit_id) REFERENCES product_units(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT chk_products_price CHECK (sale_price >= 0),
  CONSTRAINT chk_products_pieces_per_sale CHECK (pieces_per_sale >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- กลุ่มออเดอร์ที่แอดมินเลือกเพื่อเตรียมสินค้าเป็นชุดเดียวกัน
CREATE TABLE IF NOT EXISTS preparation_groups (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  delivery_date DATE NOT NULL,
  delivery_period ENUM('morning', 'afternoon') NOT NULL,
  location_id BIGINT UNSIGNED NULL,
  group_status ENUM('preparing', 'ready') NOT NULL DEFAULT 'preparing',
  created_by BIGINT UNSIGNED NULL,
  ready_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_preparation_groups_schedule (delivery_date, delivery_period, group_status),
  KEY idx_preparation_groups_location (location_id),
  CONSTRAINT fk_preparation_groups_location
    FOREIGN KEY (location_id) REFERENCES locations(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_preparation_groups_created_by
    FOREIGN KEY (created_by) REFERENCES users(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- หัวรายการสั่งซื้อ: เก็บสถานะล่าสุดและเวลาแต่ละขั้นตอนในตารางเดียว
CREATE TABLE IF NOT EXISTS orders (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(30) NOT NULL,
  customer_id BIGINT UNSIGNED NULL,
  location_id BIGINT UNSIGNED NOT NULL,
  delivery_date DATE NOT NULL,
  delivery_period ENUM('morning', 'afternoon') NOT NULL,
  preparation_group_id BIGINT UNSIGNED NULL,
  order_status ENUM('pending_payment', 'pending_review', 'preparing', 'ready_for_delivery', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending_payment',
  payment_status ENUM('pending', 'paid', 'rejected', 'refunded') NOT NULL DEFAULT 'pending',
  subtotal_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  customer_note TEXT NULL,
  cancelled_at DATETIME NULL,
  cancelled_by BIGINT UNSIGNED NULL,
  cancellation_reason VARCHAR(255) NULL,
  preparing_at DATETIME NULL,
  ready_at DATETIME NULL,
  delivered_at DATETIME NULL,
  status_updated_by BIGINT UNSIGNED NULL,
  status_note VARCHAR(255) NULL,
  ordered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_orders_order_number (order_number),
  KEY idx_orders_dashboard (delivery_date, delivery_period, payment_status, order_status),
  KEY idx_orders_customer_created (customer_id, ordered_at),
  KEY idx_orders_location_date (location_id, delivery_date),
  KEY idx_orders_preparation_group (preparation_group_id),
  CONSTRAINT fk_orders_customer
    FOREIGN KEY (customer_id) REFERENCES users(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_orders_location
    FOREIGN KEY (location_id) REFERENCES locations(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_orders_preparation_group
    FOREIGN KEY (preparation_group_id) REFERENCES preparation_groups(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_orders_cancelled_by
    FOREIGN KEY (cancelled_by) REFERENCES users(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_orders_status_updated_by
    FOREIGN KEY (status_updated_by) REFERENCES users(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT chk_orders_amounts CHECK (subtotal_amount >= 0 AND total_amount >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- รายการสินค้าในออเดอร์ เก็บชื่อ หน่วย และราคา ณ เวลาสั่งซื้อเพื่อคงประวัติเดิม
CREATE TABLE IF NOT EXISTS order_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NULL,
  product_name VARCHAR(150) NOT NULL,
  unit_name VARCHAR(100) NOT NULL,
  quantity INT UNSIGNED NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  line_total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_order_items_order (order_id),
  KEY idx_order_items_product (product_id),
  CONSTRAINT fk_order_items_order
    FOREIGN KEY (order_id) REFERENCES orders(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_order_items_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT chk_order_items_quantity CHECK (quantity > 0),
  CONSTRAINT chk_order_items_amounts CHECK (unit_price >= 0 AND line_total >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- หลักฐานและการตรวจสอบการชำระเงิน หนึ่งรายการต่อหนึ่งออเดอร์
CREATE TABLE IF NOT EXISTS order_payments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  payment_method ENUM('bank_transfer', 'cash', 'online') NOT NULL,
  payment_status ENUM('pending', 'paid', 'rejected', 'refunded') NOT NULL DEFAULT 'pending',
  amount DECIMAL(10,2) NOT NULL,
  slip_path VARCHAR(255) NULL,
  paid_at DATETIME NULL,
  verified_at DATETIME NULL,
  verified_by BIGINT UNSIGNED NULL,
  rejection_reason VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_order_payments_order (order_id),
  KEY idx_order_payments_status (payment_status, created_at),
  CONSTRAINT fk_order_payments_order
    FOREIGN KEY (order_id) REFERENCES orders(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_order_payments_verified_by
    FOREIGN KEY (verified_by) REFERENCES users(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT chk_order_payments_amount CHECK (amount >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ข้อความทางเดียวจากแอดมินถึงลูกค้า รองรับข้อความ รูปภาพ การแก้ไข และการลบแบบ soft delete
CREATE TABLE IF NOT EXISTS customer_messages (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  recipient_user_id BIGINT UNSIGNED NOT NULL,
  sender_admin_id BIGINT UNSIGNED NULL,
  body TEXT NULL,
  image_path VARCHAR(255) NULL,
  sent_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  edited_at DATETIME NULL,
  deleted_at DATETIME NULL,
  deleted_by BIGINT UNSIGNED NULL,
  KEY idx_customer_messages_inbox (recipient_user_id, deleted_at, sent_at),
  KEY idx_customer_messages_sender (sender_admin_id, sent_at),
  CONSTRAINT fk_customer_messages_recipient
    FOREIGN KEY (recipient_user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_customer_messages_sender
    FOREIGN KEY (sender_admin_id) REFERENCES users(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_customer_messages_deleted_by
    FOREIGN KEY (deleted_by) REFERENCES users(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT chk_customer_messages_content CHECK (body IS NOT NULL OR image_path IS NOT NULL)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- แบนเนอร์หน้าแรกที่แอดมินเพิ่ม/แก้ไข/เปิดหรือปิดได้
CREATE TABLE IF NOT EXISTS banners (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  image_path VARCHAR(255) NOT NULL,
  display_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  starts_at DATETIME NULL,
  ends_at DATETIME NULL,
  created_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_banners_visible (is_active, display_order, starts_at, ends_at),
  CONSTRAINT fk_banners_created_by
    FOREIGN KEY (created_by) REFERENCES users(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ข้อความประกาศและโฆษณาที่ตั้งค่าจาก admin
CREATE TABLE IF NOT EXISTS announcements (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  message TEXT NOT NULL,
  display_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  starts_at DATETIME NULL,
  ends_at DATETIME NULL,
  created_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_announcements_visible (is_active, display_order, starts_at, ends_at),
  CONSTRAINT fk_announcements_created_by
    FOREIGN KEY (created_by) REFERENCES users(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- การตั้งค่ารอบสั่งและ popup แจ้งเตือนตามหน้า Settings (หนึ่งแถวต่อร้าน)
CREATE TABLE IF NOT EXISTS settings (
  id TINYINT UNSIGNED NOT NULL PRIMARY KEY DEFAULT 1,
  morning_order_cutoff TIME NOT NULL DEFAULT '08:00:00',
  morning_delivery_start TIME NOT NULL DEFAULT '09:00:00',
  morning_delivery_end TIME NOT NULL DEFAULT '10:00:00',
  afternoon_order_cutoff TIME NOT NULL DEFAULT '12:00:00',
  afternoon_delivery_start TIME NOT NULL DEFAULT '14:00:00',
  afternoon_delivery_end TIME NOT NULL DEFAULT '15:00:00',
  notice_popup_message TEXT NULL,
  is_notice_popup_enabled TINYINT(1) NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_settings_singleton CHECK (id = 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ค่าตั้งต้นสำหรับ settings ใช้ ON DUPLICATE KEY เพื่อให้ import ซ้ำได้อย่างปลอดภัย
INSERT INTO settings (id)
VALUES (1)
ON DUPLICATE KEY UPDATE id = VALUES(id);
