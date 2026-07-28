-- ระบบชำระเงินใช้การสแกน QR ไม่มีการแนบสลิป คอลัมน์นี้จึงไม่ถูกใช้งาน
ALTER TABLE order_payments
  DROP COLUMN slip_path;
