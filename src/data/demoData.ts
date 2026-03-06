// ─── Central Demo Data for CryptoTrace ─────────────────────────────────────────
// All pages pull from this file so the app works fully without a backend.

export const demoDashboard = {
  activeCases: 14,
  highRiskWallets: 37,
  openAlerts: 52,
  recentCases: [
    { id: "CASE-2026-001", title: "Darknet Market Laundering Ring", status: "In Progress", riskLevel: "Critical", officer: "J. Smith", created_at: new Date(Date.now() - 3600000).toISOString() },
    { id: "CASE-2026-002", title: "Cross-Chain Mixer Activity", status: "Open", riskLevel: "High", officer: "R. Kumar", created_at: new Date(Date.now() - 7200000).toISOString() },
    { id: "CASE-2026-003", title: "Exchange Withdrawal Anomaly", status: "Under Review", riskLevel: "Medium", officer: "A. Patel", created_at: new Date(Date.now() - 18000000).toISOString() },
    { id: "CASE-2026-004", title: "NFT Wash Trading Cluster", status: "Escalated", riskLevel: "High", officer: "S. Iyer", created_at: new Date(Date.now() - 43200000).toISOString() },
    { id: "CASE-2026-005", title: "Ransomware Payment Trace", status: "In Progress", riskLevel: "Critical", officer: "J. Smith", created_at: new Date(Date.now() - 86400000).toISOString() },
  ],
  recentAuditLogs: [
    { id: "LOG-9001", timestamp: new Date(Date.now() - 120000).toISOString(), user: "J. Smith", action: "Updated risk level for W-9A21E", entityType: "Wallet", entityId: "W-9A21E" },
    { id: "LOG-9002", timestamp: new Date(Date.now() - 300000).toISOString(), user: "R. Kumar", action: "Created new investigation CASE-2026-002", entityType: "Case", entityId: "CASE-2026-002" },
    { id: "LOG-9003", timestamp: new Date(Date.now() - 600000).toISOString(), user: "SYSTEM", action: "Auto-flagged high-risk transaction TX-4421", entityType: "Transaction", entityId: "TX-4421" },
    { id: "LOG-9004", timestamp: new Date(Date.now() - 900000).toISOString(), user: "A. Patel", action: "Resolved alert ALT-0032", entityType: "Alert", entityId: "ALT-0032" },
    { id: "LOG-9005", timestamp: new Date(Date.now() - 1800000).toISOString(), user: "S. Iyer", action: "Linked wallet W-7C44D to CASE-2026-004", entityType: "Wallet", entityId: "W-7C44D" },
  ],
};

