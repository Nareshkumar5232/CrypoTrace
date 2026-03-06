import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import ForceGraph2D, { ForceGraphMethods, NodeObject, LinkObject } from "react-force-graph-2d";
import { ZoomIn, ZoomOut, Maximize2, Target, X } from "lucide-react";
import type { GraphNode } from "../../lib/mockInvestigationData";

/* ═══════════════════════════════════════════
   Types
   ═══════════════════════════════════════════ */
interface NetworkNode extends NodeObject {
  id: string;
  label: string;
  type: "suspect" | "wallet" | "exchange";
  riskLevel: "High" | "Medium" | "Low" | "Critical";
  riskScore: number;
  balance: string;
  transactionCount: number;
  x?: number;
  y?: number;
  fx?: number;
  fy?: number;
}

interface NetworkLink extends LinkObject {
  id: string;
  source: string | NetworkNode;
  target: string | NetworkNode;
  amount: number;
  asset: string;
}

interface Props {
  nodes: GraphNode[];
  edges: { id: string; source: string; target: string; amount: number; asset: string }[];
  flaggedWallets: Set<string>;
  onFlagWallet: (addr: string) => void;
  suspectWallet?: string;
}

/* ═══════════════════════════════════════════
   Color Configuration
   ═══════════════════════════════════════════ */
const NODE_COLORS = {
  suspect: "#EF4444",
  exchange: "#A855F7",
  High: "#F97316",
  Medium: "#3B82F6",
  Low: "#22C55E",
  Critical: "#EF4444",
};

const NODE_GLOW: Record<string, string> = {
  suspect: "rgba(239, 68, 68, 0.6)",
  exchange: "rgba(168, 85, 247, 0.5)",
  wallet: "rgba(59, 130, 246, 0.4)",
  High: "rgba(249, 115, 22, 0.5)",
  Medium: "rgba(59, 130, 246, 0.4)",
  Low: "rgba(34, 197, 94, 0.3)",
  Critical: "rgba(239, 68, 68, 0.6)",
};

/* ═══════════════════════════════════════════
   Blockchain Network Graph Component
   ═══════════════════════════════════════════ */
