-- ============================================================
-- CryptoTrace — Module 6: Wallet Clustering Engine
-- ============================================================

-- Clusters table — stores detected wallet clusters with risk scoring
CREATE TABLE IF NOT EXISTS clusters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
  risk_score INT NOT NULL DEFAULT 0
    CHECK (risk_score >= 0 AND risk_score <= 10),
  risk_level VARCHAR(20) NOT NULL DEFAULT 'LOW'
    CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
  heuristics_matched TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cluster-Wallet mapping — stores addresses detected in each cluster
CREATE TABLE IF NOT EXISTS cluster_wallets (
  id SERIAL PRIMARY KEY,
  cluster_id UUID NOT NULL REFERENCES clusters(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clusters_case_id ON clusters(case_id);
CREATE INDEX IF NOT EXISTS idx_cluster_wallets_cluster_id ON cluster_wallets(cluster_id);
CREATE INDEX IF NOT EXISTS idx_cluster_wallets_address ON cluster_wallets(wallet_address);
