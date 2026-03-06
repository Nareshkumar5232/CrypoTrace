/* ─── Mock Investigation Data Service ─── 
   Simulates backend APIs for crypto fund tracing.
   Replace with real API calls when backend is connected. */

export interface TracedTransaction {
  id: string;
  txHash: string;
  timestamp: string;
  sender: string;
  receiver: string;
  amount: number;
  asset: string;
  direction: "incoming" | "outgoing";
  hop: number;
  riskLevel: "Low" | "Medium" | "High";
}

export interface GraphNode {
  id: string;
  label: string;
  type: "suspect" | "exchange" | "mixer" | "wallet" | "unknown";
  riskScore: number;
  riskLevel: "Low" | "Medium" | "High";
  balance: string;
  firstSeen: string;
  transactionCount: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  amount: number;
  asset: string;
  timestamp: string;
  txHash: string;
}

export interface WalletInteraction {
  address: string;
  transactionCount: number;
  totalVolume: number;
  interactionType: "Sender" | "Receiver" | "Both";
  riskLevel: "Low" | "Medium" | "High";
  lastInteraction: string;
}

export interface WalletCluster {
  clusterId: string;
  walletCount: number;
  totalTransactions: number;
  riskLevel: "Low" | "Medium" | "High";
  totalVolume: number;
  memberWallets: { address: string; role: string; riskScore: number }[];
}

export interface SuspiciousPattern {
  id: string;
  patternType: "Fan-Out" | "Fan-In" | "Rapid Multi-Hop" | "Round-Trip" | "Layering";
  affectedWallets: string[];
  severity: "Low" | "Medium" | "High";
  description: string;
  detectedAt: string;
}

export interface InvestigationWorkflowStep {
  step: number;
  label: string;
  status: "Completed" | "In Progress" | "Pending";
  timestamp?: string;
}

export interface InvestigationResult {
  walletAddress: string;
  riskScore: number;
  riskLevel: "Low" | "Medium" | "High";
  transactions: TracedTransaction[];
  graphNodes: GraphNode[];
  graphEdges: GraphEdge[];
  interactions: WalletInteraction[];
  clusters: WalletCluster[];
  patterns: SuspiciousPattern[];
  workflow: InvestigationWorkflowStep[];
  summary: {
    totalTransactions: number;
    totalVolume: number;
    uniqueWallets: number;
    maxHopDepth: number;
    highRiskConnections: number;
    flaggedPatterns: number;
  };
}

const WALLETS = [
  "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18",
  "0x1aE0EA34a72D944a8C7603FfB3eC30a6669E454C",
  "0x53d284357ec70cE289D6D64134DfAc8E511c8a3D",
  "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B",
  "0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8",
  "0xCA8Fa8f0b631EcdB18Cda619C4Fc9d197c8aFfCa",
  "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  "0x28C6c06298d514Db089934071355E5743bf21d60",
  "0x21a31Ee1afC51d94C2eFcCAa2092aD1028285549",
  "0xDFd5293D8e347dFe59E90eFd55b2956a1343963d",
  "bc1q9kdpc5nnfkm8yp7f7q0mcnf2r5ymmetmy92wdv",
  "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
];

function randomWallet(exclude?: string): string {
  const filtered = WALLETS.filter((w) => w !== exclude);
  return filtered[Math.floor(Math.random() * filtered.length)];
}

function generateTransactions(suspectAddr: string): TracedTransaction[] {
  const txs: TracedTransaction[] = [];
  const now = Date.now();
  let id = 1;

  // Hop 1 – direct incoming
  for (let i = 0; i < 4; i++) {
    txs.push({
      id: `TX-${String(id++).padStart(4, "0")}`,
      txHash: `0x${Math.random().toString(16).slice(2, 66)}`,
      timestamp: new Date(now - (8 - i) * 3600000).toISOString(),
      sender: randomWallet(suspectAddr),
      receiver: suspectAddr,
      amount: +(Math.random() * 15 + 0.5).toFixed(4),
      asset: "ETH",
      direction: "incoming",
      hop: 1,
      riskLevel: i === 0 ? "High" : i < 2 ? "Medium" : "Low",
    });
  }

  // Hop 1 – direct outgoing
  for (let i = 0; i < 3; i++) {
    txs.push({
      id: `TX-${String(id++).padStart(4, "0")}`,
      txHash: `0x${Math.random().toString(16).slice(2, 66)}`,
      timestamp: new Date(now - (6 - i) * 3600000).toISOString(),
      sender: suspectAddr,
      receiver: randomWallet(suspectAddr),
      amount: +(Math.random() * 10 + 0.2).toFixed(4),
      asset: "ETH",
      direction: "outgoing",
      hop: 1,
      riskLevel: i === 0 ? "High" : "Medium",
    });
  }

  // Hop 2
  const hop1Receivers = txs.filter((t) => t.direction === "outgoing").map((t) => t.receiver);
  for (const recv of hop1Receivers) {
    for (let i = 0; i < 2; i++) {
      txs.push({
        id: `TX-${String(id++).padStart(4, "0")}`,
        txHash: `0x${Math.random().toString(16).slice(2, 66)}`,
        timestamp: new Date(now - (4 - i) * 3600000).toISOString(),
        sender: recv,
        receiver: randomWallet(recv),
        amount: +(Math.random() * 5 + 0.1).toFixed(4),
        asset: "ETH",
        direction: "outgoing",
        hop: 2,
        riskLevel: Math.random() > 0.6 ? "High" : "Medium",
      });
    }
  }

  // Hop 3
  const hop2Receivers = txs.filter((t) => t.hop === 2).map((t) => t.receiver);
  for (const recv of hop2Receivers.slice(0, 3)) {
    txs.push({
      id: `TX-${String(id++).padStart(4, "0")}`,
      txHash: `0x${Math.random().toString(16).slice(2, 66)}`,
      timestamp: new Date(now - (2 - Math.random()) * 3600000).toISOString(),
      sender: recv,
      receiver: randomWallet(recv),
      amount: +(Math.random() * 3 + 0.05).toFixed(4),
      asset: "ETH",
      direction: "outgoing",
      hop: 3,
      riskLevel: Math.random() > 0.5 ? "High" : "Low",
    });
  }

  return txs;
}

