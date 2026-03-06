/**
 * patternAlgorithms.js
 * Contains the pure logic for detecting the four money laundering patterns.
 */

// ────────────────────────── Heuristics Configuration ──────────────────────────

const config = {
    // Peel Chain
    // A linear chain where funds decrease gradually, meaning each hop forwards 
    // a large percentage (e.g. >50%) and the rest is kept or sent elsewhere.
    PEEL_CHAIN_MIN_LENGTH: 3,
    PEEL_CHAIN_MIN_FORWARD_RATIO: 0.50, // >= 50%
    PEEL_CHAIN_MAX_FORWARD_RATIO: 0.99, // <= 99% (so it's not simply an exact transfer)

    // Fan-Out
    // Sending to >= 3 distinct receivers within a short timeframe
    FAN_OUT_MIN_RECEIVERS: 3,
    FAN_OUT_TIME_WINDOW_MS: 60 * 60 * 1000, // 1 hour

    // Fan-In
    // Receiving from >= 3 distinct senders within a short timeframe
    FAN_IN_MIN_SENDERS: 3,
    FAN_IN_TIME_WINDOW_MS: 60 * 60 * 1000, // 1 hour

    // Rapid Routing
    // Chain of >= 3 transactions within short timestamps
    RAPID_ROUTING_MIN_HOPS: 3,
    RAPID_ROUTING_WINDOW_MS: 15 * 60 * 1000, // 15 mins total from start to end of chain
};

// ────────────────────────── 1. Peel Chain Detection ──────────────────────────

/**
 * Detects Peel Chains: Linear transaction chains where funds decrease gradually.
 * @param {Array} transactions  Array of transactions
 * @returns {Array} Array of detected pattern objects
 */
function detectPeelChains(transactions) {
    // We want to find long chains where A is a large wallet, peeling off small amounts,
    // and sending the large remainder down a chain.

    // 1. Sort by time
    const sorted = [...transactions]
        .filter(t => t.timestamp && Number(t.amount) > 0)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    // 2. Build outgoing map: wallet -> [{tx}]
    const outgoing = {};
    for (const tx of sorted) {
        const from = tx.from_address.toLowerCase();
        if (!outgoing[from]) outgoing[from] = [];
        outgoing[from].push(tx);
    }

    const detected = [];
    const usedTxs = new Set();

    // 3. Follow chains
    for (const tx of sorted) {
        if (usedTxs.has(tx.tx_hash)) continue;

        let chainWallets = [tx.from_address.toLowerCase(), tx.to_address.toLowerCase()];
        let chainTxs = [tx.tx_hash];
        let currentWallet = tx.to_address.toLowerCase();
        let lastTx = tx;

        while (true) {
            const nextSends = outgoing[currentWallet] || [];

            // Look for a send that is a major portion of what was received
            let foundNext = false;
            let lastAmount = Number(lastTx.amount);

            for (const ns of nextSends) {
                if (usedTxs.has(ns.tx_hash)) continue;
                if (new Date(ns.timestamp) <= new Date(lastTx.timestamp)) continue;

                const nextAmount = Number(ns.amount);
                const ratio = nextAmount / lastAmount;

                // Peel off: next amount should be slightly less than last amount
                if (ratio >= config.PEEL_CHAIN_MIN_FORWARD_RATIO &&
                    ratio <= config.PEEL_CHAIN_MAX_FORWARD_RATIO) {

                    chainWallets.push(ns.to_address.toLowerCase());
                    chainTxs.push(ns.tx_hash);
                    usedTxs.add(ns.tx_hash);
                    currentWallet = ns.to_address.toLowerCase();
                    lastTx = ns;
                    foundNext = true;
                    break; // Follow the first strong matching path
                }
            }

            if (!foundNext) break;
        }

        if (chainWallets.length >= config.PEEL_CHAIN_MIN_LENGTH) {
            detected.push({
                pattern_type: 'PEEL_CHAIN',
                wallet: chainWallets[0], // the start of the chain
                related_wallets: chainWallets.slice(1),
                tx_hashes: chainTxs,
                severity: 'CRITICAL',
                details: { chain_length: chainWallets.length - 1 }
            });
        }
    }

    return detected;
}

// ────────────────────────── 2. Fan-Out Pattern ──────────────────────────

/**
 * Detects Fan-Out: A wallet sending to multiple new wallets within a short timeframe.
 */
