// Keep the frontend contract aligned with the public AgentRead schema, excluding all PIN material.
export interface Agent {
  id: string;
  name: string;
  description: string;
  responsibility: string;
  instructions: string;
  budget_usdc: string;
  max_transaction_usdc: string;
  daily_limit_usdc: string;
  weekly_limit_usdc: string;
  monthly_limit_usdc: string;
  max_transaction_count: number | null;
  approved_recipients: string[];
  restricted_recipients: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Model API failures explicitly so pages never disguise backend outages as empty data.
export interface AgentQueryResult<T> {
  data: T | null;
  error: string | null;
  status: number | null;
}
