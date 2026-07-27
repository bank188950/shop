ALTER TABLE users
  DROP CHECK chk_users_phone,
  ADD CONSTRAINT chk_users_phone CHECK (phone REGEXP '^[0-9]{10}$');
