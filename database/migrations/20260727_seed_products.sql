-- ข้อมูลตัวอย่างสินค้าชุดแรก อ้างอิงจากเมนูที่แสดงบนหน้าร้านลูกค้า
-- รูปสินค้าถูกคัดลอกไปไว้ที่ backend/public/uploads/products/ แล้ว
-- รันซ้ำได้ เพราะกันซ้ำด้วยชื่อหน่วย ชื่อหมวด และชื่อสินค้า

-- บังคับ charset ของ connection เพราะ mysql client บางตัวต่อมาเป็น latin1 แล้วทำให้ข้อความไทยเพี้ยน
SET NAMES utf8mb4;

INSERT INTO product_units (name, is_active) VALUES
  ('ไม้', 1),
  ('แก้ว', 1),
  ('จาน', 1)
ON DUPLICATE KEY UPDATE is_active = VALUES(is_active);

INSERT INTO product_categories (name, tracks_piece_quantity, is_active) VALUES
  ('ลูกชิ้น', 1, 1),
  ('ไส้กรอก', 1, 1),
  ('เครื่องดื่ม', 0, 1),
  ('อาหารจานเดียว', 0, 1)
ON DUPLICATE KEY UPDATE tracks_piece_quantity = VALUES(tracks_piece_quantity), is_active = VALUES(is_active);

-- หมวดที่ติดตามจำนวนชิ้น: stock_quantity = FLOOR(stock_piece_count / pieces_per_sale)
INSERT INTO products (category_id, unit_id, name, description, image_path, sale_price, stock_quantity, stock_piece_count, pieces_per_sale, low_stock_threshold, is_recommended, is_active)
SELECT c.id, u.id, s.name, s.description, s.image_path, s.sale_price, s.stock_quantity, s.stock_piece_count, s.pieces_per_sale, s.low_stock_threshold, s.is_recommended, s.is_active
FROM (
  SELECT 'อาหารจานเดียว' AS category_name, 'จาน' AS unit_name, 'ข้าวผัดกุ้ง' AS name,
    'ข้าวผัดกุ้งหอมกระทะ ผัดไข่และผักรวม เสิร์ฟพร้อมแตงกวาและมะนาว สดใหม่ทุกจาน' AS description,
    'uploads/products/product-shrimp-fried-rice.png' AS image_path,
    45.00 AS sale_price, 12 AS stock_quantity, 0 AS stock_piece_count, 0 AS pieces_per_sale,
    5 AS low_stock_threshold, 1 AS is_recommended, 1 AS is_active
  UNION ALL SELECT 'ไส้กรอก', 'ไม้', 'ไส้กรอกอีสานย่าง',
    'ไส้กรอกอีสานสูตรโบราณ หมักข้าวจนได้ที่ รสเปรี้ยวกลมกล่อม ย่างเตาถ่านหอมกรุ่น เสิร์ฟพร้อมกะหล่ำ ขิงสด และพริกขี้หนู',
    'uploads/products/product-isan-sausage.png', 15.00, 25, 50, 2, 5, 0, 1
  UNION ALL SELECT 'ลูกชิ้น', 'ไม้', 'ลูกชิ้นเนื้อเอ็น',
    'ลูกชิ้นเนื้อวัวแท้ผสมเอ็นหนึบ เด้งเต็มคำ ต้มในน้ำซุปร้อน หอมเครื่องเทศ เสิร์ฟพร้อมน้ำจิ้มสูตรพิเศษ',
    'uploads/products/product-beef-tendon.png', 20.00, 16, 48, 3, 5, 0, 1
  UNION ALL SELECT 'เครื่องดื่ม', 'แก้ว', 'น้ำเก๊กฮวยเย็น',
    'น้ำเก๊กฮวยต้มสดใหม่ทุกวัน หวานน้อย ชื่นใจ ช่วยดับร้อน เสิร์ฟเย็นเจี๊ยบพร้อมน้ำแข็ง',
    'uploads/products/product-chrysanthemum.png', 25.00, 5, 0, 0, 5, 0, 1
  UNION ALL SELECT 'ลูกชิ้น', 'ไม้', 'ลูกชิ้นปลาระเบิด',
    'ลูกชิ้นปลาสอดไส้ กัดคำแรกระเบิดความอร่อยเต็มปาก เนื้อแน่นเด้ง ทอดกรอบนอกนุ่มใน',
    'uploads/products/product-fish-balls.png', 15.00, 0, 0, 3, 5, 0, 1
) AS s
INNER JOIN product_categories c ON c.name = s.category_name
INNER JOIN product_units u ON u.name = s.unit_name
WHERE NOT EXISTS (SELECT 1 FROM products p WHERE p.name = s.name);
