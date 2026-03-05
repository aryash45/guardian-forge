"use client";

import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import HealthGauge from "../components/HealthGauge";
import PositionTable from "../components/PositionTable";
import LiquidationBar from "../components/LiquidationBar";
import ChatPanel from "../components/ChatPanel";
import { fetchPositions, type Position, type LiquidationInfo } from "../lib/api";

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const router = useRouter();

  const [positions, setPositions] = useState<Position[]>([]);
  const [liquidations, setLiquidations] = useState<LiquidationInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not connected
  useEffect(() => {
    if (!isConnected) router.push("/");
  }, [isConnected, router]);

  // Fetch positions
  const loadPositions = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    setError(null);

    try {
      const data = await fetchPositions(address);
      setPositions(data.positions);
      setLiquidations(data.liquidations);
    } catch (err) {
      setError("Failed to load positions. Make sure the backend is running.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    loadPositions();
    // Refresh every 30 seconds
    const interval = setInterval(loadPositions, 30_000);
    return () => clearInterval(interval);
  }, [loadPositions]);

  // Aggregate health factor (worst across chains)
  const worstHF = positions.length > 0
    ? Math.min(...positions.map((p) => p.healthFactor))
    : 999;

  const totalCollateral = positions.reduce((sum, p) => sum + p.totalCollateralUSD, 0);
  const totalDebt = positions.reduce((sum, p) => sum + p.totalDebtUSD, 0);

  if (!isConnected) return null;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
            style={{ background: "linear-gradient(135deg, #00d2ff, #0090b3)" }}
          >
            DS
          </div>
          <span className="font-bold tracking-tight">DeFi Sentinel</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={loadPositions}
            disabled={loading}
            className="text-xs text-[var(--text-muted)] hover:text-[var(--cyan)] transition-colors cursor-pointer disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "↻ Refresh"}
          </button>
          <ConnectButton showBalance={false} chainStatus="icon" accountStatus="address" />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {error && (
          <div className="card mb-6 border-[var(--red)] bg-[#ef44440a]">
            <p className="text-[var(--red)] text-sm">{error}</p>
          </div>
        )}

        {loading && positions.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-[var(--cyan)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-[var(--text-muted)]">Loading positions across 3 chains...</p>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in">
            {/* Top row: Health Gauge + Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Health Gauge */}
              <div className="card flex items-center justify-center">
                <HealthGauge healthFactor={worstHF} />
              </div>

              {/* Summary Stats */}
              <div className="card flex flex-col justify-center gap-6">
                <div>
                  <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">
                    Total Collateral
                  </p>
                  <p className="text-2xl font-bold text-[var(--green)]">
                    ${totalCollateral.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">
                    Total Debt
                  </p>
                  <p className="text-2xl font-bold text-[var(--red)]">
                    ${totalDebt.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">
                    Net Position
                  </p>
                  <p className="text-2xl font-bold">
                    ${(totalCollateral - totalDebt).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              {/* Liquidation Bars */}
              <LiquidationBar liquidations={liquidations} />
            </div>

            {/* Position Table */}
            <div className="mb-6">
              <PositionTable positions={positions} />
            </div>

            {/* AI Chat */}
            {address && (
              <div>
                <ChatPanel walletAddress={address} />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
