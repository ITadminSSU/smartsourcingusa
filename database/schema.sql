-- Smart Sourcing USA — database schema
-- Run this once in Hostinger hPanel -> Databases -> phpMyAdmin (SQL tab)
-- after creating your MySQL database.

-- Admin users who can log in to /admin
-- role: 'admin' = full access (numbers + team), 'editor' = numbers only
CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'editor',
  failed_attempts INT NOT NULL DEFAULT 0,
  locked_until DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- The Case Studies headline numbers (always a single row, id = 1)
CREATE TABLE IF NOT EXISTS case_study_stats (
  id TINYINT PRIMARY KEY DEFAULT 1,
  total_bids INT NOT NULL DEFAULT 0,
  exterior_bids INT NOT NULL DEFAULT 0,
  drywall_bids INT NOT NULL DEFAULT 0,
  exterior_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  drywall_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by VARCHAR(190) NULL,
  CONSTRAINT single_row CHECK (id = 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Audit trail: who did what and when
CREATE TABLE IF NOT EXISTS activity_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  actor_name VARCHAR(120) NULL,
  actor_email VARCHAR(190) NULL,
  action VARCHAR(60) NOT NULL,
  detail VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed the single stats row with the current totals (edit later from /admin)
INSERT INTO case_study_stats
  (id, total_bids, exterior_bids, drywall_bids, exterior_amount, drywall_amount)
VALUES
  (1, 155, 130, 86, 101118440.07, 54298102.04)
ON DUPLICATE KEY UPDATE id = id;

-- ===========================================================================
-- Staff Payroll Portal (/portal) — separate from /admin (admin_users) above.
-- role: employee | lead | accounting | hr_admin
-- ===========================================================================

CREATE TABLE IF NOT EXISTS portal_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(80) NOT NULL UNIQUE,
  first_name VARCHAR(80) NOT NULL,
  middle_name VARCHAR(80) NULL,
  last_name VARCHAR(80) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'employee',
  invoice_seq INT NOT NULL DEFAULT 0,
  must_change_password TINYINT(1) NOT NULL DEFAULT 1,
  failed_attempts INT NOT NULL DEFAULT 0,
  locked_until DATETIME NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS employee_profiles (
  user_id INT PRIMARY KEY,
  pay_type VARCHAR(10) NOT NULL DEFAULT 'hourly',
  hourly_rate DECIMAL(10,2) NULL,
  monthly_rate DECIMAL(10,2) NULL,
  overtime_rate DECIMAL(10,2) NULL,
  bank_name_enc TEXT NULL,
  bank_account_enc TEXT NULL,
  bank_set TINYINT(1) NOT NULL DEFAULT 0,
  lead_user_id INT NULL,
  default_trade VARCHAR(120) NULL,
  default_client VARCHAR(120) NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_profile_user FOREIGN KEY (user_id) REFERENCES portal_users(id) ON DELETE CASCADE,
  CONSTRAINT fk_profile_lead FOREIGN KEY (lead_user_id) REFERENCES portal_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS timesheets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  coverage_start DATE NOT NULL,
  coverage_end DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  total_hours DECIMAL(8,2) NOT NULL DEFAULT 0,
  notes VARCHAR(500) NULL,
  submitted_at TIMESTAMP NULL,
  reviewed_by INT NULL,
  reviewed_at TIMESTAMP NULL,
  review_notes VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_ts_user FOREIGN KEY (user_id) REFERENCES portal_users(id) ON DELETE CASCADE,
  CONSTRAINT fk_ts_reviewer FOREIGN KEY (reviewed_by) REFERENCES portal_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS timesheet_entries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  timesheet_id INT NOT NULL,
  work_date DATE NOT NULL,
  start_mst VARCHAR(10) NULL,
  end_mst VARCHAR(10) NULL,
  start_ph VARCHAR(10) NULL,
  end_ph VARCHAR(10) NULL,
  trade VARCHAR(120) NULL,
  client VARCHAR(120) NULL,
  hours DECIMAL(6,2) NOT NULL DEFAULT 0,
  activity TEXT NULL,
  CONSTRAINT fk_entry_ts FOREIGN KEY (timesheet_id) REFERENCES timesheets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS invoices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_no VARCHAR(40) NOT NULL UNIQUE,
  seq INT NOT NULL,
  user_id INT NOT NULL,
  timesheet_id INT NULL,
  type VARCHAR(10) NOT NULL,
  invoice_date DATE NOT NULL,
  coverage_start DATE NULL,
  coverage_end DATE NULL,
  pay_date DATE NULL,
  hourly_rate DECIMAL(10,2) NULL,
  monthly_rate DECIMAL(10,2) NULL,
  overtime_rate DECIMAL(10,2) NULL,
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  bank_fee DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_due DECIMAL(12,2) NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  bill_to VARCHAR(190) NOT NULL DEFAULT 'SmartSourcing USA, LLC',
  bank_name_snap VARCHAR(190) NULL,
  bank_account_snap VARCHAR(190) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_inv_user FOREIGN KEY (user_id) REFERENCES portal_users(id) ON DELETE CASCADE,
  CONSTRAINT uq_inv_user_seq UNIQUE (user_id, seq)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS invoice_lines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_id INT NOT NULL,
  trade VARCHAR(120) NULL,
  client VARCHAR(120) NULL,
  description VARCHAR(255) NULL,
  hours DECIMAL(8,2) NULL,
  rate DECIMAL(10,2) NULL,
  amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  line_type VARCHAR(12) NOT NULL DEFAULT 'regular',
  CONSTRAINT fk_line_inv FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Self-service "forgot password" tokens (covers both admin_users and portal_users).
-- user_type is 'admin' or 'portal'. Tokens are stored hashed and are single-use.
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
