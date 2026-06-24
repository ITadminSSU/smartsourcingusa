-- Smart Sourcing USA — Staff Payroll Portal tables
-- Run this once in phpMyAdmin (SQL tab) on your existing database.
-- These tables are completely separate from the /admin (admin_users) tables.

-- Portal accounts (separate from admin_users). role: employee | lead | accounting | hr_admin
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
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Per-employee payroll profile (rates, encrypted bank info, assigned team lead)
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

-- Timesheets (one per free-form coverage window per employee)
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

-- Daily timesheet rows
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

-- Invoices auto-generated from approved timesheets
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

-- Invoice line items (regular / overtime / extra)
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
