# Workspace

## Overview

pnpm workspace monorepo using TypeScript. GURU HOST — a premium WhatsApp bot hosting platform with Heroku integration.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite, Tailwind CSS, Framer Motion, Shadcn UI
- **Auth**: JWT (bcryptjs + jsonwebtoken)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── guru-host/          # GURU HOST React frontend
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## GURU HOST Features

### User Features
- Registration with country selection and Heroku API key
- 1 free deployment for new users, then 50 GRU per deployment
- GRU credits displayed with local currency equivalent
- Bot catalog (GURU-MD currently, more via admin)
- Deploy bots with base64 session ID + custom env vars
- Full deployment management: restart, pause, resume, delete
- Live log streaming from Heroku
- Payment submission with screenshot upload (M-Pesa)

### Admin Features
- Admin login at /admin (username: guruadmin, password: GuruHost2024!)
- Platform statistics dashboard
- User management + manual account funding
- Payment approval/rejection with screenshot viewing
- Deployment monitoring across all users
- Bot catalog management (add/remove bots)

## Database Schema

Tables:
- `users` — User accounts with Heroku API key, GRU credits, country, currency
- `bots` — Bot catalog (GURU-MD seeded)
- `deployments` — Bot deployments linked to Heroku apps
- `payments` — Payment requests with screenshot URLs
- `sessions` — Auth sessions

## API Routes

- `POST /api/auth/register` — Register user
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Get current user
- `GET /api/deployments` — List user's deployments
- `POST /api/deployments` — Create deployment (triggers Heroku)
- `GET /api/deployments/:id/logs` — Fetch Heroku logs
- `POST /api/deployments/:id/restart` — Restart Heroku dyno
- `POST /api/deployments/:id/pause` — Scale to 0 dynos
- `POST /api/deployments/:id/resume` — Scale to 1 dyno
- `DELETE /api/deployments/:id` — Delete app from Heroku
- `GET /api/bots` — Get bot catalog
- `POST /api/payments/submit` — Submit payment screenshot
- `POST /api/admin/login` — Admin login
- `POST /api/admin/payments/:id/approve` — Approve payment + add GRU
- `POST /api/admin/users/:id/fund` — Manually fund user GRU

## Currency System

1 GRU = 1 KES, 3.5 NGN, 0.02 USD, 0.02 GBP, 0.02 EUR, 2 ZAR, 0.05 GHS, 3 UGX

## Heroku Integration

- Detects personal vs team API key automatically
- Creates Heroku apps with unique names (guru-bot-{uuid})
- Sets SESSION_ID and custom env vars
- Builds from GitHub repo URL (main branch)
- 24/7 uptime via Heroku eco/basic dynos

## Admin Credentials

- Username: `guruadmin`
- Password: `GuruHost2024!`
- Access at: `/admin`
