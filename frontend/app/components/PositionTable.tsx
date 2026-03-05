"use client";

import type { Position } from "../lib/api";

interface PositionTableProps {
  positions: Position[];
}

const CHAIN_ICONS: Record<string, string> = {
  ethereum: "⟠",
  polygon: "⬡",
  arbitrum: "◆",
};

function formatUSD(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
}

export default function PositionTable({ positions }: PositionTableProps) {
  if (positions.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-[var(--text-secondary)] text-lg">No active positions found</p>
        <p className="text-[var(--text-muted)] text-sm mt-2">
          Connect a wallet with Aave V3 lending positions on Ethereum, Polygon, or Arbitrum
        </p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden p-0">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[var(--border)]">
            <th className="text-left text-xs text-[var(--text-muted)] font-medium p-4 uppercase tracking-wider">Chain</th>
            <th className="text-right text-xs text-[var(--text-muted)] font-medium p-4 uppercase tracking-wider">Collateral</th>
            <th className="text-right text-xs text-[var(--text-muted)] font-medium p-4 uppercase tracking-wider">Debt</th>
            <th className="text-right text-xs text-[var(--text-muted)] font-medium p-4 uppercase tracking-wider">Available</th>
            <th className="text-right text-xs text-[var(--text-muted)] font-medium p-4 uppercase tracking-wider">LTV</th>
            <th className="text-right text-xs text-[var(--text-muted)] font-medium p-4 uppercase tracking-wider">Health</th>
          </tr>
        </thead>
        <tbody>
          {positions.map((pos) => {
            const hfColor =
              pos.healthFactor >= 2 ? "var(--green)" :
              pos.healthFactor >= 1.5 ? "var(--yellow)" :
              pos.healthFactor >= 1.2 ? "var(--orange)" : "var(--red)";

            return (
              <tr
                key={pos.chain}
                className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-card-hover)] transition-colors"
              >
                <td className="p-4">
                  <span className="flex items-center gap-2">
                    <span className="text-lg">{CHAIN_ICONS[pos.chain] || "●"}</span>
                    <span className="capitalize font-medium">{pos.chain}</span>
                  </span>
                </td>
                <td className="p-4 text-right font-mono text-sm text-[var(--green)]">
                  {formatUSD(pos.totalCollateralUSD)}
                </td>
                <td className="p-4 text-right font-mono text-sm text-[var(--red)]">
                  {formatUSD(pos.totalDebtUSD)}
                </td>
                <td className="p-4 text-right font-mono text-sm text-[var(--text-secondary)]">
                  {formatUSD(pos.availableBorrowsUSD)}
                </td>
                <td className="p-4 text-right font-mono text-sm">
                  {(pos.ltv * 100).toFixed(1)}%
                </td>
                <td className="p-4 text-right">
                  <span
                    className="font-bold font-mono"
                    style={{ color: hfColor }}
                  >
                    {pos.healthFactor >= 999 ? "∞" : pos.healthFactor.toFixed(2)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
