# WEZ Game Counts Platform

A high-performance, professional wildlife management and survey platform built for **Wildlife & Environment Zimbabwe (WEZ)**.

## 🏗 Architecture Overview

This platform is a Next.js 15 (App Router) application designed for robust data collection, elite analytics, and geospatial visualization.

### Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom Design Tokens
- **Design System**: shadcn/ui + Lucide React
- **Analytics**: Tremor.so
- **Validation**: Zod
- **Database/Auth**: Supabase
- **Mapping**: MapLibre GL JS / Google Maps API

### Directory Structure
```text
/src
  /app           # Next.js App Router (Routes, Layouts, Actions)
  /components    # Modular React Components
    /ui          # Professional-grade UI primitives (shadcn)
    /charts      # Higher-level Tremor/ChartJS analytics
    /maps        # Geospatial components
  /lib           # Core utilities and shared logic
    /utils.ts    # Styling & general helpers
    /schemas     # Zod validation schemas
    /supabase    # Database client & types
  /hooks         # Reusable business logic hooks
  /types         # Global Type definitions
```

## 🚀 Key Features

1. **Digital Field Survey**: Robust, validatable data entry for field observations.
2. **Elite Analytics**: KPI dashboards and trend visualization for conservation efforts.
3. **Geospatial Intelligence**: Satellite-based mapping for tracking survey areas and sightings.
4. **Server-Safe Logic**: Move complex data processing to the edge via Server Actions.

## 🛠 Setup & Installation

```bash
npm install
npm run dev
```
