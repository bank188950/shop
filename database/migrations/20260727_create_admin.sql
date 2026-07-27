CREATE TABLE IF NOT EXISTS `admin` (
  id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NULL,
  display_name VARCHAR(150) NOT NULL,
  avatar_filename VARCHAR(255) NULL,
  role ENUM('super_admin') NOT NULL DEFAULT 'super_admin',
  last_login_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_admin_singleton CHECK (id = 1),
  UNIQUE KEY uq_admin_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `admin` (id, username, display_name, role)
VALUES (1, 'admin_user', 'Admin Profile', 'super_admin')
ON DUPLICATE KEY UPDATE id = id;
