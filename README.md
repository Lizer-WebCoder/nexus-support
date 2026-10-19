# Nexus Support

**Modern real-time customer support & ticketing command center.**

A clean, functional dashboard for support teams to monitor ticket volume, SLA health, agent status, and channel distribution — all in one place.

![Nexus Support](https://img.shields.io/badge/React-18-61DAFB?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript) ![Tailwind](https://img.shields.io/badge/Tailwind-3-38BDF8?logo=tailwindcss) ![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)

## Features

- **Live Command Bar** — Uptime, open conversations, average wait time, agents online, SLA score
- **Ticket Activity Chart** — 24-hour pulse with status breakdown (New / In Progress / Pending / Resolved / Breached)
- **Priority Distribution** — Critical, High, Medium, Low, On Hold, Unassigned
- **Channel Mix** — Email, Live Chat, Phone, Portal, Social (donut chart)
- **My Queue** — Personal ticket list with priority badges and status
- **Team Status** — Real-time agent availability and workload
- **Responsive sidebar navigation** with badge counts

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Recharts
- Lucide React icons

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:5173](http://localhost:5173) to view the dashboard.

## Project Structure

```
src/
├── components/
│   ├── Sidebar.tsx
│   ├── MetricBar.tsx
│   ├── TicketPulse.tsx
│   ├── Distribution.tsx
│   ├── ChannelMix.tsx
│   ├── MyQueue.tsx
│   └── TeamStatus.tsx
├── data.ts          # Mock data & types
├── App.tsx
├── main.tsx
└── index.css
```

## Customization

All mock data lives in `src/data.ts`. Replace the arrays and objects with real API responses to connect a backend.

## License

MIT
