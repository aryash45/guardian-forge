"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { isConnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (isConnected) router.push("/dashboard");
  }, [isConnected, router]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      {/* Background gradient */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, #00d2ff08 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 text-center max-w-2xl">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
            style={{ background: "linear-gradient(135deg, #00d2ff, #0090b3)" }}
          >
            DS
          </div>
          <span className="text-xl font-bold tracking-tight">DeFi Sentinel</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4">
          Know your{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #00d2ff, #22c55e)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            liquidation risk
          </span>
          <br />before it hits.
        </h1>

        <p className="text-[var(--text-secondary)] text-lg mb-8 max-w-md mx-auto leading-relaxed">
          Real-time Aave V3 position monitoring with AI-powered risk analysis.
          Connect your wallet—see your health factor instantly.
        </p>

        <ConnectButton />

        {/* Stats */}
        <div className="flex items-center justify-center gap-8 mt-12 text-sm text-[var(--text-muted)]">
          <div>
            <span className="text-[var(--text-primary)] font-bold text-lg">3</span>
            <span className="ml-1">chains</span>
          </div>
          <div className="w-px h-6 bg-[var(--border)]" />
          <div>
            <span className="text-[var(--text-primary)] font-bold text-lg">Aave V3</span>
            <span className="ml-1">direct</span>
          </div>
          <div className="w-px h-6 bg-[var(--border)]" />
          <div>
            <span className="text-[var(--text-primary)] font-bold text-lg">AI</span>
            <span className="ml-1">advisor</span>
          </div>
        </div>
      </div>
    </main>
  );
}
