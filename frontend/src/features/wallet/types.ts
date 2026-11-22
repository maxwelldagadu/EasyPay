export interface WalletConnection {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  chainId: number | null;
  chainName: string | null;
  balanceUsdc: string | null;
  nativeBalance: string | null;
}

export interface WalletProvider {
  id: string;
  name: string;
  icon: string;
}

export interface TransactionRecord {
  id: string;
  amount_usdc: string;
  recipient_address: string;
  asset: string;
  network: string;
  status: string;
  tx_hash: string | null;
  created_at: string;
  confirmed_at: string | null;
}