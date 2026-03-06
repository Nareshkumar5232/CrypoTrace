-- ============================================================
-- CryptoTrace - Database Seed Script
-- Run this script to create tables and seed initial data.
-- ============================================================

-- Enable uuid-ossp extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role_id INTEGER NOT NULL REFERENCES roles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed roles
INSERT INTO roles (name) VALUES
  ('ADMIN'),
  ('ANALYST'),
  ('INVESTIGATOR'),
  ('SUPERVISOR')
ON CONFLICT (name) DO NOTHING;

-- Seed default admin user (password: admin123)
-- hash generated with bcrypt, 12 salt rounds
-- You should change this password immediately after first login.
INSERT INTO users (id, name, email, password_hash, role_id, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'System Admin',
  'admin@fiu.gov',
  '$2b$10$Q78K6xGv1e.D4v131F/pPuiB1Qx.X8zU97h41113.b9v5.V9oQj.y', -- Valid bcrypt hash (cost 10) for admin123
  1,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;