export const demoWallets = [
  { id: "W-9A21E", address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", entity_type: "Individual", risk_score: 92, risk_level: "Critical", balance_usd: "245,812.50", created_at: "2025-11-10T08:14:00Z" },
  { id: "W-7C44D", address: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa", entity_type: "Exchange", risk_score: 78, risk_level: "High", balance_usd: "1,204,500.00", created_at: "2025-09-22T14:30:00Z" },
  { id: "W-8B39F", address: "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18", entity_type: "Smart Contract", risk_score: 65, risk_level: "High", balance_usd: "89,340.20", created_at: "2025-12-05T11:45:00Z" },
  { id: "W-3E81A", address: "3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5", entity_type: "Mining Pool", risk_score: 22, risk_level: "Low", balance_usd: "3,567,100.00", created_at: "2025-08-18T09:00:00Z" },
  { id: "W-5D72B", address: "bc1q9vza2e8x573nczrlzms0wvx3gsqjx7vavgkx0l", entity_type: "Individual", risk_score: 88, risk_level: "Critical", balance_usd: "156,200.75", created_at: "2026-01-02T16:22:00Z" },
  { id: "W-1F93C", address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", entity_type: "DeFi Protocol", risk_score: 45, risk_level: "Medium", balance_usd: "12,450,000.00", created_at: "2025-07-14T07:55:00Z" },
  { id: "W-6A24D", address: "bc1qm34lsc65zpw79lxes69zkqmk6ee3ewf0j77s3h", entity_type: "Mixer/Tumbler", risk_score: 96, risk_level: "Critical", balance_usd: "0.00", created_at: "2026-02-19T21:10:00Z" },
  { id: "W-2B67E", address: "1BoatSLRHtKNngkdXEeobR76b53LETtpyT", entity_type: "Exchange", risk_score: 31, risk_level: "Medium", balance_usd: "890,450.00", created_at: "2025-10-30T13:20:00Z" },
  { id: "W-4C58F", address: "0x28C6c06298d514Db089934071355E5743bf21d60", entity_type: "Custodial Wallet", risk_score: 12, risk_level: "Low", balance_usd: "45,670,000.00", created_at: "2025-06-01T05:00:00Z" },
  { id: "W-7D19G", address: "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq", entity_type: "Individual", risk_score: 55, risk_level: "High", balance_usd: "34,100.00", created_at: "2026-03-01T10:05:00Z" },
  { id: "W-8E20H", address: "3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy", entity_type: "P2P Trader", risk_score: 72, risk_level: "High", balance_usd: "67,800.25", created_at: "2026-01-15T19:40:00Z" },
  { id: "W-9F31I", address: "0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8", entity_type: "Exchange", risk_score: 8, risk_level: "Low", balance_usd: "98,120,000.00", created_at: "2025-05-20T03:15:00Z" },
];

export const demoTransactions = [
  { id: "TX-4421", tx_hash: "0xabc123...def456", date: "2026-03-02 14:22:01", timestamp: "2026-03-02T14:22:01Z", type: "Incoming", direction: "Incoming", source: "W-7C44D", destination: "W-9A21E", amount: "5.240", asset: "BTC", risk: "Critical", risk_level: "Critical", risk_flag: true, caseId: "CASE-2026-001", case_id: "CASE-2026-001" },
  { id: "TX-4420", tx_hash: "0xdef789...abc012", date: "2026-03-02 12:15:44", timestamp: "2026-03-02T12:15:44Z", type: "Outgoing", direction: "Outgoing", source: "W-9A21E", destination: "W-8B39F", amount: "1.200", asset: "BTC", risk: "Low", risk_level: "Low", risk_flag: false, caseId: "-", case_id: "-" },
  { id: "TX-4419", tx_hash: "0x123456...789abc", date: "2026-03-01 09:10:12", timestamp: "2026-03-01T09:10:12Z", type: "Incoming", direction: "Incoming", source: "W-6A24D", destination: "W-9A21E", amount: "10.000", asset: "BTC", risk: "High", risk_level: "High", risk_flag: true, caseId: "CASE-2026-001", case_id: "CASE-2026-001" },
  { id: "TX-4418", tx_hash: "0x456def...012ghi", date: "2026-02-28 22:45:33", timestamp: "2026-02-28T22:45:33Z", type: "Outgoing", direction: "Outgoing", source: "W-5D72B", destination: "W-6A24D", amount: "3.780", asset: "BTC", risk: "Critical", risk_level: "Critical", risk_flag: true, caseId: "CASE-2026-005", case_id: "CASE-2026-005" },
  { id: "TX-4417", tx_hash: "0x789ghi...345jkl", date: "2026-02-28 18:12:09", timestamp: "2026-02-28T18:12:09Z", type: "Incoming", direction: "Incoming", source: "W-3E81A", destination: "W-1F93C", amount: "150.500", asset: "ETH", risk: "Low", risk_level: "Low", risk_flag: false, caseId: "-", case_id: "-" },
  { id: "TX-4416", tx_hash: "0xabc012...def345", date: "2026-02-27 15:30:00", timestamp: "2026-02-27T15:30:00Z", type: "Outgoing", direction: "Outgoing", source: "W-1F93C", destination: "W-4C58F", amount: "75.000", asset: "ETH", risk: "Medium", risk_level: "Medium", risk_flag: false, caseId: "-", case_id: "-" },
  { id: "TX-4415", tx_hash: "0xdef345...ghi678", date: "2026-02-27 11:08:45", timestamp: "2026-02-27T11:08:45Z", type: "Incoming", direction: "Incoming", source: "W-8E20H", destination: "W-7D19G", amount: "0.450", asset: "BTC", risk: "High", risk_level: "High", risk_flag: true, caseId: "CASE-2026-004", case_id: "CASE-2026-004" },
  { id: "TX-4414", tx_hash: "0xghi678...jkl901", date: "2026-02-26 09:55:22", timestamp: "2026-02-26T09:55:22Z", type: "Outgoing", direction: "Outgoing", source: "W-7D19G", destination: "W-6A24D", amount: "0.440", asset: "BTC", risk: "Critical", risk_level: "Critical", risk_flag: true, caseId: "CASE-2026-004", case_id: "CASE-2026-004" },
  { id: "TX-4413", tx_hash: "0xjkl901...mno234", date: "2026-02-25 20:14:11", timestamp: "2026-02-25T20:14:11Z", type: "Incoming", direction: "Incoming", source: "W-9F31I", destination: "W-2B67E", amount: "25.000", asset: "ETH", risk: "Low", risk_level: "Low", risk_flag: false, caseId: "-", case_id: "-" },
  { id: "TX-4412", tx_hash: "0xmno234...pqr567", date: "2026-02-25 16:42:38", timestamp: "2026-02-25T16:42:38Z", type: "Outgoing", direction: "Outgoing", source: "W-2B67E", destination: "W-8E20H", amount: "12.300", asset: "ETH", risk: "Medium", risk_level: "Medium", risk_flag: false, caseId: "-", case_id: "-" },
  { id: "TX-4411", tx_hash: "0xpqr567...stu890", date: "2026-02-24 13:22:55", timestamp: "2026-02-24T13:22:55Z", type: "Incoming", direction: "Incoming", source: "W-6A24D", destination: "W-5D72B", amount: "8.920", asset: "BTC", risk: "Critical", risk_level: "Critical", risk_flag: true, caseId: "CASE-2026-005", case_id: "CASE-2026-005" },
  { id: "TX-4410", tx_hash: "0xstu890...vwx123", date: "2026-02-24 08:05:19", timestamp: "2026-02-24T08:05:19Z", type: "Outgoing", direction: "Outgoing", source: "W-4C58F", destination: "W-9F31I", amount: "500.000", asset: "ETH", risk: "Low", risk_level: "Low", risk_flag: false, caseId: "-", case_id: "-" },
  { id: "TX-4409", tx_hash: "0xvwx123...yza456", date: "2026-02-23 19:38:44", timestamp: "2026-02-23T19:38:44Z", type: "Incoming", direction: "Incoming", source: "W-7C44D", destination: "W-8B39F", amount: "2.100", asset: "BTC", risk: "High", risk_level: "High", risk_flag: true, caseId: "CASE-2026-002", case_id: "CASE-2026-002" },
  { id: "TX-4408", tx_hash: "0xyza456...bcd789", date: "2026-02-23 14:11:27", timestamp: "2026-02-23T14:11:27Z", type: "Outgoing", direction: "Outgoing", source: "W-8B39F", destination: "W-6A24D", amount: "2.095", asset: "BTC", risk: "Critical", risk_level: "Critical", risk_flag: true, caseId: "CASE-2026-002", case_id: "CASE-2026-002" },
  { id: "TX-4407", tx_hash: "0xbcd789...efg012", date: "2026-02-22 10:50:03", timestamp: "2026-02-22T10:50:03Z", type: "Incoming", direction: "Incoming", source: "W-3E81A", destination: "W-7C44D", amount: "45.000", asset: "ETH", risk: "Low", risk_level: "Low", risk_flag: false, caseId: "-", case_id: "-" },
  { id: "TX-4406", tx_hash: "0xefg012...hij345", date: "2026-02-21 07:25:16", timestamp: "2026-02-21T07:25:16Z", type: "Outgoing", direction: "Outgoing", source: "W-5D72B", destination: "W-7D19G", amount: "1.560", asset: "BTC", risk: "High", risk_level: "High", risk_flag: true, caseId: "CASE-2026-005", case_id: "CASE-2026-005" },
  { id: "TX-4405", tx_hash: "0xhij345...klm678", date: "2026-02-20 23:14:52", timestamp: "2026-02-20T23:14:52Z", type: "Incoming", direction: "Incoming", source: "W-8E20H", destination: "W-2B67E", amount: "0.880", asset: "BTC", risk: "Medium", risk_level: "Medium", risk_flag: false, caseId: "-", case_id: "-" },
  { id: "TX-4404", tx_hash: "0xklm678...nop901", date: "2026-02-20 17:40:08", timestamp: "2026-02-20T17:40:08Z", type: "Outgoing", direction: "Outgoing", source: "W-9A21E", destination: "W-6A24D", amount: "4.200", asset: "BTC", risk: "Critical", risk_level: "Critical", risk_flag: true, caseId: "CASE-2026-001", case_id: "CASE-2026-001" },
  { id: "TX-4403", tx_hash: "0xnop901...qrs234", date: "2026-02-19 12:33:41", timestamp: "2026-02-19T12:33:41Z", type: "Incoming", direction: "Incoming", source: "W-1F93C", destination: "W-3E81A", amount: "200.000", asset: "ETH", risk: "Low", risk_level: "Low", risk_flag: false, caseId: "-", case_id: "-" },
  { id: "TX-4402", tx_hash: "0xqrs234...tuv567", date: "2026-02-18 06:18:29", timestamp: "2026-02-18T06:18:29Z", type: "Outgoing", direction: "Outgoing", source: "W-7C44D", destination: "W-5D72B", amount: "7.650", asset: "BTC", risk: "High", risk_level: "High", risk_flag: true, caseId: "CASE-2026-002", case_id: "CASE-2026-002" },
];

export const demoClusters = [
  { id: "CLU-001", risk_level: "Critical", total_volume: "1,245.78 BTC", wallet_count: 12, last_active: "2026-03-02 14:22:01" },
  { id: "CLU-002", risk_level: "High", total_volume: "567.32 BTC", wallet_count: 8, last_active: "2026-03-01 09:10:12" },
  { id: "CLU-003", risk_level: "Medium", total_volume: "234.10 ETH", wallet_count: 5, last_active: "2026-02-28 18:12:09" },
  { id: "CLU-004", risk_level: "Critical", total_volume: "890.44 BTC", wallet_count: 15, last_active: "2026-02-27 22:05:33" },
  { id: "CLU-005", risk_level: "Low", total_volume: "45.20 ETH", wallet_count: 3, last_active: "2026-02-25 11:30:00" },
  { id: "CLU-006", risk_level: "High", total_volume: "312.88 BTC", wallet_count: 7, last_active: "2026-02-24 15:42:18" },
];

export const demoAlerts = [
  { id: "ALT-0044", severity: "Critical", description: "Mixer/tumbler activity detected from W-6A24D — 4.2 BTC routed through 3 intermediary wallets within 90 minutes.", walletId: "W-6A24D", wallet_id: "W-6A24D", caseId: "CASE-2026-001", case_id: "CASE-2026-001", timestamp: "2026-03-02 15:01:00", created_at: "2026-03-02T15:01:00Z", status: "Active" },
  { id: "ALT-0043", severity: "High", description: "Unusual outbound volume spike from W-5D72B — 3.78 BTC transferred in a single transaction to a known high-risk address.", walletId: "W-5D72B", wallet_id: "W-5D72B", caseId: "CASE-2026-005", case_id: "CASE-2026-005", timestamp: "2026-03-02 12:30:00", created_at: "2026-03-02T12:30:00Z", status: "In Review" },
  { id: "ALT-0042", severity: "High", description: "Cross-chain bridge transaction flagged — W-8B39F moved 2.095 BTC to mixer address immediately after receiving funds.", walletId: "W-8B39F", wallet_id: "W-8B39F", caseId: "CASE-2026-002", case_id: "CASE-2026-002", timestamp: "2026-03-01 14:15:00", created_at: "2026-03-01T14:15:00Z", status: "Active" },
  { id: "ALT-0041", severity: "Medium", description: "Repeated small-value transfers detected from W-8E20H to W-7D19G — possible structuring to avoid detection thresholds.", walletId: "W-8E20H", wallet_id: "W-8E20H", caseId: "CASE-2026-004", case_id: "CASE-2026-004", timestamp: "2026-02-28 09:45:00", created_at: "2026-02-28T09:45:00Z", status: "Active" },
  { id: "ALT-0040", severity: "Critical", description: "Ransomware-linked wallet W-5D72B received 8.92 BTC from known bad actor cluster CLU-004.", walletId: "W-5D72B", wallet_id: "W-5D72B", caseId: "CASE-2026-005", case_id: "CASE-2026-005", timestamp: "2026-02-27 20:10:00", created_at: "2026-02-27T20:10:00Z", status: "In Review" },
  { id: "ALT-0039", severity: "Low", description: "Dormant wallet W-4C58F reactivated after 180 days — 500 ETH outbound transfer to exchange.", walletId: "W-4C58F", wallet_id: "W-4C58F", caseId: null, case_id: null, timestamp: "2026-02-26 08:20:00", created_at: "2026-02-26T08:20:00Z", status: "Active" },
  { id: "ALT-0038", severity: "High", description: "NFT wash trading pattern detected — W-7D19G and W-8E20H exchanged same NFT collection 7 times in 48 hours.", walletId: "W-7D19G", wallet_id: "W-7D19G", caseId: "CASE-2026-004", case_id: "CASE-2026-004", timestamp: "2026-02-25 17:55:00", created_at: "2026-02-25T17:55:00Z", status: "Active" },
  { id: "ALT-0037", severity: "Medium", description: "KYC mismatch alert — W-2B67E entity profile updated but transaction patterns inconsistent with declared type.", walletId: "W-2B67E", wallet_id: "W-2B67E", caseId: null, case_id: null, timestamp: "2026-02-24 11:30:00", created_at: "2026-02-24T11:30:00Z", status: "In Review" },
  { id: "ALT-0036", severity: "Critical", description: "OFAC-sanctioned address interaction — W-9A21E sent 4.2 BTC to W-6A24D which is flagged in sanctions list.", walletId: "W-9A21E", wallet_id: "W-9A21E", caseId: "CASE-2026-001", case_id: "CASE-2026-001", timestamp: "2026-02-23 22:00:00", created_at: "2026-02-23T22:00:00Z", status: "Active" },
  { id: "ALT-0032", severity: "Medium", description: "Velocity alert — W-7C44D exceeded 20 transactions in 1-hour window.", walletId: "W-7C44D", wallet_id: "W-7C44D", caseId: "CASE-2026-002", case_id: "CASE-2026-002", timestamp: "2026-02-22 15:40:00", created_at: "2026-02-22T15:40:00Z", status: "Resolved", resolved_at: "2026-02-23T10:00:00Z" },
];

export const demoCases = [
  { id: "CASE-2026-001", title: "Darknet Market Laundering Ring", status: "In Progress", riskLevel: "Critical", risk_level: "Critical", officer: "J. Smith", created_at: "2026-01-15T10:30:00Z", updated_at: "2026-03-02T14:22:01Z", wallets: ["W-9A21E", "W-6A24D"], alerts: ["ALT-0044", "ALT-0036"], notes: [{ content: "Primary suspect wallet identified. Tracing 3-hop connections.", created_at: "2026-02-01T08:00:00Z" }] },
  { id: "CASE-2026-002", title: "Cross-Chain Mixer Activity", status: "Open", riskLevel: "High", risk_level: "High", officer: "R. Kumar", created_at: "2026-02-10T14:00:00Z", updated_at: "2026-03-01T09:10:12Z", wallets: ["W-7C44D", "W-8B39F"], alerts: ["ALT-0042", "ALT-0032"], notes: [] },
  { id: "CASE-2026-003", title: "Exchange Withdrawal Anomaly", status: "Under Review", riskLevel: "Medium", risk_level: "Medium", officer: "A. Patel", created_at: "2026-02-20T09:15:00Z", updated_at: "2026-02-28T18:12:09Z", wallets: ["W-1F93C"], alerts: [], notes: [{ content: "Awaiting exchange compliance response.", created_at: "2026-02-25T12:00:00Z" }] },
  { id: "CASE-2026-004", title: "NFT Wash Trading Cluster", status: "Escalated", riskLevel: "High", risk_level: "High", officer: "S. Iyer", created_at: "2026-02-22T11:00:00Z", updated_at: "2026-02-27T22:05:33Z", wallets: ["W-7D19G", "W-8E20H"], alerts: ["ALT-0041", "ALT-0038"], notes: [{ content: "Cluster CLU-006 linked. Escalated to senior analyst.", created_at: "2026-02-26T16:30:00Z" }] },
  { id: "CASE-2026-005", title: "Ransomware Payment Trace", status: "In Progress", riskLevel: "Critical", risk_level: "Critical", officer: "J. Smith", created_at: "2026-02-24T08:45:00Z", updated_at: "2026-02-28T22:45:33Z", wallets: ["W-5D72B"], alerts: ["ALT-0043", "ALT-0040"], notes: [{ content: "Confirmed ransomware variant: LockBit 4.0. Payment traced to mixer.", created_at: "2026-02-25T09:00:00Z" }] },
  { id: "CASE-2026-006", title: "Ponzi Scheme Fund Recovery", status: "Closed", riskLevel: "High", risk_level: "High", officer: "R. Kumar", created_at: "2025-12-01T07:30:00Z", updated_at: "2026-02-15T16:00:00Z", wallets: ["W-2B67E"], alerts: [], notes: [{ content: "Funds frozen. Case transferred to legal.", created_at: "2026-02-15T16:00:00Z" }] },
  { id: "CASE-2026-007", title: "Unregistered MSB Investigation", status: "Open", riskLevel: "Medium", risk_level: "Medium", officer: "A. Patel", created_at: "2026-03-01T13:20:00Z", updated_at: "2026-03-01T13:20:00Z", wallets: ["W-9F31I"], alerts: [], notes: [] },
];

export const demoAuditLogs = [
  { id: "LOG-9001", timestamp: "2026-03-02 15:05:22", user: "J. Smith", action: "Updated risk score for W-9A21E from 85 to 92", entityType: "Wallet", entity_type: "Wallet", entityId: "W-9A21E", entity_id: "W-9A21E", ipAddress: "10.0.1.42", ip_address: "10.0.1.42" },
  { id: "LOG-9002", timestamp: "2026-03-02 14:30:11", user: "R. Kumar", action: "Created investigation CASE-2026-002", entityType: "Case", entity_type: "Case", entityId: "CASE-2026-002", entity_id: "CASE-2026-002", ipAddress: "10.0.1.55", ip_address: "10.0.1.55" },
  { id: "LOG-9003", timestamp: "2026-03-02 14:22:01", user: "SYSTEM", action: "Auto-flagged transaction TX-4421 as Critical risk", entityType: "Transaction", entity_type: "Transaction", entityId: "TX-4421", entity_id: "TX-4421", ipAddress: "10.0.0.1", ip_address: "10.0.0.1" },
  { id: "LOG-9004", timestamp: "2026-03-02 12:30:00", user: "SYSTEM", action: "Generated alert ALT-0043 for anomalous outbound volume", entityType: "Alert", entity_type: "Alert", entityId: "ALT-0043", entity_id: "ALT-0043", ipAddress: "10.0.0.1", ip_address: "10.0.0.1" },
  { id: "LOG-9005", timestamp: "2026-03-02 10:15:44", user: "A. Patel", action: "Resolved alert ALT-0032", entityType: "Alert", entity_type: "Alert", entityId: "ALT-0032", entity_id: "ALT-0032", ipAddress: "10.0.1.78", ip_address: "10.0.1.78" },
  { id: "LOG-9006", timestamp: "2026-03-01 14:15:00", user: "SYSTEM", action: "Generated alert ALT-0042 for cross-chain bridge flag", entityType: "Alert", entity_type: "Alert", entityId: "ALT-0042", entity_id: "ALT-0042", ipAddress: "10.0.0.1", ip_address: "10.0.0.1" },
  { id: "LOG-9007", timestamp: "2026-03-01 09:10:12", user: "J. Smith", action: "Linked wallet W-6A24D to CASE-2026-001", entityType: "Wallet", entity_type: "Wallet", entityId: "W-6A24D", entity_id: "W-6A24D", ipAddress: "10.0.1.42", ip_address: "10.0.1.42" },
  { id: "LOG-9008", timestamp: "2026-02-28 22:45:33", user: "SYSTEM", action: "Risk level updated for CLU-004 from High to Critical", entityType: "Cluster", entity_type: "Cluster", entityId: "CLU-004", entity_id: "CLU-004", ipAddress: "10.0.0.1", ip_address: "10.0.0.1" },
  { id: "LOG-9009", timestamp: "2026-02-28 09:45:00", user: "SYSTEM", action: "Generated alert ALT-0041 for structuring detection", entityType: "Alert", entity_type: "Alert", entityId: "ALT-0041", entity_id: "ALT-0041", ipAddress: "10.0.0.1", ip_address: "10.0.0.1" },
  { id: "LOG-9010", timestamp: "2026-02-27 16:30:00", user: "S. Iyer", action: "Escalated CASE-2026-004 to senior analyst", entityType: "Case", entity_type: "Case", entityId: "CASE-2026-004", entity_id: "CASE-2026-004", ipAddress: "10.0.1.91", ip_address: "10.0.1.91" },
  { id: "LOG-9011", timestamp: "2026-02-26 08:20:00", user: "SYSTEM", action: "Generated alert ALT-0039 for dormant wallet reactivation", entityType: "Alert", entity_type: "Alert", entityId: "ALT-0039", entity_id: "ALT-0039", ipAddress: "10.0.0.1", ip_address: "10.0.0.1" },
  { id: "LOG-9012", timestamp: "2026-02-25 12:00:00", user: "A. Patel", action: "Added note to CASE-2026-003", entityType: "Case", entity_type: "Case", entityId: "CASE-2026-003", entity_id: "CASE-2026-003", ipAddress: "10.0.1.78", ip_address: "10.0.1.78" },
  { id: "LOG-9013", timestamp: "2026-02-24 15:42:18", user: "R. Kumar", action: "Updated cluster CLU-006 risk level to High", entityType: "Cluster", entity_type: "Cluster", entityId: "CLU-006", entity_id: "CLU-006", ipAddress: "10.0.1.55", ip_address: "10.0.1.55" },
  { id: "LOG-9014", timestamp: "2026-02-23 10:00:00", user: "J. Smith", action: "Logged in from authorized terminal", entityType: "Session", entity_type: "Session", entityId: "SES-44201", entity_id: "SES-44201", ipAddress: "10.0.1.42", ip_address: "10.0.1.42" },
  { id: "LOG-9015", timestamp: "2026-02-22 15:40:00", user: "SYSTEM", action: "Generated alert ALT-0032 for velocity threshold breach", entityType: "Alert", entity_type: "Alert", entityId: "ALT-0032", entity_id: "ALT-0032", ipAddress: "10.0.0.1", ip_address: "10.0.0.1" },
];

export const demoUsers = [
  { id: "EMP-001", employee_id: "EMP-001", name: "J. Smith", department: "Intelligence", role: "Administrator", status: "Active" },
  { id: "EMP-002", employee_id: "EMP-002", name: "R. Kumar", department: "Investigations", role: "Senior Analyst", status: "Active" },
  { id: "EMP-003", employee_id: "EMP-003", name: "A. Patel", department: "Compliance", role: "Analyst", status: "Active" },
  { id: "EMP-004", employee_id: "EMP-004", name: "S. Iyer", department: "Intelligence", role: "Senior Analyst", status: "Active" },
  { id: "EMP-005", employee_id: "EMP-005", name: "M. Devi", department: "Forensics", role: "Analyst", status: "Active" },
  { id: "EMP-006", employee_id: "EMP-006", name: "K. Rajan", department: "Legal", role: "Read-Only", status: "Active" },
  { id: "EMP-007", employee_id: "EMP-007", name: "P. Nair", department: "Intelligence", role: "Analyst", status: "Inactive" },
  { id: "EMP-008", employee_id: "EMP-008", name: "V. Krishnan", department: "IT Security", role: "Administrator", status: "Active" },
];

export const demoRoles = [
  { id: "ROLE-001", name: "Administrator", description: "Full system access including configuration and user management", userCount: 2 },
  { id: "ROLE-002", name: "Senior Analyst", description: "Investigation management, case escalation, and report generation", userCount: 2 },
  { id: "ROLE-003", name: "Analyst", description: "Case handling, wallet analysis, and transaction monitoring", userCount: 3 },
  { id: "ROLE-004", name: "Read-Only", description: "View-only access to dashboards and reports", userCount: 1 },
];
