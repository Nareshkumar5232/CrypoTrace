-- ============================================================
-- CryptoTrace — Module 3: Wallet Intelligence Tables
-- ============================================================

-- Add blockchain_type column to wallets table (if missing)
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS blockchain_type VARCHAR(10) DEFAULT 'ETH';

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tx_hash VARCHAR(255) UNIQUE NOT NULL,
  from_address VARCHAR(255) NOT NULL,
  to_address VARCHAR(255) NOT NULL,
  amount NUMERIC(30, 18) NOT NULL DEFAULT 0,
  timestamp TIMESTAMP WITH TIME ZONE,
  block_number BIGINT,
  wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast wallet transaction lookups
CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id ON transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_tx_hash ON transactions(tx_hash);
