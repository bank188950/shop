-- ให้แอดมินจัดลำดับหมวดสินค้าได้เหมือนแบนเนอร์ ลำดับนี้ใช้ทั้งหน้าแอดมินและแถบหมวดหน้าร้าน

ALTER TABLE product_categories
  ADD COLUMN display_order SMALLINT UNSIGNED NOT NULL DEFAULT 0 AFTER name;

-- ไล่ลำดับให้ข้อมูลเดิมตามที่เคยแสดงอยู่ (เรียงตาม id) ไม่ให้ทุกแถวเป็น 0 เหมือนกันหมด
SET @row_position = 0;
UPDATE product_categories
SET display_order = (@row_position := @row_position + 1)
ORDER BY id;

ALTER TABLE product_categories
  ADD KEY idx_product_categories_display_order (display_order);
