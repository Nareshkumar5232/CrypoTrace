/**
 * graphTraversal.js
 * BFS and DFS algorithms for tracing fund flow through transaction graphs.
 */

const GraphTraversal = {
    /**
     * Breadth-First Search from a starting address up to `maxDepth` hops.
     * Returns { visitedNodes, traversalEdges, paths }
     *
     * @param {Object} adjacencyList - { address: [address, ...] }
     * @param {Array}  allEdges      - Full edge list with metadata
     * @param {string} startAddress  - Starting wallet address
     * @param {number} maxDepth      - Maximum number of hops (default 5)
     */
    bfs(adjacencyList, allEdges, startAddress, maxDepth = 5) {
        const start = startAddress.toLowerCase();
        const visited = new Set();
        const visitedNodes = [];
        const traversalEdges = [];

        // Build quick edge lookup: from -> [edges]
        const edgeMap = {};
        for (const edge of allEdges) {
            const key = edge.from.toLowerCase();
            if (!edgeMap[key]) edgeMap[key] = [];
            edgeMap[key].push(edge);
        }

        // BFS queue: [address, currentDepth]
        const queue = [[start, 0]];
        visited.add(start);
        visitedNodes.push({ id: start, depth: 0 });

        while (queue.length > 0) {
            const [current, depth] = queue.shift();

            if (depth >= maxDepth) continue;

            const neighbors = adjacencyList[current] || [];
            for (const neighbor of neighbors) {
                const n = neighbor.toLowerCase();

                // Add edge(s) between current -> neighbor
                const matchingEdges = (edgeMap[current] || []).filter(
                    e => e.to.toLowerCase() === n
                );
                for (const me of matchingEdges) {
                    traversalEdges.push({ ...me, depth: depth + 1 });
                }

                if (!visited.has(n)) {
                    visited.add(n);
                    visitedNodes.push({ id: n, depth: depth + 1 });
                    queue.push([n, depth + 1]);
                }
            }
        }

        return { visitedNodes, traversalEdges };
    },

    /**
     * Depth-First Search from a starting address up to `maxDepth` hops.
     * Returns { visitedNodes, traversalEdges }
     */
    dfs(adjacencyList, allEdges, startAddress, maxDepth = 5) {
        const start = startAddress.toLowerCase();
        const visited = new Set();
        const visitedNodes = [];
        const traversalEdges = [];

        const edgeMap = {};
        for (const edge of allEdges) {
            const key = edge.from.toLowerCase();
            if (!edgeMap[key]) edgeMap[key] = [];
            edgeMap[key].push(edge);
        }

        const stack = [[start, 0]];

        while (stack.length > 0) {
            const [current, depth] = stack.pop();

            if (visited.has(current)) continue;
            visited.add(current);
            visitedNodes.push({ id: current, depth });

            if (depth >= maxDepth) continue;

            const neighbors = adjacencyList[current] || [];
            for (const neighbor of neighbors) {
                const n = neighbor.toLowerCase();

                const matchingEdges = (edgeMap[current] || []).filter(
                    e => e.to.toLowerCase() === n
                );
                for (const me of matchingEdges) {
                    traversalEdges.push({ ...me, depth: depth + 1 });
                }

                if (!visited.has(n)) {
                    stack.push([n, depth + 1]);
                }
            }
        }

        return { visitedNodes, traversalEdges };
    },
};

module.exports = GraphTraversal;
