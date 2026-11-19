# EasyPay

EasyPay is a testnet-only, AI-assisted USDC payment platform. The AI proposes transactions and configuration changes; the backend validates every proposal; the user authorizes it with an agent-specific PIN; and the blockchain execution engine submits the payment.

## Development structure

- `frontend/`: Next.js, Better Auth, React, Tailwind CSS, and shadcn/ui.
- `backend/`: FastAPI, SQLAlchemy, Pydantic, Alembic, authorization, and future payment services.
- `contracts/`: Smart contracts and contract deployment tests.
- `docs/`: Architecture and operational documentation.

## Phase 1 setup

1. Copy `.env.example` to `.env` at the repository root and fill the Supabase/Google values.
2. Copy `frontend/.env.example` to `frontend/.env.local`.
3. Copy `backend/.env.example` to `backend/.env`.
4. Start the frontend:
   ```powershell
   cd frontend
   npm install
   npm run dev
   ```
5. Start the backend:
   ```powershell
   cd backend
   .\.venv\Scripts\python.exe -m uvicorn main:app --reload
   ```
6. Run the frontend build and backend tests.

Better Auth manages identity tables in Supabase. The backend owns application tables and migrations under `backend/alembic`.
