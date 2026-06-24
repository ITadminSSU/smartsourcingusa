-- Adds the login `username` to portal_users (staff portal).
-- Run once on an existing database that already has the portal tables.
-- NOTE: if portal_users already has rows, give each one a username BEFORE
-- adding the NOT NULL UNIQUE constraint (see the backfill example below).

-- Fresh databases (no portal users yet) can simply run:
ALTER TABLE portal_users
  ADD COLUMN username VARCHAR(80) NOT NULL UNIQUE AFTER id;

-- If you already have portal users, instead do it in steps:
--   ALTER TABLE portal_users ADD COLUMN username VARCHAR(80) NULL AFTER id;
--   UPDATE portal_users SET username = SUBSTRING_INDEX(email, '@', 1) WHERE username IS NULL;
--   ALTER TABLE portal_users MODIFY COLUMN username VARCHAR(80) NOT NULL;
--   ALTER TABLE portal_users ADD UNIQUE KEY uq_portal_username (username);
