1) Fixed Top Navigation Bar
- Left: Logo “CryptoTrace Intelligence”
- Center: Active Case ID selector
- Right: Notification icon + User avatar dropdown
- Slight blur background with subtle bottom border

2) Collapsible Left Sidebar
- Dashboard
- Investigations
- Risk Analytics
- Wallet Clusters
- Reports
- Icons + labels
- Smooth expand/collapse animation
- Active item highlighted with glowing accent bar

3) Dashboard Page
- 4 KPI cards in grid:
    - Total Wallets Traced
    - High-Risk Wallets
    - Active Cases
    - Suspicious Patterns Detected
- Each card:
    - Large metric number
    - Small trend indicator
    - Subtle hover elevation
- Below: 
    - Risk Distribution Chart
    - Transaction Volume Trend Chart

4) Investigation Page (Main Highlight)
Top Section:
- Wallet Address input field (large, centered, elegant)
- Depth selector (1–7 hops)
- “Start Investigation” button (glow effect)

Main Section:
- Large graph visualization panel (Cytoscape)
- Smooth zoom, pan, drag
- Animated edge drawing when tracing

Graph Styling:
- Nodes:
    - Green = Low Risk
    - Yellow = Medium Risk
    - Red = High Risk
    - High-risk nodes have subtle glow
- Edges:
    - Thin, animated on load
- On click:
    - Node pulses briefly
    - Side panel updates

Right Side Intelligence Panel:
- Wallet address
- Risk score badge (color-coded)
- Risk score radial gauge
- Transaction volume
- Cluster ID
- Detected flags:
    - Rapid Hopping
    - Smurfing
    - Circular Flow
- “Explain Risk Score” expandable section

5) Wallet Cluster View
- Cluster cards in grid layout
- Each card:
    - Cluster ID
    - Number of wallets
    - Risk level
    - Mini network preview
- Smooth hover interaction

6) Risk Analytics Page
- Risk score distribution chart
- Cluster size distribution chart
- Transaction velocity chart
- Clean, minimal charts (no excessive colors)

7) Reports Page
- Investigation summary layout
- Timeline view of traced transactions
- “Export Report” button (styled premium)

UX DETAILS (VERY IMPORTANT):
- Use Framer Motion for smooth transitions
- Add skeleton loaders while tracing
- Add animated tracing progress bar
- Add subtle hover glow effects
- Maintain consistent spacing (8px grid system)
- Use clear font hierarchy:
    - Large bold headings
    - Medium subheadings
    - Clean body text
- Ensure perfect alignment and padding
- No visual clutter
- No excessive gradients
- Keep it modern and professional

The final UI must:
- Look clean and authoritative
- Impress hackathon judges instantly
- Look like a funded Web3 analytics startup
- Be demo-ready and visually impactful