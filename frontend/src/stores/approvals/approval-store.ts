"use client";

import { create } from "zustand";

import type {
  PaymentApproval,
  TestnetBalance,
} from "@/features/approvals/schemas/approval";

interface ApprovalStore {
  approvals: PaymentApproval[];
  balance: TestnetBalance | null;
  initialize: (approvals: PaymentApproval[], balance: TestnetBalance) => void;
  setBalance: (balance: TestnetBalance) => void;
  upsertApproval: (approval: PaymentApproval) => void;
  removePendingApproval: (approvalId: string) => void;
  clear: () => void;
}

export const useApprovalStore = create<ApprovalStore>((set) => ({
  approvals: [],
  balance: null,
  initialize: (approvals, balance) => set({ approvals, balance }),
  setBalance: (balance) => set({ balance }),
  upsertApproval: (approval) =>
    set((state) => ({
      approvals: [
        approval,
        ...state.approvals.filter((item) => item.id !== approval.id),
      ],
    })),
  removePendingApproval: (approvalId) =>
    set((state) => ({
      approvals: state.approvals.map((approval) =>
        approval.id === approvalId
          ? { ...approval, status: "rejected" }
          : approval,
      ),
    })),
  clear: () => set({ approvals: [], balance: null }),
}));
