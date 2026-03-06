/**
 * osintService.js
 * Queries public crypto abuse databases for wallet address intelligence.
 *
 * Supported sources (best-effort, graceful degradation):
 *   - Bitcoin/Crypto Abuse API
 *   - Chainabuse
 *   - Local blocklist
 *
 * If external APIs are unreachable the service returns an empty array
 * rather than failing the entire risk pipeline.
 */

// ─────────────── Local Blocklist (always available) ───────────────
// In production this would be loaded from a database or config file.
// These are well-known flagged addresses for demonstration.
const LOCAL_BLOCKLIST = [
    { address: '0x00000000000000000000000000000000deadbeef', source: 'local_blocklist', category: 'burn_address' },
    { address: '1dice8emzwsanjazsyydwhdw6nn6rl3q7', source: 'local_blocklist', category: 'gambling' },
];

const OsintService = {
    /**
     * Check a list of wallet addresses against OSINT sources.
     *
     * @param {string[]} addresses  Array of wallet addresses to check
     * @returns {Array} Array of matches: [{wallet, source, category}]
     */
    async checkAddresses(addresses) {
        if (!addresses || addresses.length === 0) return [];

        const normalised = addresses.map(a => a.toLowerCase());
        const matches = [];

        // 1. Check local blocklist
        for (const entry of LOCAL_BLOCKLIST) {
            if (normalised.includes(entry.address.toLowerCase())) {
                matches.push({
                    wallet: entry.address,
                    source: entry.source,
                    category: entry.category,
                });
            }
        }

        // 2. External API: Chainabuse / BitcoinAbuse (best-effort)
        try {
            const externalMatches = await this._queryExternalSources(normalised);
            matches.push(...externalMatches);
        } catch (err) {
            // Graceful degradation — log but don't fail the pipeline
            console.warn('[OSINT] External source query failed, continuing with local data:', err.message);
        }

        return matches;
    },

    /**
     * Internal: Query external OSINT APIs.
     * This is a stub that can be expanded once API keys are configured.
     *
     * @param {string[]} addresses  Normalised addresses
     * @returns {Array} matches
     */
    async _queryExternalSources(addresses) {
        // ──────────────────────────────────────────────────────────
        // STUB: In production, uncomment and configure API keys:
        //
        // const CHAINABUSE_API = process.env.CHAINABUSE_API_KEY;
        // const BITCOINABUSE_API = process.env.BITCOINABUSE_API_KEY;
        //
        // Example integration:
        // for (const addr of addresses) {
        //     const res = await fetch(`https://www.chainabuse.com/api/v0/address/${addr}`, {
        //         headers: { 'Authorization': `Bearer ${CHAINABUSE_API}` }
        //     });
        //     if (res.ok) {
        //         const data = await res.json();
        //         if (data.reports && data.reports.length > 0) {
        //             matches.push({
        //                 wallet: addr,
        //                 source: 'chainabuse',
        //                 category: data.reports[0].category || 'unknown',
        //             });
        //         }
        //     }
        // }
        // ──────────────────────────────────────────────────────────

        return [];
    },
};

module.exports = OsintService;
