CREATE TABLE IF NOT EXISTS customer_messages (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  recipient_user_id BIGINT UNSIGNED NOT NULL,
  sender_admin_id BIGINT UNSIGNED NULL,
  body TEXT NULL,
  image_path VARCHAR(255) NULL,
  sent_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  edited_at DATETIME NULL,
  KEY idx_customer_messages_inbox (recipient_user_id, sent_at),
  KEY idx_customer_messages_sender (sender_admin_id, sent_at),
  CONSTRAINT fk_customer_messages_recipient
    FOREIGN KEY (recipient_user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_customer_messages_sender
    FOREIGN KEY (sender_admin_id) REFERENCES users(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT chk_customer_messages_content CHECK (body IS NOT NULL OR image_path IS NOT NULL)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
