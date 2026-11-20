import { z } from "zod";

const amountField = z
  .string()
  .trim()
  .regex(/^\d+(?:\.\d{1,6})?$/, "Use a positive USDC amount with up to 6 decimal places")
  .refine((value) => Number(value) > 0, "Amount must be greater than zero");

const recipientField = z.string().max(25_000);

function validateRecipientLines(value: string, context: z.RefinementCtx) {
  // Match the backend's strict Ethereum address shape before sending a permission list.
  const recipients = value
    .split(/\r?\n/)
    .map((address) => address.trim())
    .filter(Boolean);
  const normalized = recipients.map((address) => address.toLowerCase());

  if (recipients.some((address) => !/^0x[a-fA-F0-9]{40}$/.test(address))) {
    context.addIssue({
      code: "custom",
      message: "Enter one valid 0x wallet address per line",
    });
  }
  if (new Set(normalized).size !== normalized.length) {
    context.addIssue({ code: "custom", message: "Remove duplicate wallet addresses" });
  }
}

// Validate the agent configuration in the browser and repeat validation in server actions.
export const agentFormSchema = z
  .object({
    name: z.string().trim().min(2, "Enter at least 2 characters").max(100),
    description: z.string().max(1000),
    responsibility: z.string().trim().min(2, "Enter at least 2 characters").max(160),
    instructions: z.string().max(4000),
    budget_usdc: amountField,
    max_transaction_usdc: amountField,
    daily_limit_usdc: amountField,
    weekly_limit_usdc: amountField,
    monthly_limit_usdc: amountField,
    max_transaction_count: z
      .string()
      .trim()
      .refine((value) => value === "" || /^[1-9]\d*$/.test(value), "Use a positive whole number"),
    approved_recipients: recipientField.superRefine(validateRecipientLines),
    restricted_recipients: recipientField.superRefine(validateRecipientLines),
  })
  .superRefine((values, context) => {
    // Keep every individual and period restriction within the configured total budget.
    const total = Number(values.budget_usdc);
    const limits = [
      values.max_transaction_usdc,
      values.daily_limit_usdc,
      values.weekly_limit_usdc,
      values.monthly_limit_usdc,
    ];
    if (limits.some((limit) => Number(limit) > total)) {
      context.addIssue({
        code: "custom",
        path: ["budget_usdc"],
        message: "The total budget must be at least as large as every configured limit",
      });
    }

    // Prevent the same wallet from appearing in both permission lists.
    const approved = new Set(
      values.approved_recipients
        .split(/\r?\n/)
        .map((address) => address.trim().toLowerCase())
        .filter(Boolean),
    );
    if (
      values.restricted_recipients
        .split(/\r?\n/)
        .map((address) => address.trim().toLowerCase())
        .some((address) => approved.has(address))
    ) {
      context.addIssue({
        code: "custom",
        path: ["restricted_recipients"],
        message: "A wallet cannot be both approved and restricted",
      });
    }
  });

// Keep the initial PIN outside the editable configuration form so it is write-only at creation.
export const createAgentFormSchema = agentFormSchema.extend({
  approval_pin: z.string().regex(/^\d{4}$/, "Enter exactly 4 digits"),
  confirm_pin: z.string().regex(/^\d{4}$/, "Enter exactly 4 digits"),
}).refine((values) => values.approval_pin === values.confirm_pin, {
  path: ["confirm_pin"],
  message: "PIN confirmation does not match",
});

// Define the step-up PIN rotation form independently from routine agent configuration updates.
export const changePinFormSchema = z
  .object({
    current_pin: z.string().regex(/^\d{4}$/, "Enter exactly 4 digits"),
    new_pin: z.string().regex(/^\d{4}$/, "Enter exactly 4 digits"),
    confirm_pin: z.string().regex(/^\d{4}$/, "Enter exactly 4 digits"),
  })
  .refine((values) => values.new_pin === values.confirm_pin, {
    path: ["confirm_pin"],
    message: "PIN confirmation does not match",
  });

export type AgentFormValues = z.infer<typeof agentFormSchema>;
export type CreateAgentFormValues = z.infer<typeof createAgentFormSchema>;
export type ChangePinFormValues = z.infer<typeof changePinFormSchema>;
