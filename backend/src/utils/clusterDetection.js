/**
 * clusterDetection.js
 * Pure-logic module implementing 4 clustering heuristics for wallet grouping.
 * No DB dependency — operates entirely on in-memory transaction arrays.
 */

// ────────────────────────── Union-Find ──────────────────────────
class UnionFind {
    constructor() {
        this.parent = {};
        this.rank = {};
    }

    /** Ensure the element exists in the data structure. */
    add(x) {
        if (!(x in this.parent)) {
            this.parent[x] = x;
            this.rank[x] = 0;
        }
    }

    /** Find with path compression. */
    find(x) {
        this.add(x);
        if (this.parent[x] !== x) {
            this.parent[x] = this.find(this.parent[x]);
        }
        return this.parent[x];
    }

    /** Union by rank. */
    union(a, b) {
        const rootA = this.find(a);
        const rootB = this.find(b);
        if (rootA === rootB) return;

        if (this.rank[rootA] < this.rank[rootB]) {
            this.parent[rootA] = rootB;
        } else if (this.rank[rootA] > this.rank[rootB]) {
            this.parent[rootB] = rootA;
        } else {
            this.parent[rootB] = rootA;
            this.rank[rootA]++;
        }
    }

    /** Return all connected components as arrays of addresses. */
    getComponents() {
        // Compress all paths first
        for (const x of Object.keys(this.parent)) {
            this.find(x);
        }

        const groups = {};
        for (const x of Object.keys(this.parent)) {
            const root = this.parent[x];
            if (!groups[root]) groups[root] = [];
            groups[root].push(x);
        }

        // Only return groups with ≥ 2 members
        return Object.values(groups).filter(g => g.length >= 2);
    }
}

// ────────────────────────── Heuristics ──────────────────────────

/**
 * 1. Repeated Interaction — pairs of wallets with ≥3 bidirectional transactions.
 * @param {Array} transactions  [{from_address, to_address, ...}]
 * @returns {string[][]} groups of wallet addresses
 */
function repeatedInteraction(transactions) {
    // Count bidirectional interactions for each unique pair
    const pairCount = {};

    for (const tx of transactions) {
        const a = tx.from_address.toLowerCase();
        const b = tx.to_address.toLowerCase();
        if (a === b) continue;

        const key = [a, b].sort().join('|');
        pairCount[key] = (pairCount[key] || 0) + 1;
    }

    const groups = [];
    for (const [key, count] of Object.entries(pairCount)) {
        if (count >= 3) {
            groups.push(key.split('|'));
        }
    }
    return groups;
}

/**
 * 2. Fan-In — single wallet receiving from ≥3 distinct senders.
 * @param {Array} transactions
 * @returns {string[][]} groups (receiver + all senders)
 */
function fanIn(transactions) {
    const receivers = {};

    for (const tx of transactions) {
        const sender = tx.from_address.toLowerCase();
        const receiver = tx.to_address.toLowerCase();
        if (sender === receiver) continue;

        if (!receivers[receiver]) receivers[receiver] = new Set();
        receivers[receiver].add(sender);
    }

    const groups = [];
    for (const [receiver, senders] of Object.entries(receivers)) {
        if (senders.size >= 3) {
            groups.push([receiver, ...Array.from(senders)]);
        }
    }
    return groups;
}

/**
 * 3. Fan-Out — single wallet sending to ≥3 distinct receivers.
 * @param {Array} transactions
 * @returns {string[][]} groups (sender + all receivers)
 */
function fanOut(transactions) {
    const senders = {};

    for (const tx of transactions) {
        const sender = tx.from_address.toLowerCase();
        const receiver = tx.to_address.toLowerCase();
        if (sender === receiver) continue;

        if (!senders[sender]) senders[sender] = new Set();
        senders[sender].add(receiver);
    }

    const groups = [];
    for (const [sender, receivers] of Object.entries(senders)) {
        if (receivers.size >= 3) {
            groups.push([sender, ...Array.from(receivers)]);
        }
    }
    return groups;
}

/**
 * 4. Rapid Routing — chains of ≥3 transactions within 10-minute windows.
 *    Detects pass-through wallets used for layering.
 * @param {Array} transactions  must include a `timestamp` field
 * @returns {string[][]} groups of chained addresses
 */
function rapidRouting(transactions) {
    const TEN_MINUTES_MS = 10 * 60 * 1000;

    // Sort by timestamp ascending
    const sorted = [...transactions]
        .filter(tx => tx.timestamp)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    // Build outgoing map: receiver → [{to_address, timestamp}] of follow-up sends
    const outgoing = {};
    for (const tx of sorted) {
        const sender = tx.from_address.toLowerCase();
        if (!outgoing[sender]) outgoing[sender] = [];
        outgoing[sender].push({
            to: tx.to_address.toLowerCase(),
            time: new Date(tx.timestamp).getTime(),
            from: sender,
        });
    }

    // For each transaction, try to extend a chain through the receiver
    const chains = [];
    for (const tx of sorted) {
        const chain = [tx.from_address.toLowerCase(), tx.to_address.toLowerCase()];
        let lastTime = new Date(tx.timestamp).getTime();
        let current = tx.to_address.toLowerCase();

        // Follow the chain
        let extended = true;
        while (extended) {
            extended = false;
            const nextSends = outgoing[current];
            if (!nextSends) break;

            for (const ns of nextSends) {
                if (ns.time >= lastTime && ns.time - lastTime <= TEN_MINUTES_MS) {
                    if (!chain.includes(ns.to)) {
                        chain.push(ns.to);
                        lastTime = ns.time;
                        current = ns.to;
                        extended = true;
                        break; // follow longest first match
                    }
                }
            }
        }

        if (chain.length >= 3) {
            chains.push(chain);
        }
    }

    return chains;
}

// ────────────────────────── Pipeline ──────────────────────────

/**
 * Run all 4 heuristics and merge overlapping groups via Union-Find.
 * @param {Array} transactions
 * @returns {{ clusters: string[][], heuristicsUsed: string[] }}
 */
function detectClusters(transactions) {
    if (!transactions || transactions.length === 0) {
        return { clusters: [], heuristicsUsed: [] };
    }

    const uf = new UnionFind();
    const heuristicsUsed = [];

    // Run each heuristic and union the results
    const riGroups = repeatedInteraction(transactions);
    if (riGroups.length > 0) {
        heuristicsUsed.push('repeated_interaction');
        for (const group of riGroups) {
            for (let i = 1; i < group.length; i++) uf.union(group[0], group[i]);
        }
    }

    const fiGroups = fanIn(transactions);
    if (fiGroups.length > 0) {
        heuristicsUsed.push('fan_in');
        for (const group of fiGroups) {
            for (let i = 1; i < group.length; i++) uf.union(group[0], group[i]);
        }
    }

    const foGroups = fanOut(transactions);
    if (foGroups.length > 0) {
        heuristicsUsed.push('fan_out');
        for (const group of foGroups) {
            for (let i = 1; i < group.length; i++) uf.union(group[0], group[i]);
        }
    }

    const rrGroups = rapidRouting(transactions);
    if (rrGroups.length > 0) {
        heuristicsUsed.push('rapid_routing');
        for (const group of rrGroups) {
            for (let i = 1; i < group.length; i++) uf.union(group[0], group[i]);
        }
    }

    const clusters = uf.getComponents();
    return { clusters, heuristicsUsed };
}

module.exports = {
    UnionFind,
    repeatedInteraction,
    fanIn,
    fanOut,
    rapidRouting,
    detectClusters,
};
