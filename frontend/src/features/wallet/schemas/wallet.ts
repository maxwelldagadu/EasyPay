import { z } from "zod";

export const walletAddressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, "Enter a valid Ethereum wallet address");

export const usdcAmountSchema = z
  .string()
  .regex(/^(?:0|[1-9]\d*)(?:.\d{1,6})?$/, "Enter a valid USDC amount (max 6 decimals)")
  .refine((val) => Number(val) > 0, "Amount must be greater than zero");

export const chainIdSchema = z.number().int().positive();

export type WalletAddress = z.infer<typeof walletAddressSchema>;
export type UsdcAmount = z.infer<typeof usdcAmountSchema>;