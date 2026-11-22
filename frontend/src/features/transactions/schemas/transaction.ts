import { z } from "zod";

export const transactionSchema = z.object({
  id: z.string(),
  agent_id: z.string(),
  recipient_address: z.string(),
  amount_usdc: z.union([z.string(), z.number()]).transform(String),
  asset: z.string(),
  network: z.string(),
  status: z.string(),
  tx_hash: z.string().nullable(),
  created_at: z.string(),
  confirmed_at: z.string().nullable(),
});

export const transactionListSchema = z.array(transactionSchema);

export type Transaction = z.infer<typeof transactionSchema>;