function buildGraph(suspectAddr: string, txs: TracedTransaction[]): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodeMap = new Map<string, GraphNode>();

  const addNode = (addr: string, isSuspect: boolean) => {
    if (nodeMap.has(addr)) return;
    const riskScore = isSuspect ? 92 : Math.floor(Math.random() * 80 + 10);
    nodeMap.set(addr, {
      id: addr,
      label: addr.slice(0, 8) + "..." + addr.slice(-4),
      type: isSuspect ? "suspect" : addr.includes("bc1") ? "exchange" : Math.random() > 0.8 ? "mixer" : "wallet",
      riskScore,
      riskLevel: riskScore >= 70 ? "High" : riskScore >= 40 ? "Medium" : "Low",
      balance: (Math.random() * 100).toFixed(2) + " ETH",
      firstSeen: new Date(Date.now() - Math.random() * 180 * 86400000).toISOString(),
      transactionCount: Math.floor(Math.random() * 200 + 5),
    });
  };

  addNode(suspectAddr, true);

  const edges: GraphEdge[] = txs.map((tx) => {
    addNode(tx.sender, tx.sender === suspectAddr);
    addNode(tx.receiver, tx.receiver === suspectAddr);
    return {
      id: tx.id,
      source: tx.sender,
      target: tx.receiver,
      amount: tx.amount,
      asset: tx.asset,
      timestamp: tx.timestamp,
      txHash: tx.txHash,
    };
  });

  return { nodes: Array.from(nodeMap.values()), edges };
}

function buildInteractions(suspectAddr: string, txs: TracedTransaction[]): WalletInteraction[] {
  const map = new Map<string, { count: number; volume: number; types: Set<string>; lastTs: string }>();

  for (const tx of txs.filter((t) => t.hop === 1)) {
    const counterparty = tx.sender === suspectAddr ? tx.receiver : tx.sender;
    const existing = map.get(counterparty) || { count: 0, volume: 0, types: new Set(), lastTs: tx.timestamp };
    existing.count++;
    existing.volume += tx.amount;
    existing.types.add(tx.direction === "incoming" ? "Sender" : "Receiver");
    if (new Date(tx.timestamp) > new Date(existing.lastTs)) existing.lastTs = tx.timestamp;
    map.set(counterparty, existing);
  }

  return Array.from(map.entries())
    .map(([addr, data]) => ({
      address: addr,
      transactionCount: data.count,
      totalVolume: +data.volume.toFixed(4),
      interactionType: (data.types.size > 1 ? "Both" : data.types.values().next().value) as "Sender" | "Receiver" | "Both",
      riskLevel: (data.count > 3 ? "High" : data.count > 1 ? "Medium" : "Low") as "Low" | "Medium" | "High",
      lastInteraction: data.lastTs,
    }))
    .sort((a, b) => b.transactionCount - a.transactionCount);
}

