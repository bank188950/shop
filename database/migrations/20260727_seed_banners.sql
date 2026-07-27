-- ข้อมูลตัวอย่างแบนเนอร์ อ้างอิงจากภาพ hero ที่หมุนอยู่บนหน้าร้านลูกค้า
-- รูปแบนเนอร์ถูกคัดลอกไปไว้ที่ backend/public/uploads/banners/ แล้ว
-- รันซ้ำได้ เพราะกันซ้ำด้วยชื่อแบนเนอร์

-- บังคับ charset ของ connection เพราะ mysql client บางตัวต่อมาเป็น latin1 แล้วทำให้ข้อความไทยเพี้ยน
SET NAMES utf8mb4;

INSERT INTO banners (title, image_path, display_order, is_active)
SELECT s.title, s.image_path, s.display_order, s.is_active
FROM (
  SELECT 'เมนูอร่อยพร้อมเสิร์ฟทุกวัน' AS title,
    'uploads/banners/hero-truck-clean-grille.png' AS image_path,
    1 AS display_order, 1 AS is_active
  UNION ALL SELECT 'ของทอดและเครื่องดื่มสดชื่น',
    'uploads/banners/hero-fried-snacks-drinks.png', 2, 1
) AS s
WHERE NOT EXISTS (SELECT 1 FROM banners b WHERE b.title = s.title);
