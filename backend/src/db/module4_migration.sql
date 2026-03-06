-- ============================================================
-- CryptoTrace — Module 4: Transaction Table Update
-- ============================================================

-- Drop the old table since we're changing the primary key type 
-- from UUID to SERIAL as per Module 4 spec.
DROP TABLE IF EXISTS transactions CASCADE;

CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  tx_hash TEXT UNIQUE NOT NULL,
  from_address TEXT,
  to_address TEXT,
  amount NUMERIC,
  timestamp TIMESTAMP,
  block_number BIGINT,
  wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE
);

CREATE INDEX idx_transactions_wallet_id ON transactions(wallet_id);
CREATE INDEX idx_transactions_tx_hash ON transactions(tx_hash);