function buildClusters(txs: TracedTransaction[]): WalletCluster[] {
  return [
    {
      clusterId: "CLU-001",
      walletCount: 5,
      totalTransactions: 42,
      riskLevel: "High",
      totalVolume: 128.45,
      memberWallets: [
        { address: WALLETS[0], role: "Hub", riskScore: 89 },
        { address: WALLETS[1], role: "Relay", riskScore: 72 },
        { address: WALLETS[2], role: "Endpoint", riskScore: 45 },
        { address: WALLETS[3], role: "Relay", riskScore: 67 },
        { address: WALLETS[4], role: "Endpoint", riskScore: 31 },
      ],
    },
    {
      clusterId: "CLU-002",
      walletCount: 3,
      totalTransactions: 18,
      riskLevel: "Medium",
      totalVolume: 56.12,
      memberWallets: [
        { address: WALLETS[5], role: "Hub", riskScore: 55 },
        { address: WALLETS[6], role: "Endpoint", riskScore: 38 },
        { address: WALLETS[7], role: "Relay", riskScore: 42 },
      ],
    },
    {
      clusterId: "CLU-003",
      walletCount: 4,
      totalTransactions: 27,
      riskLevel: "High",
      totalVolume: 95.78,
      memberWallets: [
        { address: WALLETS[8], role: "Hub", riskScore: 81 },
        { address: WALLETS[9], role: "Relay", riskScore: 76 },
        { address: WALLETS[10], role: "Endpoint", riskScore: 22 },
        { address: WALLETS[11], role: "Endpoint", riskScore: 19 },
      ],
    },
  ];
}

function detectPatterns(txs: TracedTransaction[]): SuspiciousPattern[] {
  const now = new Date().toISOString();
  return [
    {
      id: "PAT-001",
      patternType: "Fan-Out",
      affectedWallets: [WALLETS[0], WALLETS[1], WALLETS[2], WALLETS[3]],
      severity: "High",
      description: "Single wallet distributed funds to 4+ wallets within 30 minutes, indicating potential fund dispersion to avoid detection.",
      detectedAt: now,
    },
    {
      id: "PAT-002",
      patternType: "Fan-In",
      affectedWallets: [WALLETS[4], WALLETS[5], WALLETS[6]],
      severity: "Medium",
      description: "Multiple wallets converged funds into a single address, suggesting fund consolidation before withdrawal.",
      detectedAt: now,
    },
    {
      id: "PAT-003",
      patternType: "Rapid Multi-Hop",
      affectedWallets: [WALLETS[0], WALLETS[7], WALLETS[8], WALLETS[9]],
      severity: "High",
      description: "Funds moved through 3+ intermediary wallets within 2 hours, indicating layering activity to obscure fund origin.",
      detectedAt: now,
    },
    {
      id: "PAT-004",
      patternType: "Round-Trip",
      affectedWallets: [WALLETS[1], WALLETS[10]],
      severity: "Low",
      description: "Funds returned to originating wallet after passing through intermediary, possible wash trading.",
      detectedAt: now,
    },
    {
      id: "PAT-005",
      patternType: "Layering",
      affectedWallets: [WALLETS[2], WALLETS[3], WALLETS[11]],
      severity: "High",
      description: "Complex chain of small transactions designed to make tracing difficult. Multiple split-and-merge operations detected.",
      detectedAt: now,
    },
  ];
}

function buildWorkflow(): InvestigationWorkflowStep[] {
  return [
    { step: 1, label: "Suspicious wallet submitted", status: "Completed", timestamp: new Date(Date.now() - 300000).toISOString() },
    { step: 2, label: "Transaction tracing started", status: "Completed", timestamp: new Date(Date.now() - 240000).toISOString() },
    { step: 3, label: "Wallet interactions mapped", status: "Completed", timestamp: new Date(Date.now() - 180000).toISOString() },
    { step: 4, label: "Suspicious patterns detected", status: "Completed", timestamp: new Date(Date.now() - 120000).toISOString() },
    { step: 5, label: "Risk indicators generated", status: "In Progress", timestamp: new Date(Date.now() - 60000).toISOString() },
    { step: 6, label: "Investigation ongoing", status: "Pending" },
  ];
}

/** Simulates the full investigation API call with a delay */
export async function runInvestigation(walletAddress: string): Promise<InvestigationResult> {
  // Brief delay for visual feedback
  await new Promise((r) => setTimeout(r, 300));

  const txs = generateTransactions(walletAddress);
  const { nodes, edges } = buildGraph(walletAddress, txs);
  const interactions = buildInteractions(walletAddress, txs);
  const clusters = buildClusters(txs);
  const patterns = detectPatterns(txs);
  const workflow = buildWorkflow();

  const uniqueAddresses = new Set<string>();
  txs.forEach((t) => { uniqueAddresses.add(t.sender); uniqueAddresses.add(t.receiver); });

  return {
    walletAddress,
    riskScore: 87,
    riskLevel: "High",
    transactions: txs,
    graphNodes: nodes,
    graphEdges: edges,
    interactions,
    clusters,
    patterns,
    workflow,
    summary: {
      totalTransactions: txs.length,
      totalVolume: +txs.reduce((s, t) => s + t.amount, 0).toFixed(4),
      uniqueWallets: uniqueAddresses.size,
      maxHopDepth: 3,
      highRiskConnections: nodes.filter((n) => n.riskLevel === "High").length,
      flaggedPatterns: patterns.filter((p) => p.severity === "High").length,
    },
  };
}
