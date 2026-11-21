"use client";

import { create } from "zustand";

import type { Agent } from "@/features/agents/types";

export type AgentConfigurationSnapshot = Pick<
  Agent,
  | "name"
  | "description"
  | "responsibility"
  | "instructions"
  | "budget_usdc"
  | "max_transaction_usdc"
  | "daily_limit_usdc"
  | "weekly_limit_usdc"
  | "monthly_limit_usdc"
  | "max_transaction_count"
  | "approved_recipients"
  | "restricted_recipients"
>;

export type AgentConfigurationChanges = Partial<AgentConfigurationSnapshot>;

interface AgentConfigurationStore {
  configurationsByAgent: Record<string, AgentConfigurationSnapshot>;
  initializeAgentConfiguration: (agent: Agent) => void;
  applyAgentConfiguration: (
    agent: Agent,
    changes: AgentConfigurationChanges,
  ) => void;
}

function snapshotAgentConfiguration(agent: Agent): AgentConfigurationSnapshot {
  return {
    name: agent.name,
    description: agent.description,
    responsibility: agent.responsibility,
    instructions: agent.instructions,
    budget_usdc: agent.budget_usdc,
    max_transaction_usdc: agent.max_transaction_usdc,
    daily_limit_usdc: agent.daily_limit_usdc,
    weekly_limit_usdc: agent.weekly_limit_usdc,
    monthly_limit_usdc: agent.monthly_limit_usdc,
    max_transaction_count: agent.max_transaction_count,
    approved_recipients: agent.approved_recipients,
    restricted_recipients: agent.restricted_recipients,
  };
}

export const useAgentConfigurationStore = create<AgentConfigurationStore>((set) => ({
  configurationsByAgent: {},
  initializeAgentConfiguration: (agent) => {
    set((state) => ({
      configurationsByAgent: {
        ...state.configurationsByAgent,
        [agent.id]: snapshotAgentConfiguration(agent),
      },
    }));
  },
  applyAgentConfiguration: (agent, changes) => {
    set((state) => ({
      configurationsByAgent: {
        ...state.configurationsByAgent,
        [agent.id]: {
          ...(state.configurationsByAgent[agent.id] ?? snapshotAgentConfiguration(agent)),
          ...changes,
        },
      },
    }));
  },
}));
