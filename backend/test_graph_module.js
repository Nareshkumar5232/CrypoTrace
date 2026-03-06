/**
 * test_graph_module.js
 * Standalone verification for Module 5: Transaction Graph Engine
 *
 * Tests:
 *  1. graphBuilder.buildGraph() — adjacency list, nodes, edges
 *  2. graphTraversal.bfs()      — BFS traversal with depth limit
 *  3. graphTraversal.dfs()      — DFS traversal with depth limit
 *
 * Run:  node test_graph_module.js
 */

const GraphBuilder = require('./src/utils/graphBuilder');
const GraphTraversal = require('./src/utils/graphTraversal');

// ─── Sample transaction data ────────────────────────────────────────
const sampleTransactions = [
    { tx_hash: '0xaaa', from_address: 'WalletA', to_address: 'WalletB', amount: '3.2', timestamp: '2025-01-01T10:00:00Z', block_number: 100 },
    { tx_hash: '0xbbb', from_address: 'WalletB', to_address: 'WalletC', amount: '1.5', timestamp: '2025-01-01T11:00:00Z', block_number: 101 },
    { tx_hash: '0xccc', from_address: 'WalletB', to_address: 'WalletD', amount: '0.8', timestamp: '2025-01-01T12:00:00Z', block_number: 102 },
    { tx_hash: '0xddd', from_address: 'WalletC', to_address: 'WalletE', amount: '2.0', timestamp: '2025-01-01T13:00:00Z', block_number: 103 },
    { tx_hash: '0xeee', from_address: 'WalletD', to_address: 'WalletF', amount: '0.5', timestamp: '2025-01-01T14:00:00Z', block_number: 104 },
    { tx_hash: '0xfff', from_address: 'WalletE', to_address: 'WalletG', amount: '1.0', timestamp: '2025-01-01T15:00:00Z', block_number: 105 },
];

// Expected graph:
//   A → B → C → E → G
//            └→ D → F

let passed = 0;
let failed = 0;

function assert(condition, label) {
    if (condition) {
        console.log(`  ✅ PASS: ${label}`);
        passed++;
    } else {
        console.error(`  ❌ FAIL: ${label}`);
        failed++;
    }
}

// ─── Test 1: Graph Builder ──────────────────────────────────────────
console.log('\n══════════════════════════════════════════');
console.log('TEST 1: GraphBuilder.buildGraph()');
console.log('══════════════════════════════════════════');

const { adjacencyList, nodes, edges } = GraphBuilder.buildGraph(sampleTransactions);

// Adjacency list checks
assert(Array.isArray(adjacencyList['walleta']) && adjacencyList['walleta'].includes('walletb'),
    'WalletA → WalletB in adjacency list');
assert(Array.isArray(adjacencyList['walletb']) && adjacencyList['walletb'].includes('walletc') && adjacencyList['walletb'].includes('walletd'),
    'WalletB → WalletC, WalletD in adjacency list');
assert(Array.isArray(adjacencyList['walletc']) && adjacencyList['walletc'].includes('wallete'),
    'WalletC → WalletE in adjacency list');
assert(!adjacencyList['walletg'],
    'WalletG has no outgoing edges (leaf node)');

// Nodes check
assert(nodes.length === 7, `7 unique nodes found (got ${nodes.length})`);
const nodeIds = nodes.map(n => n.id);
assert(nodeIds.includes('walleta') && nodeIds.includes('walletg'),
    'Nodes include WalletA and WalletG');

// Edges check
assert(edges.length === 6, `6 edges created (got ${edges.length})`);
const firstEdge = edges.find(e => e.tx_hash === '0xaaa');
assert(firstEdge && firstEdge.from === 'walleta' && firstEdge.to === 'walletb' && firstEdge.amount === 3.2,
    'Edge 0xaaa: WalletA → WalletB, amount 3.2');


// ─── Test 2: BFS Traversal ─────────────────────────────────────────
console.log('\n══════════════════════════════════════════');
console.log('TEST 2: GraphTraversal.bfs()');
console.log('══════════════════════════════════════════');

// BFS from WalletA, depth 2 → should reach A, B, C, D (not E, F, G)
const bfs2 = GraphTraversal.bfs(adjacencyList, edges, 'WalletA', 2);
const bfsNodeIds2 = bfs2.visitedNodes.map(n => n.id);

