const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface Position {
  chain: string;
  totalCollateralUSD: number;
  totalDebtUSD: number;
  availableBorrowsUSD: number;
  currentLiquidationThreshold: number;
  ltv: number;
  healthFactor: number;
  hasPosition: boolean;
}

export interface LiquidationInfo {
  chain: string;
  healthFactor: number;
  totalCollateralUSD: number;
  totalDebtUSD: number;
  liquidationThreshold: number;
  percentDropToLiquidation: number;
  collateralAtLiquidation: number;
}

export interface PositionResponse {
  positions: Position[];
  liquidations: LiquidationInfo[];
}

export interface ChatResponse {
  response: string;
  context: { positionsFound: number; chains: string[] };
}

export interface Snapshot {
  chain: string;
  healthFactor: number;
  totalCollateral: number;
  totalDebt: number;
  timestamp: string;
}

// ── API Client ───────────────────────────────────────────────────────────────

export async function fetchPositions(address: string): Promise<PositionResponse> {
  const res = await fetch(`${API_URL}/api/positions/${address}`);
  if (!res.ok) throw new Error("Failed to fetch positions");
  return res.json();
}

export async function sendChatMessage(
  message: string,
  walletAddress: string
): Promise<ChatResponse> {
  const res = await fetch(`${API_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, walletAddress }),
  });
  if (!res.ok) throw new Error("Chat request failed");
  return res.json();
}

export async function fetchHistory(
  address: string,
  period: "24h" | "7d" | "30d" = "24h"
): Promise<{ snapshots: Snapshot[] }> {
  const res = await fetch(`${API_URL}/api/history/${address}?period=${period}`);
  if (!res.ok) throw new Error("Failed to fetch history");
  return res.json();
}

export async function createAlert(data: {
  walletAddress: string;
  chain: string;
  threshold: number;
  telegramChatId?: string;
}) {
  const res = await fetch(`${API_URL}/api/alerts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create alert");
  return res.json();
}
