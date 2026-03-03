# CryptoTrace Intelligence Platform

A production-grade cryptocurrency fund tracing intelligence platform built with React, featuring real-time graph visualization, risk analytics, and comprehensive reporting.

## Features

### 🎯 Core Functionality

- **Interactive Investigation Center**: Trace cryptocurrency flows with interactive graph visualization using Cytoscape.js
- **Real-time Risk Analytics**: Comprehensive charts and metrics for risk assessment
- **Wallet Clustering**: Identify and analyze groups of wallets with similar behavior patterns
- **Detailed Reporting**: Export investigation summaries with timeline views

### 🎨 Design & UX

- **Enterprise-Grade UI**: Dark intelligence theme with electric blue accents (#06B6D4)
- **Glassomorphism Effects**: Premium backdrop blur and transparency effects
- **Smooth Animations**: Motion/React powered transitions throughout
- **Fully Responsive**: Adapts seamlessly to all screen sizes
- **Clean Typography**: Perfect hierarchy and spacing on 8px grid system

### 📊 Pages

1. **Dashboard** - KPI cards, risk distribution charts, transaction volume trends
2. **Investigation Center** - Interactive graph visualization with depth controls and intelligence panel
3. **Wallet Clusters** - Grid view of wallet clusters with risk indicators
4. **Risk Analytics** - Comprehensive charts for risk score distribution, cluster analysis, and transaction velocity
5. **Reports** - Investigation summaries with timeline views and export functionality

### 🛠️ Tech Stack

- React 18 with Vite
- TypeScript
- Tailwind CSS v4
- shadcn/ui components
- Motion (Framer Motion)
- Cytoscape.js for graph visualization
- Recharts for data visualization
- React Router for navigation
- Lucide Icons

## Getting Started

The application is ready to run. Simply start the development server to explore the platform.

## Color Palette

- **Background**: Deep Navy (#0B1120)
- **Primary**: Electric Blue (#06B6D4)
- **Cards**: Dark Navy (#141B2B)
- **Accents**: Teal glow effects
- **Risk Indicators**:
  - High Risk: Red (#EF4444)
  - Medium Risk: Yellow (#F59E0B)
  - Low Risk: Green (#10B981)

## Key Components

- Fixed top navigation with case selector
- Collapsible sidebar with smooth animations
- Interactive Cytoscape graph with risk-based node coloring
- Real-time progress tracking
- Detailed intelligence panel with risk scoring
- Multiple chart types (Bar, Line, Area, Pie)
- Timeline view for investigation events

## Architecture

The application uses React Router's Data mode for client-side routing with a centralized layout structure. All pages are lazy-loaded and feature smooth transitions powered by Motion.
