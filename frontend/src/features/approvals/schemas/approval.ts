import { z } from "zod";

const decimal = z.union([z.string(), z.number()]).transform(String);

export const testnetBalanceSchema = z.object({
  balance_usdc: decimal,
  updated_at: z.string(),
});

export const paymentApprovalSchema = z.object({
  id: z.string(),
  agent_id: z.string(),
  agent_name: z.string(),
  original_instruction: z.string(),
  recipient_address: z.string(),
  amount_usdc: decimal,
  asset: z.string(),
  network: z.string(),
  status: z.enum(["pending", "approved", "rejected", "expired"]),
  expires_at: z.string(),
  approved_at: z.string().nullable(),
  rejected_at: z.string().nullable(),
  remaining_budget_usdc: decimal,
  available_balance_usdc: decimal,
  created_at: z.string(),
  updated_at: z.string(),
});

export const paymentApprovalsSchema = z.array(paymentApprovalSchema);

export type TestnetBalance = z.infer<typeof testnetBalanceSchema>;
export type PaymentApproval = z.infer<typeof paymentApprovalSchema>;
