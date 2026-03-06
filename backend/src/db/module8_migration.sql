-- ============================================================
-- CryptoTrace — Module 8: Risk Scoring Engine
-- ============================================================

-- Update the clusters risk_level constraint to include CRITICAL
ALTER TABLE clusters DROP CONSTRAINT IF EXISTS clusters_risk_level_check;
ALTER TABLE clusters ADD CONSTRAINT clusters_risk_level_check
  CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'));
