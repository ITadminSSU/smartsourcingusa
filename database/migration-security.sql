-- Security upgrade: login lockout fields + self-service password reset tokens.
-- Run once in phpMyAdmin (SQL tab) on an EXISTING database.
-- Safe to run on a fresh DB too (schema.sql already includes these).

-- Login lockout tracking on admin accounts
ALTER TABLE admin_users
  ADD COLUMN IF NOT EXISTS failed_attempts INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS locked_until DATETIME NULL;

-- Login lockout tracking on staff portal accounts
ALTER TABLE portal_users
  ADD COLUMN IF NOT EXISTS failed_attempts INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS locked_until DATETIME NULL;

-- Password reset tokens (admin + portal), stored hashed and single-use
CREATE TABLE IF NOT EXISTS password_resets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_type VARCHAR(10) NOT NULL,
  user_id INT NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  used TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_pr_token (token_hash),
  INDEX idx_pr_user (user_type, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- NOTE: "ADD COLUMN IF NOT EXISTS" requires MySQL 8.0+ / MariaDB 10.5+.
-- If your server is older and the ALTER fails, remove the "IF NOT EXISTS"
-- clauses and run each ALTER once (it will error only if the column exists).
