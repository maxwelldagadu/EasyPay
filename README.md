### This project is currently in development

## Phase 3: Agent conversations

Each agent has a persistent conversation for payment and configuration requests. The backend sends
the user message and the agent's non-secret policy context to Groq using `GROQ_API_KEY`;
`GROQ_MODEL` defaults to `openai/gpt-oss-20b`. Free usage is limited by Groq's current
[rate limits](https://console.groq.com/docs/rate-limits). Create a Groq API key and configure it in
`backend/.env` before using chat.
The supported planning network defaults to the Sepolia testnet and can be changed with
`ETHEREUM_TESTNET_NAME`.

Run the new conversation migration from the `backend` directory:

```powershell
alembic upgrade head
```

Payment messages produce policy-checked USDC proposals only. Phase 3 does not check live balances or
cumulative spend, authorize, or execute payments. Configuration proposals are revalidated by the
backend and applied only after the user explicitly confirms them in the agent conversation.