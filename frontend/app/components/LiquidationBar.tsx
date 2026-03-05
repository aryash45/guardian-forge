"use client";

import type { LiquidationInfo } from "../lib/api";

interface LiquidationBarProps {
  liquidations: LiquidationInfo[];
}

function getBarColor(pct: number): string {
  if (pct >= 50) return "#22c55e";
  if (pct >= 30) return "#eab308";
  if (pct >= 15) return "#f97316";
  return "#ef4444";
}

export default function LiquidationBar({ liquidations }: LiquidationBarProps) {
  if (liquidations.length === 0) return null;

  return (
    <div className="card">
      <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-4 uppercase tracking-wider">
        Liquidation Distance
      </h3>
      <div className="space-y-4">
        {liquidations.map((liq) => {
          const pct = Math.min(liq.percentDropToLiquidation, 100);
          const color = getBarColor(pct);

          return (
            <div key={liq.chain} className="animate-fade-in">
              <div className="flex justify-between items-center mb-2">
                <span className="capitalize text-sm font-medium">{liq.chain}</span>
                <span className="text-xs text-[var(--text-muted)]">
                  Collateral must drop{" "}
                  <span style={{ color }} className="font-bold">
                    {pct.toFixed(1)}%
                  </span>{" "}
                  to liquidate
                </span>
              </div>
              {/* Bar track */}
              <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, ${color}, ${color}88)`,
                    boxShadow: `0 0 10px ${color}44`,
                  }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-[var(--text-muted)]">
                  Liq. at ${liq.collateralAtLiquidation.toFixed(0)}
                </span>
                <span className="text-[10px] text-[var(--text-muted)]">
                  Current ${liq.totalCollateralUSD.toFixed(0)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