function detectFanOuts(transactions) {
    const sorted = [...transactions]
        .filter(t => t.timestamp)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    const detected = [];
    const outgoing = {};

    for (const tx of sorted) {
        const sender = tx.from_address.toLowerCase();
        if (!outgoing[sender]) outgoing[sender] = [];
        outgoing[sender].push(tx);
    }

    for (const [sender, sends] of Object.entries(outgoing)) {
        // Group sends by time window
        let windowStart = 0;
        let windowReceivers = new Set();
        let windowTxs = [];

        for (const tx of sends) {
            const txTime = new Date(tx.timestamp).getTime();

            if (windowTxs.length === 0 || txTime - windowStart > config.FAN_OUT_TIME_WINDOW_MS) {
                // Evaluate old window
                if (windowReceivers.size >= config.FAN_OUT_MIN_RECEIVERS) {
                    detected.push({
                        pattern_type: 'FAN_OUT',
                        wallet: sender,
                        related_wallets: Array.from(windowReceivers),
                        tx_hashes: windowTxs,
                        severity: 'HIGH',
                        details: { receiver_count: windowReceivers.size }
                    });
                }

                // Start new window
                windowStart = txTime;
                windowReceivers = new Set([tx.to_address.toLowerCase()]);
                windowTxs = [tx.tx_hash];
            } else {
                // Same window
                windowReceivers.add(tx.to_address.toLowerCase());
                windowTxs.push(tx.tx_hash);
            }
        }

        // Evaluate last window
        if (windowReceivers.size >= config.FAN_OUT_MIN_RECEIVERS) {
            detected.push({
                pattern_type: 'FAN_OUT',
                wallet: sender,
                related_wallets: Array.from(windowReceivers),
                tx_hashes: windowTxs,
                severity: 'HIGH',
                details: { receiver_count: windowReceivers.size }
            });
        }
    }

    return detected;
}

// ────────────────────────── 3. Fan-In Pattern ──────────────────────────

/**
 * Detects Fan-In: Multiple wallets sending funds to a single destination.
 */
function detectFanIns(transactions) {
    const sorted = [...transactions]
        .filter(t => t.timestamp)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    const detected = [];
    const incoming = {};

    for (const tx of sorted) {
        const receiver = tx.to_address.toLowerCase();
        if (!incoming[receiver]) incoming[receiver] = [];
        incoming[receiver].push(tx);
    }

    for (const [receiver, receives] of Object.entries(incoming)) {
        // Group receives by time window
        let windowStart = 0;
        let windowSenders = new Set();
        let windowTxs = [];

        for (const tx of receives) {
            const txTime = new Date(tx.timestamp).getTime();

            if (windowTxs.length === 0 || txTime - windowStart > config.FAN_IN_TIME_WINDOW_MS) {
                // Evaluate old window
                if (windowSenders.size >= config.FAN_IN_MIN_SENDERS) {
                    detected.push({
                        pattern_type: 'FAN_IN',
                        wallet: receiver,
                        related_wallets: Array.from(windowSenders),
                        tx_hashes: windowTxs,
                        severity: 'HIGH',
                        details: { sender_count: windowSenders.size }
                    });
                }

                // Start new window
                windowStart = txTime;
                windowSenders = new Set([tx.from_address.toLowerCase()]);
                windowTxs = [tx.tx_hash];
            } else {
                // Same window
                windowSenders.add(tx.from_address.toLowerCase());
                windowTxs.push(tx.tx_hash);
            }
        }

        // Evaluate last window
        if (windowSenders.size >= config.FAN_IN_MIN_SENDERS) {
            detected.push({
                pattern_type: 'FAN_IN',
                wallet: receiver,
                related_wallets: Array.from(windowSenders),
                tx_hashes: windowTxs,
                severity: 'HIGH',
                details: { sender_count: windowSenders.size }
            });
        }
    }

    return detected;
}

// ────────────────────────── 4. Rapid Routing ──────────────────────────

/**
 * Detects Rapid Routing: Chains of ≥3 transactions within short timestamps.
 */
function detectRapidRouting(transactions) {
    const sorted = [...transactions]
        .filter(t => t.timestamp)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    const outgoing = {};
    for (const tx of sorted) {
        const from = tx.from_address.toLowerCase();
        if (!outgoing[from]) outgoing[from] = [];
        outgoing[from].push(tx);
    }

    const detected = [];
    const usedTxs = new Set();

    for (const tx of sorted) {
        if (usedTxs.has(tx.tx_hash)) continue;

        let chainWallets = [tx.from_address.toLowerCase(), tx.to_address.toLowerCase()];
        let chainTxs = [tx.tx_hash];
        let currentWallet = tx.to_address.toLowerCase();
        let lastTime = new Date(tx.timestamp).getTime();
        let initialTime = lastTime;

        while (true) {
            const nextSends = outgoing[currentWallet] || [];
            let foundNext = false;

            for (const ns of nextSends) {
                if (usedTxs.has(ns.tx_hash)) continue;

                const nsTime = new Date(ns.timestamp).getTime();

                // Must be sequential
                if (nsTime >= lastTime && (nsTime - initialTime) <= config.RAPID_ROUTING_WINDOW_MS) {
                    chainWallets.push(ns.to_address.toLowerCase());
                    chainTxs.push(ns.tx_hash);
                    usedTxs.add(ns.tx_hash);
                    currentWallet = ns.to_address.toLowerCase();
                    lastTime = nsTime;
                    foundNext = true;
                    break;
                }
            }

            if (!foundNext) break;
        }

        if (chainWallets.length >= config.RAPID_ROUTING_MIN_HOPS + 1) { // 3 hops = 4 wallets
            detected.push({
                pattern_type: 'RAPID_ROUTING',
                wallet: chainWallets[0], // source of routing
                related_wallets: chainWallets.slice(1),
                tx_hashes: chainTxs,
                severity: 'CRITICAL',
                details: {
                    chain_length: chainWallets.length - 1,
                    time_span_ms: lastTime - initialTime
                }
            });
        }
    }

    return detected;
}

module.exports = {
    detectPeelChains,
    detectFanOuts,
    detectFanIns,
    detectRapidRouting
};
