ALTER TABLE `admin`
  ADD COLUMN password_hash VARCHAR(255) NULL AFTER username,
  ADD COLUMN role ENUM('super_admin') NOT NULL DEFAULT 'super_admin' AFTER avatar_filename,
  ADD COLUMN last_login_at DATETIME NULL AFTER role;
