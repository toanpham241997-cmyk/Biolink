# replit.md

## Overview

This is a personal bio/link-in-bio web application with a playful, game-like design aesthetic. It displays a user profile with avatar, bio, skills, and organized categories of links (similar to Linktree). The application features a React frontend with smooth animations, a Node.js/Express backend, and PostgreSQL for data persistence. The design includes a whimsical cloud/sun background with light/dark theme support.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with CSS variables for theming
- **UI Components**: shadcn/ui component library (New York style) built on Radix UI primitives
- **Animations**: Framer Motion for smooth transitions and micro-interactions
- **Icons**: Lucide React for consistent iconography
- **Build Tool**: Vite with hot module replacement

### Backend Architecture
- **Runtime**: Node.js with Express 5
- **Language**: TypeScript with ES modules
- **API Design**: Simple REST endpoint (`/api/bio`) returning profile and nested categories/links
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Validation**: Zod with drizzle-zod for type-safe schemas

### Data Model
- **Profile**: Single user profile with name, bio, avatar URL, and skills array
- **Categories**: Ordered groups (e.g., "Personal Projects", "Social Media") with icon references
- **Links**: Individual links belonging to categories, with title, URL, icon, and order

### Project Structure
```
├── client/           # React frontend
│   ├── src/
│   │   ├── components/   # UI and feature components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utilities and query client
│   │   └── pages/        # Route pages
├── server/           # Express backend
│   ├── index.ts      # Server entry point
│   ├── routes.ts     # API route definitions
│   ├── storage.ts    # Database operations and seeding
│   └── db.ts         # Database connection
├── shared/           # Shared code between client/server
│   ├── schema.ts     # Drizzle table definitions
│   └── routes.ts     # API route contracts
└── migrations/       # Drizzle database migrations
```

### Key Design Patterns
- **Monorepo structure**: Client and server in single repository with shared types
- **Type-safe API**: Shared route definitions ensure frontend/backend consistency
- **Database seeding**: Automatic seed data on startup if database is empty
- **Path aliases**: `@/` for client source, `@shared/` for shared code

## External Dependencies

### Database
- **PostgreSQL**: Primary data store, connected via `DATABASE_URL` environment variable
- **Drizzle ORM**: Schema management and query building
- **connect-pg-simple**: PostgreSQL session store (available but not currently used)

### Frontend Libraries
- **@tanstack/react-query**: Server state management and caching
- **framer-motion**: Animation library for smooth UI transitions
- **lucide-react**: Icon library
- **Radix UI**: Headless UI primitives (accordion, dialog, dropdown, etc.)
- **tailwindcss**: Utility-first CSS framework

### Build & Development
- **Vite**: Frontend bundler with React plugin
- **esbuild**: Server bundling for production
- **tsx**: TypeScript execution for development
- **drizzle-kit**: Database migration tooling

### Required Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (required)