# EasyPay

EasyPay is a development-stage, AI-powered agentic payment platform for testnet USDC. Its core rule is: **AI interprets, the backend validates, the user authorizes, and the blockchain executes.**

## Phase 2: Agent management

The current dashboard foundation supports owner-scoped agent creation, editing, pause/reactivation, PIN rotation, and soft deletion. Each agent has its own instructions, USDC budget and limits, recipient permissions, and approval PIN. PINs are scrypt-hashed and never included in API responses. Deleted agents remain stored so later transaction history can still reference them.

The dashboard pages are feature-specific:

- `/dashboard` — agent overview
- `/agents` — list agents
- `/agents/new` — create an agent
- `/agents/[agentId]` — edit settings, change PIN, pause/reactivate, or delete
- `/approvals`, `/wallet`, `/transactions`, `/analytics`, `/scheduled-payments`, `/marketplace`, `/agent-requests`, and `/settings` — separated routes marked as upcoming until their phases are implemented

All dashboard mutations, including logout, go through Next.js Server Actions. FastAPI independently authenticates the Better Auth session and verifies ownership for agent operations.

## Local development

1. Copy `frontend/.env.example` to `frontend/.env.local` and `backend/.env.example` to `backend/.env`. Use the same randomly generated `BETTER_AUTH_SECRET` in both files (at least 32 characters), and fill in the Supabase database connection and Google OAuth credentials. Keep actual `.env` files out of source control.
2. From `backend`, apply schema migrations and start FastAPI:

   ```powershell
   alembic upgrade head
   uvicorn main:app --reload
   ```

3. From `frontend`, install dependencies and start Next.js:

   ```powershell
   npm install
   npm run dev
   ```

The FastAPI agent API is under `/api/v1/agents`; the existing Better Auth-backed session endpoint remains `/user_auth/session`.

## Validation

- Backend: from `backend`, run `python -m pytest`.
- Frontend lint: from `frontend`, run `npm run lint`.
- Frontend production build: from `frontend`, run `npm run build`.
