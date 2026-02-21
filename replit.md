# Đếm Ngày Yêu (Love Day Counter)

## Overview

This is a **React Native / Expo** mobile application with an **Express.js** backend that helps couples track their relationship. The app counts days together, records memories (diary entries), tracks relationship milestones, and manages important dates. The UI is in Vietnamese.

Key features:
- **Love counter**: Real-time counting of days, months, years, hours, and minutes since the relationship started
- **Memory diary**: Create and manage diary entries with moods and photos
- **Milestones**: Track relationship milestones (1 week, 100 days, 1 year, etc.)
- **Important dates**: Track birthdays, anniversaries, and special dates
- **Daily love quotes**: Rotating Vietnamese love quotes

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (Expo / React Native)
- **Framework**: Expo SDK 54 with React Native 0.81, using the new architecture
- **Routing**: `expo-router` v6 with file-based routing and typed routes. The app uses a tab-based layout with 4 tabs: Home (Trang chủ), Diary (Nhật ký), Milestones (Cột mốc), Settings (Cài đặt)
- **State Management**: React Context (`LoveProvider` in `lib/love-context.tsx`) wraps the entire app, providing couple data, memories, dates, computed values (days in love, next milestone, etc.), and mutation functions
- **Data Fetching**: TanStack React Query v5 for server state management, with a custom `apiRequest` helper and `getQueryFn` factory in `lib/query-client.ts`
- **Animations**: `react-native-reanimated` for animations (e.g., pulsing heart on home screen)
- **UI Libraries**: `expo-linear-gradient`, `expo-blur`, `expo-image`, `expo-image-picker`, `@expo/vector-icons` (Ionicons)
- **Navigation extras**: `react-native-gesture-handler`, `react-native-screens`, `react-native-safe-area-context`, `react-native-keyboard-controller`

### Backend (Express.js)
- **Runtime**: Node.js with TypeScript (compiled via `tsx` in dev, `esbuild` for production)
- **Framework**: Express v5
- **API Pattern**: RESTful JSON API under `/api/` prefix
- **CORS**: Dynamic CORS setup supporting Replit domains and localhost for development
- **Static Serving**: In production, serves pre-built Expo web bundle; in development, proxies to Metro bundler

### API Routes
| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/couple` | Get the first couple record |
| POST | `/api/couple` | Create a new couple |
| PUT | `/api/couple/:id` | Update couple info |
| GET | `/api/memories/:coupleId` | List memories for a couple |
| POST | `/api/memories` | Create a memory |
| DELETE | `/api/memories/:id` | Delete a memory |
| GET | `/api/important-dates/:coupleId` | List important dates |
| POST | `/api/important-dates` | Create an important date |
| DELETE | `/api/important-dates/:id` | Delete an important date |

### Database
- **Database**: PostgreSQL (provisioned via Replit, connection via `DATABASE_URL` environment variable)
- **ORM**: Drizzle ORM with `drizzle-orm/node-postgres` driver
- **Schema** (`shared/schema.ts`): Three tables:
  - `couples`: id (UUID), partner1Name, partner2Name, startDate (text), createdAt
  - `memories`: id (UUID), coupleId, title, content, date, mood, photoUri, createdAt
  - `importantDates`: id (UUID), coupleId, title, date, type, createdAt
- **Validation**: `drizzle-zod` generates Zod schemas from Drizzle table definitions for insert validation
- **Migrations**: Managed via `drizzle-kit push` (push-based, no migration files needed for dev)

### Shared Code
- The `shared/` directory contains `schema.ts` which defines both database tables and TypeScript types, shared between frontend and backend
- Path aliases: `@/*` maps to project root, `@shared/*` maps to `./shared/*`

### Build & Deployment
- **Development**: Two parallel processes — `expo:dev` (Metro bundler) and `server:dev` (Express with tsx)
- **Production build**: `expo:static:build` creates a static web bundle, `server:build` bundles the server with esbuild, `server:prod` runs the production server
- **Landing page**: `server/templates/landing-page.html` serves as a fallback/loading page

### Design Decisions
- **Single couple model**: The app assumes one couple per instance (uses `getFirstCouple()` — no auth system). This simplifies the architecture for a personal/private use app.
- **Text dates**: Dates are stored as text strings (ISO format) rather than database date types, simplifying serialization between client and server.
- **UUID primary keys**: Generated server-side via PostgreSQL's `gen_random_uuid()`.
- **No authentication**: The app has no user auth — it's designed as a private instance for one couple.

## External Dependencies

### Services & Infrastructure
- **PostgreSQL Database**: Connected via `DATABASE_URL` environment variable (Replit-provisioned)
- **Replit Hosting**: Uses Replit-specific environment variables (`REPLIT_DEV_DOMAIN`, `REPLIT_DOMAINS`, `REPLIT_INTERNAL_APP_DOMAIN`) for domain configuration and CORS

### Key NPM Packages
- **expo** (~54.0.27): Core mobile framework
- **express** (^5.0.1): Backend HTTP server
- **drizzle-orm** (^0.39.3) + **drizzle-kit**: Database ORM and migration tooling
- **pg** (^8.16.3): PostgreSQL client driver
- **@tanstack/react-query** (^5.83.0): Async state management
- **date-fns** (^3.6.0): Date utility library (with Vietnamese locale)
- **zod** + **drizzle-zod**: Schema validation
- **patch-package**: Applied via postinstall for any necessary dependency patches