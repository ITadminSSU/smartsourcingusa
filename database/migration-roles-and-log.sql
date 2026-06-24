-- Run this ONLY if you already created the tables before roles + activity log existed.
-- Safe to skip if you ran the latest database/schema.sql on a fresh database.

-- Add the role column to existing users (defaults everyone to 'editor')
ALTER TABLE admin_users
  ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'editor';

-- Promote your first/main account to admin (change the email below)
-- UPDATE admin_users SET role = 'admin' WHERE email = 'you@smartsourcingusa.com';

-- Create the activity log table
CREATE TABLE IF NOT EXISTS activity_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  actor_name VARCHAR(120) NULL,
  actor_email VARCHAR(190) NULL,
  action VARCHAR(60) NOT NULL,
  detail VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
