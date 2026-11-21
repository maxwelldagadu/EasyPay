import { z } from "zod";

const paymentProposalSchema = z.object({
  type: z.literal("payment"),
  status: z.enum(["proposal_only", "blocked", "incomplete"]),
  amount_usdc: z.string().nullable(),
  recipient_address: z.string().nullable(),
  asset: z.string(),
  network: z.string(),
  checks: z.array(z.string()),
  issues: z.array(z.string()),
  warnings: z.array(z.string()),
});

const configurationChangesSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  responsibility: z.string().optional(),
  instructions: z.string().optional(),
  budget_usdc: z.union([z.string(), z.number()]).transform(String).optional(),
  max_transaction_usdc: z.union([z.string(), z.number()]).transform(String).optional(),
  daily_limit_usdc: z.union([z.string(), z.number()]).transform(String).optional(),
  weekly_limit_usdc: z.union([z.string(), z.number()]).transform(String).optional(),
  monthly_limit_usdc: z.union([z.string(), z.number()]).transform(String).optional(),
  max_transaction_count: z.number().int().positive().nullable().optional(),
  approved_recipients: z.array(z.string()).optional(),
  restricted_recipients: z.array(z.string()).optional(),
}).strict();

const configurationProposalSchema = z.object({
  type: z.literal("configuration"),
  changes: configurationChangesSchema,
  current_values: configurationChangesSchema,
});

export const conversationMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  proposal: z.discriminatedUnion("type", [
    paymentProposalSchema,
    configurationProposalSchema,
  ]).nullable(),
  proposal_status: z.enum(["pending", "applied", "dismissed"]).nullable(),
  created_at: z.string(),
});

export const conversationMessagesSchema = z.array(conversationMessageSchema);

export const conversationTurnSchema = z.object({
  user_message: conversationMessageSchema,
  assistant_message: conversationMessageSchema,
});

export type ConversationMessage = z.infer<typeof conversationMessageSchema>;
export type PaymentProposal = z.infer<typeof paymentProposalSchema>;
export type ConfigurationProposal = z.infer<typeof configurationProposalSchema>;