assert(bfsNodeIds2.includes('walleta'), 'BFS depth 2: includes start node WalletA');
assert(bfsNodeIds2.includes('walletb'), 'BFS depth 2: includes WalletB (hop 1)');
assert(bfsNodeIds2.includes('walletc'), 'BFS depth 2: includes WalletC (hop 2)');
assert(bfsNodeIds2.includes('walletd'), 'BFS depth 2: includes WalletD (hop 2)');
assert(!bfsNodeIds2.includes('wallete'), 'BFS depth 2: does NOT include WalletE (hop 3)');
assert(!bfsNodeIds2.includes('walletg'), 'BFS depth 2: does NOT include WalletG (hop 4)');

// BFS from WalletA, depth 5 → should reach everything
const bfs5 = GraphTraversal.bfs(adjacencyList, edges, 'WalletA', 5);
const bfsNodeIds5 = bfs5.visitedNodes.map(n => n.id);

assert(bfsNodeIds5.length === 7, `BFS depth 5: all 7 nodes visited (got ${bfsNodeIds5.length})`);
assert(bfs5.traversalEdges.length === 6, `BFS depth 5: all 6 edges traversed (got ${bfs5.traversalEdges.length})`);

// Verify depth annotation
const nodeAtDepth0 = bfs5.visitedNodes.find(n => n.id === 'walleta');
assert(nodeAtDepth0 && nodeAtDepth0.depth === 0, 'BFS: start node has depth 0');

const nodeAtDepth3 = bfs5.visitedNodes.find(n => n.id === 'wallete');
assert(nodeAtDepth3 && nodeAtDepth3.depth === 3, 'BFS: WalletE has depth 3');


// ─── Test 3: DFS Traversal ─────────────────────────────────────────
console.log('\n══════════════════════════════════════════');
console.log('TEST 3: GraphTraversal.dfs()');
console.log('══════════════════════════════════════════');

// DFS from WalletA, depth 5 → should reach everything
const dfs5 = GraphTraversal.dfs(adjacencyList, edges, 'WalletA', 5);
const dfsNodeIds5 = dfs5.visitedNodes.map(n => n.id);

assert(dfsNodeIds5.length === 7, `DFS depth 5: all 7 nodes visited (got ${dfsNodeIds5.length})`);
assert(dfs5.traversalEdges.length >= 6, `DFS depth 5: at least 6 edges traversed (got ${dfs5.traversalEdges.length})`);
assert(dfsNodeIds5.includes('walleta'), 'DFS: includes start node WalletA');
assert(dfsNodeIds5.includes('walletg'), 'DFS: reaches leaf WalletG');

// DFS from WalletA, depth 1 → only A and B
const dfs1 = GraphTraversal.dfs(adjacencyList, edges, 'WalletA', 1);
const dfsNodeIds1 = dfs1.visitedNodes.map(n => n.id);

assert(dfsNodeIds1.includes('walleta'), 'DFS depth 1: includes WalletA');
assert(dfsNodeIds1.includes('walletb'), 'DFS depth 1: includes WalletB');
assert(!dfsNodeIds1.includes('walletc') || !dfsNodeIds1.includes('walletd'),
    'DFS depth 1: does NOT reach all hop-2 nodes');


// ─── Test 4: Edge cases ────────────────────────────────────────────
console.log('\n══════════════════════════════════════════');
console.log('TEST 4: Edge cases');
console.log('══════════════════════════════════════════');

// Empty transactions
const emptyGraph = GraphBuilder.buildGraph([]);
assert(emptyGraph.nodes.length === 0, 'Empty transactions → 0 nodes');
assert(emptyGraph.edges.length === 0, 'Empty transactions → 0 edges');

// BFS on empty graph
const emptyBfs = GraphTraversal.bfs({}, [], 'nonexistent', 3);
assert(emptyBfs.visitedNodes.length === 1, 'BFS on empty graph → only start node');
assert(emptyBfs.traversalEdges.length === 0, 'BFS on empty graph → 0 edges');

// DFS on disconnected node
const dfsDisconnected = GraphTraversal.dfs(adjacencyList, edges, 'WalletG', 5);
assert(dfsDisconnected.visitedNodes.length === 1, 'DFS from leaf WalletG → only itself (1 node)');


// ─── Summary ────────────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════');
console.log(`RESULTS: ${passed} passed, ${failed} failed, ${passed + failed} total`);
console.log('══════════════════════════════════════════\n');

process.exit(failed > 0 ? 1 : 0);