export function BlockchainNetworkGraph({
  nodes,
  edges,
  flaggedWallets,
  onFlagWallet,
  suspectWallet,
}: Props) {
  const graphRef = useRef<ForceGraphMethods<NetworkNode, NetworkLink> | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const [hoveredNode, setHoveredNode] = useState<NetworkNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [highlightNodes, setHighlightNodes] = useState<Set<string>>(new Set());
  const [highlightLinks, setHighlightLinks] = useState<Set<string>>(new Set());

  // Convert nodes to force graph format
  const graphData = useMemo(() => {
    const networkNodes: NetworkNode[] = nodes.map((n) => ({
      id: n.id,
      label: n.label,
      type: n.type as "suspect" | "wallet" | "exchange",
      riskLevel: n.riskLevel as "High" | "Medium" | "Low" | "Critical",
      riskScore: n.riskScore,
      balance: n.balance,
      transactionCount: n.transactionCount,
    }));

    const networkLinks: NetworkLink[] = edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      amount: e.amount,
      asset: e.asset,
    }));

    return { nodes: networkNodes, links: networkLinks };
  }, [nodes, edges]);

  // Resize observer
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: Math.max(500, entry.contentRect.height),
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Get node color based on type and risk
  const getNodeColor = useCallback((node: NetworkNode) => {
    if (node.type === "suspect") return NODE_COLORS.suspect;
    if (node.type === "exchange") return NODE_COLORS.exchange;
    return NODE_COLORS[node.riskLevel] || NODE_COLORS.Low;
  }, []);

  // Get node size based on transaction count
  const getNodeSize = useCallback((node: NetworkNode) => {
    const baseSize = 8;
    const scale = Math.log10(Math.max(1, node.transactionCount)) + 1;
    if (node.type === "suspect") return baseSize * scale * 1.5;
    return baseSize * scale;
  }, []);

  // Node canvas rendering with glow effects
  const paintNode = useCallback(
    (node: NetworkNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const size = getNodeSize(node);
      const x = node.x || 0;
      const y = node.y || 0;
      const color = getNodeColor(node);
      const isHighlighted = highlightNodes.has(node.id);
      const isFlagged = flaggedWallets.has(node.id);
      const isSelected = selectedNode?.id === node.id;
      const isHovered = hoveredNode?.id === node.id;

      // Radial glow for suspect/high risk
      if (node.type === "suspect" || node.riskLevel === "High" || node.riskLevel === "Critical" || isHighlighted) {
        const glowColor = isHighlighted ? "rgba(239, 68, 68, 0.8)" : (NODE_GLOW[node.type] || NODE_GLOW[node.riskLevel] || NODE_GLOW.Low);
        const gradient = ctx.createRadialGradient(x, y, size * 0.5, x, y, size * 3);
        gradient.addColorStop(0, glowColor);
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, size * 3, 0, 2 * Math.PI);
        ctx.fill();
      }

      // Main node circle
      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();

      // Border
      ctx.strokeStyle = isHighlighted ? "#EF4444" : isSelected ? "#3B82F6" : isFlagged ? "#F97316" : "rgba(255,255,255,0.3)";
      ctx.lineWidth = isHighlighted || isSelected ? 3 : isFlagged ? 2 : 1;
      ctx.stroke();

      // Inner highlight for exchanges
      if (node.type === "exchange") {
        ctx.beginPath();
        ctx.arc(x, y, size * 0.5, 0, 2 * Math.PI);
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.fill();
      }

      // Node label - only show when zoomed in enough
      if (globalScale > 0.8 || isHovered || isSelected) {
        const label = node.label.length > 12 ? node.label.slice(0, 12) + "..." : node.label;
        ctx.font = `${10 / globalScale}px Inter, system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillStyle = isHighlighted ? "#EF4444" : "rgba(255,255,255,0.9)";
        ctx.fillText(label, x, y + size + 4);
      }
    },
    [getNodeColor, getNodeSize, highlightNodes, flaggedWallets, selectedNode, hoveredNode]
  );

  // Link rendering with directional particles
  const paintLink = useCallback(
    (link: NetworkLink, ctx: CanvasRenderingContext2D) => {
      const source = link.source as NetworkNode;
      const target = link.target as NetworkNode;
      if (!source.x || !source.y || !target.x || !target.y) return;

      const isHighlighted = highlightLinks.has(link.id);
      const thickness = Math.max(1, Math.log10(link.amount + 1));

      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(target.x, target.y);
      
      if (isHighlighted) {
        ctx.strokeStyle = "rgba(239, 68, 68, 0.8)";
        ctx.lineWidth = thickness + 2;
        ctx.shadowColor = "#EF4444";
        ctx.shadowBlur = 10;
      } else {
        ctx.strokeStyle = "rgba(59, 130, 246, 0.4)";
        ctx.lineWidth = thickness;
        ctx.shadowBlur = 0;
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    },
    [highlightLinks]
  );

  // Multi-hop trace mode - highlight transaction chain
  const highlightChain = useCallback(
    (nodeId: string) => {
      const newHighlightNodes = new Set<string>();
      const newHighlightLinks = new Set<string>();
      const visited = new Set<string>();
      const queue = [nodeId];

      while (queue.length > 0) {
        const current = queue.shift()!;
        if (visited.has(current)) continue;
        visited.add(current);
        newHighlightNodes.add(current);

        edges.forEach((edge) => {
          if (edge.source === current) {
            newHighlightLinks.add(edge.id);
            if (!visited.has(edge.target)) queue.push(edge.target);
          } else if (edge.target === current) {
            newHighlightLinks.add(edge.id);
            if (!visited.has(edge.source)) queue.push(edge.source);
          }
        });
      }

      setHighlightNodes(newHighlightNodes);
      setHighlightLinks(newHighlightLinks);
    },
    [edges]
  );

  // Clear highlights
  const clearHighlights = useCallback(() => {
    setHighlightNodes(new Set());
    setHighlightLinks(new Set());
    setSelectedNode(null);
  }, []);

  // Handle node click
  const handleNodeClick = useCallback(
    (node: NetworkNode) => {
      if (selectedNode?.id === node.id) {
        clearHighlights();
      } else {
        setSelectedNode(node);
        highlightChain(node.id);
      }
    },
    [selectedNode, clearHighlights, highlightChain]
  );

  // Zoom controls
  const zoomIn = () => graphRef.current?.zoom(graphRef.current.zoom() * 1.4, 400);
  const zoomOut = () => graphRef.current?.zoom(graphRef.current.zoom() * 0.7, 400);
  const fitAll = () => graphRef.current?.zoomToFit(400, 50);
  const centerOnSuspect = () => {
    const suspectNode = graphData.nodes.find((n) => n.type === "suspect");
    if (suspectNode && graphRef.current) {
      graphRef.current.centerAt(suspectNode.x, suspectNode.y, 400);
      graphRef.current.zoom(2, 400);
    }
  };

  return (
    <div className="relative w-full">
      {/* Graph Container */}
      <div
        ref={containerRef}
        className="w-full h-[500px] rounded-lg overflow-hidden"
        style={{
          background: "radial-gradient(circle at center, #0A0A0A 0%, #000000 100%)",
          border: "1px solid #1F1F1F",
        }}
      >
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />

        <ForceGraph2D
          ref={graphRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          nodeCanvasObject={paintNode}
          nodePointerAreaPaint={(node, color, ctx) => {
            const size = getNodeSize(node as NetworkNode);
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(node.x || 0, node.y || 0, size + 5, 0, 2 * Math.PI);
            ctx.fill();
          }}
          linkCanvasObject={paintLink}
          linkDirectionalParticles={4}
          linkDirectionalParticleSpeed={0.003}
          linkDirectionalParticleWidth={2}
          linkDirectionalParticleColor={() => "rgba(59, 130, 246, 0.8)"}
          onNodeHover={(node) => setHoveredNode(node as NetworkNode | null)}
          onNodeClick={(node) => handleNodeClick(node as NetworkNode)}
          enableNodeDrag={true}
          enableZoomInteraction={true}
          enablePanInteraction={true}
          cooldownTicks={100}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
          warmupTicks={50}
          backgroundColor="transparent"
        />
      </div>

      {/* Zoom Controls */}
      <div className="absolute top-3 right-3 flex flex-col gap-1 bg-[#111111]/90 rounded-lg border border-[#1F1F1F] p-1">
        <button onClick={zoomIn} className="h-8 w-8 flex items-center justify-center hover:bg-[#1F1F1F] rounded transition-colors" title="Zoom In">
          <ZoomIn className="h-4 w-4 text-[#B3B3B3]" />
        </button>
        <button onClick={zoomOut} className="h-8 w-8 flex items-center justify-center hover:bg-[#1F1F1F] rounded transition-colors" title="Zoom Out">
          <ZoomOut className="h-4 w-4 text-[#B3B3B3]" />
        </button>
        <button onClick={fitAll} className="h-8 w-8 flex items-center justify-center hover:bg-[#1F1F1F] rounded transition-colors" title="Fit All">
          <Maximize2 className="h-4 w-4 text-[#B3B3B3]" />
        </button>
        <button onClick={centerOnSuspect} className="h-8 w-8 flex items-center justify-center hover:bg-[#1F1F1F] rounded transition-colors" title="Center on Suspect">
          <Target className="h-4 w-4 text-[#EF4444]" />
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 flex items-center gap-4 bg-[#111111]/95 px-4 py-2 rounded-lg border border-[#1F1F1F]">
        <span className="flex items-center gap-2 text-[11px] text-[#B3B3B3]">
          <span className="h-3 w-3 rounded-full bg-[#EF4444] shadow-[0_0_8px_rgba(239,68,68,0.6)]" /> Suspect
        </span>
        <span className="flex items-center gap-2 text-[11px] text-[#B3B3B3]">
          <span className="h-3 w-3 rounded-full bg-[#F97316]" /> High Risk
        </span>
        <span className="flex items-center gap-2 text-[11px] text-[#B3B3B3]">
          <span className="h-3 w-3 rounded-full bg-[#3B82F6]" /> Medium
        </span>
        <span className="flex items-center gap-2 text-[11px] text-[#B3B3B3]">
          <span className="h-3 w-3 rounded-full bg-[#22C55E]" /> Low
        </span>
        <span className="flex items-center gap-2 text-[11px] text-[#B3B3B3]">
          <span className="h-3 w-3 rounded-full bg-[#A855F7]" /> Exchange
        </span>
      </div>

      {/* Multi-hop Trace Mode Indicator */}
      {highlightNodes.size > 0 && (
        <div className="absolute top-3 left-3 flex items-center gap-2 bg-[#EF4444]/20 border border-[#EF4444]/50 px-3 py-1.5 rounded-lg">
          <span className="h-2 w-2 rounded-full bg-[#EF4444] animate-pulse" />
          <span className="text-[11px] font-semibold text-[#EF4444]">TRACE MODE ACTIVE</span>
          <button onClick={clearHighlights} className="ml-2 hover:bg-[#EF4444]/30 rounded p-0.5">
            <X className="h-3.5 w-3.5 text-[#EF4444]" />
          </button>
        </div>
      )}

      {/* Hover Tooltip */}
      {hoveredNode && !selectedNode && (
        <div
          className="absolute z-20 pointer-events-none bg-[#111111] border border-[#1F1F1F] rounded-lg shadow-xl px-4 py-3 w-64"
          style={{
            left: Math.min(dimensions.width - 280, (hoveredNode.x || 0) + 20),
            top: Math.max(10, (hoveredNode.y || 0) - 60),
          }}
        >
          <p className="font-mono text-[11px] text-[#B3B3B3] truncate mb-2">{hoveredNode.id}</p>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-white capitalize">{hoveredNode.type}</span>
            <span
              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                hoveredNode.riskLevel === "High" || hoveredNode.riskLevel === "Critical"
                  ? "bg-red-500/20 text-red-400"
                  : hoveredNode.riskLevel === "Medium"
                  ? "bg-amber-500/20 text-amber-400"
                  : "bg-emerald-500/20 text-emerald-400"
              }`}
            >
              {hoveredNode.riskLevel} Risk
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-[#666666]">Balance</span>
              <p className="font-mono text-white">{hoveredNode.balance}</p>
            </div>
            <div>
              <span className="text-[#666666]">Transactions</span>
              <p className="text-white">{hoveredNode.transactionCount}</p>
            </div>
            <div>
              <span className="text-[#666666]">Risk Score</span>
              <p className="text-white">{hoveredNode.riskScore}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Selected Node Detail Panel */}
      {selectedNode && (
        <div className="absolute right-3 top-16 w-72 bg-[#111111] border border-[#1F1F1F] rounded-lg shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1F1F1F] bg-[#0A0A0A]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Wallet Details</h4>
            <button onClick={clearHighlights} className="hover:bg-[#1F1F1F] rounded p-1">
              <X className="h-4 w-4 text-[#B3B3B3]" />
            </button>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="text-[10px] text-[#666666] uppercase tracking-wider">Address</label>
              <p className="font-mono text-[11px] text-white break-all">{selectedNode.id}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-[#666666] uppercase tracking-wider">Type</label>
                <p className="text-sm font-semibold text-white capitalize">{selectedNode.type}</p>
              </div>
              <div>
                <label className="text-[10px] text-[#666666] uppercase tracking-wider">Risk Level</label>
                <p
                  className={`text-sm font-semibold ${
                    selectedNode.riskLevel === "High" || selectedNode.riskLevel === "Critical"
                      ? "text-red-400"
                      : selectedNode.riskLevel === "Medium"
                      ? "text-amber-400"
                      : "text-emerald-400"
                  }`}
                >
                  {selectedNode.riskLevel}
                </p>
              </div>
              <div>
                <label className="text-[10px] text-[#666666] uppercase tracking-wider">Risk Score</label>
                <p className="text-sm font-semibold text-white">{selectedNode.riskScore}%</p>
              </div>
              <div>
                <label className="text-[10px] text-[#666666] uppercase tracking-wider">Transactions</label>
                <p className="text-sm font-semibold text-white">{selectedNode.transactionCount}</p>
              </div>
            </div>
            <div>
              <label className="text-[10px] text-[#666666] uppercase tracking-wider">Balance</label>
              <p className="text-lg font-bold text-white">{selectedNode.balance}</p>
            </div>
            <div>
              <label className="text-[10px] text-[#666666] uppercase tracking-wider mb-2 block">Connected Wallets</label>
              <p className="text-sm text-[#3B82F6] font-semibold">{highlightNodes.size - 1} wallets in trace</p>
            </div>
            {selectedNode.type !== "suspect" && !flaggedWallets.has(selectedNode.id) && (
              <button
                onClick={() => onFlagWallet(selectedNode.id)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-red-400 text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Flag as Suspicious
              </button>
            )}
            {flaggedWallets.has(selectedNode.id) && (
              <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/20 border border-amber-500/50 rounded-lg">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">Flagged</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
