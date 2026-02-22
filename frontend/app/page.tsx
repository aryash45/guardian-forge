"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useAccount, useReadContract } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
  formatAddress,
  getRiskLevelBadge,
  getExplorerUrl,
} from "./contract";

// ─── Risk Ring (SVG-based circular progress) ────────────────────────────────
function RiskRing({ score }: { score: number }) {
  const radius = 42;
  const circ = 2 * Math.PI * radius;
  const progress = circ - (score / 100) * circ;
  const badge = getRiskLevelBadge(score);

  const strokeColor =
    score >= 70 ? "#ff4444" :
    score >= 50 ? "#f97316" :
    score >= 30 ? "#f59e0b" :
    score > 0   ? "#00d2ff" : "#10b981";

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width="108" height="108" viewBox="0 0 108 108" className="rotate-[-90deg]">
        <circle cx="54" cy="54" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle
          cx="54" cy="54" r={radius} fill="none"
          stroke={strokeColor} strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={progress}
          style={{ transition: "stroke-dashoffset 1s ease, stroke 0.4s ease" }}
        />
      </svg>
      <div className="flex flex-col items-center -mt-1" style={{ marginTop: "-80px" }}>
        <span
          className="text-3xl font-black font-mono-code"
          style={{ color: strokeColor, fontFamily: "'JetBrains Mono', monospace" }}
        >
          {score}
        </span>
        <span className="text-xs font-semibold" style={{ color: strokeColor }}>/ 100</span>
      </div>
      <div style={{ marginTop: "40px" }}>
        <span className={`badge badge-${badge.label.toLowerCase()}`}>{badge.label}</span>
      </div>
    </div>
  );
}

// ─── Copy Button ─────────────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      style={{
        background: "rgba(0,210,255,0.08)",
        border: "1px solid rgba(0,210,255,0.2)",
        borderRadius: "6px",
        padding: "4px 10px",
        color: "#00d2ff",
        fontSize: "0.7rem",
        fontWeight: 600,
        cursor: "pointer",
        transition: "background 0.2s",
        letterSpacing: "0.05em",
      }}
    >
      {copied ? "✓ COPIED" : "COPY"}
    </button>
  );
}

// ─── Dot blink ───────────────────────────────────────────────────────────────
function LiveDot() {
  return (
    <span style={{ position: "relative", display: "inline-block", width: 8, height: 8 }}>
      <span style={{
        position: "absolute", inset: 0, borderRadius: "50%",
        background: "#10b981", animation: "ping 1.4s cubic-bezier(0,0,0.2,1) infinite",
      }} />
      <span style={{
        position: "absolute", inset: "1px", borderRadius: "50%", background: "#10b981",
      }} />
    </span>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Home() {
  const { address, isConnected } = useAccount();
  const [walletStatus, setWalletStatus] = useState<any>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Contract read
  const { data: walletData } = useReadContract({
    account: address,
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: "getWalletStatus",
    args: [address!],
    query: { enabled: isConnected && !!address },
  });

  useEffect(() => {
    if (walletData) {
      const [isFrozen, frozenAt, lastCheck, highestRisk, status, approvalCount, requiredCount] = walletData as any;
      setWalletStatus({
        isFrozen,
        frozenAt: Number(frozenAt),
        lastCheck: Number(lastCheck),
        highestRisk: Number(highestRisk),
        status: Number(status),
        approvalCount: Number(approvalCount),
        requiredCount: Number(requiredCount),
      });
    }
  }, [walletData]);

  // Intersection observer for fade-in-up
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("visible");
      }),
      { threshold: 0.1 }
    );
    document.querySelectorAll(".fade-in-up").forEach((el) => observerRef.current!.observe(el));
    return () => observerRef.current?.disconnect();
  }, []);

  const badge = walletStatus ? getRiskLevelBadge(walletStatus.highestRisk) : null;

  const threatBannerColor =
    !walletStatus || walletStatus.highestRisk === 0 ? { bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.25)", color: "#10b981", label: "ALL CLEAR — No threats detected" } :
    walletStatus.highestRisk < 30 ? { bg: "rgba(0,210,255,0.08)", border: "rgba(0,210,255,0.25)", color: "#00d2ff", label: "LOW RISK — Monitoring active" } :
    walletStatus.highestRisk < 50 ? { bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.25)", color: "#f59e0b", label: "MEDIUM RISK — Anomaly detected" } :
    walletStatus.highestRisk < 70 ? { bg: "rgba(249,115,22,0.1)", border: "rgba(249,115,22,0.3)", color: "#f97316", label: "HIGH RISK — Guardian response triggered" } :
    { bg: "rgba(255,68,68,0.1)", border: "rgba(255,68,68,0.3)", color: "#ff4444", label: "CRITICAL — Wallet freeze initiated" };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", position: "relative" }}>

      {/* ── Animated background ── */}
      <div className="hex-grid-bg" aria-hidden="true" />

      {/* ── Ping keyframe (inline so it doesn't pollute global CSS) ── */}
      <style>{`
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>

      {/* ══════════════════════════════════════
          NAV
      ═══════════════════════════════════════ */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 32px",
        background: "rgba(8,11,20,0.8)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "1.5rem" }}>🛡️</span>
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 800,
            fontSize: "1.1rem",
            letterSpacing: "-0.02em",
            background: "linear-gradient(135deg, #00d2ff 0%, #a78bfa 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            GuardianForge
          </span>
          <span style={{
            padding: "2px 8px",
            border: "1px solid rgba(0,210,255,0.3)",
            borderRadius: "4px",
            fontSize: "0.6rem",
            fontWeight: 700,
            color: "#00d2ff",
            letterSpacing: "0.1em",
          }}>
            BETA
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {isConnected && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", color: "#10b981" }}>
              <LiveDot />
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>ACTIVE</span>
            </div>
          )}
          <ConnectButton />
        </div>
      </nav>

      {/* ══════════════════════════════════════
          HERO
      ═══════════════════════════════════════ */}
      <section style={{
        minHeight: "100vh",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "120px 24px 80px",
        textAlign: "center",
        position: "relative", zIndex: 10,
      }}>

        {/* Eyebrow */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          padding: "6px 16px",
          border: "1px solid rgba(0,210,255,0.2)",
          borderRadius: "999px",
          background: "rgba(0,210,255,0.06)",
          marginBottom: "32px",
          fontSize: "0.72rem",
          fontWeight: 700,
          color: "#00d2ff",
          letterSpacing: "0.1em",
        }}>
          <LiveDot />
          AI-POWERED ON-CHAIN SECURITY
        </div>

        {/* Headline */}
        <h1
          className="glitch-title"
          data-text="Autonomous Wallet Guardian"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 900,
            fontSize: "clamp(2.4rem, 6vw, 5rem)",
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            color: "var(--text)",
            maxWidth: "820px",
            marginBottom: "24px",
          }}
        >
          Autonomous{" "}
          <span style={{
            background: "linear-gradient(135deg, #00d2ff 0%, #a78bfa 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            Wallet Guardian
          </span>
        </h1>

        {/* Sub */}
        <p style={{
          fontSize: "clamp(1rem, 2vw, 1.2rem)",
          color: "var(--muted)",
          maxWidth: "560px",
          lineHeight: 1.7,
          marginBottom: "48px",
        }}>
          Real-time anomaly detection powered by Groq AI. Freeze threats instantly.
          Let your guardians respond.{" "}
          <span style={{ color: "var(--text)" }}>All on-chain, fully transparent.</span>
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
          <button className="btn-primary" onClick={() => {
            document.getElementById("dashboard")?.scrollIntoView({ behavior: "smooth" });
          }}>
            View Dashboard →
          </button>
          <a
            href={getExplorerUrl(CONTRACT_ADDRESS, "address")}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost"
          >
            View Contract
          </a>
        </div>

        {/* Stats row */}
        <div style={{
          display: "flex", gap: "48px", marginTop: "80px",
          borderTop: "1px solid var(--border)",
          paddingTop: "40px",
          flexWrap: "wrap", justifyContent: "center",
        }}>
          {[
            { label: "Threat Response", value: "< 1 block" },
            { label: "Network", value: "Polygon Amoy" },
            { label: "Model", value: "Groq LLaMA" },
            { label: "Guardians", value: "M-of-N DAO" },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 700, fontSize: "1rem",
                color: "#00d2ff", marginBottom: "4px",
              }}>{s.value}</div>
              <div style={{ fontSize: "0.72rem", color: "var(--muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════════════ */}
      <section style={{
        position: "relative", zIndex: 10,
        padding: "80px 24px",
        maxWidth: "1100px", margin: "0 auto",
      }}>
        <div className="fade-in-up" style={{ textAlign: "center", marginBottom: "60px" }}>
          <span className="cyan-accent-line" style={{ margin: "0 auto 16px" }} />
          <h2 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 800, fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
            letterSpacing: "-0.02em", marginBottom: "12px",
          }}>How It Works</h2>
          <p style={{ color: "var(--muted)", maxWidth: "500px", margin: "0 auto", lineHeight: 1.7 }}>
            Three autonomous layers, always on.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
          {[
            {
              step: "01", icon: "👁️", title: "Monitor",
              color: "#00d2ff",
              desc: "The Groq LLM agent continuously watches wallet activity — transaction size, frequency, contract risk scores, and signature patterns — across every block.",
            },
            {
              step: "02", icon: "⚡", title: "Detect",
              color: "#a78bfa",
              desc: "On anomaly detection, a risk score (0–100) is computed and written on-chain via the GuardianForgeAgent contract. Scores above threshold auto-trigger the response protocol.",
            },
            {
              step: "03", icon: "🔐", title: "Respond",
              color: "#10b981",
              desc: "Guardians are notified. M-of-N multi-sig approval. If quorum is reached, the wallet is frozen and recovery to a safe address is initiated — all trustless.",
            },
          ].map((card) => (
            <div key={card.step} className="glass-card fade-in-up" style={{ padding: "32px", position: "relative", overflow: "hidden" }}>
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: "2px",
                background: `linear-gradient(90deg, ${card.color}, transparent)`,
              }} />
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: "var(--muted-2)", fontSize: "0.75rem", fontWeight: 700,
                marginBottom: "16px", letterSpacing: "0.1em",
              }}>{card.step}</div>
              <div style={{ fontSize: "2rem", marginBottom: "16px" }}>{card.icon}</div>
              <h3 style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700, fontSize: "1.3rem", color: card.color, marginBottom: "12px",
              }}>{card.title}</h3>
              <p style={{ color: "var(--muted)", lineHeight: 1.7, fontSize: "0.9rem" }}>{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════
          DASHBOARD (connected) or CONNECT PROMPT
      ═══════════════════════════════════════ */}
      <section id="dashboard" style={{
        position: "relative", zIndex: 10,
        padding: "80px 24px 120px",
        maxWidth: "1100px", margin: "0 auto",
      }}>

        {isConnected && address ? (
          <>
            {/* Threat banner */}
            {walletStatus && (
              <div className="fade-in-up" style={{
                background: threatBannerColor.bg,
                border: `1px solid ${threatBannerColor.border}`,
                borderRadius: "12px",
                padding: "16px 24px",
                marginBottom: "32px",
                display: "flex", alignItems: "center", gap: "12px",
              }}>
                <div style={{
                  width: 10, height: 10, borderRadius: "50%",
                  background: threatBannerColor.color,
                  boxShadow: `0 0 8px ${threatBannerColor.color}`,
                  flexShrink: 0,
                }} />
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 700, fontSize: "0.8rem",
                  color: threatBannerColor.color, letterSpacing: "0.06em",
                }}>
                  {threatBannerColor.label}
                </span>
                <span style={{ marginLeft: "auto", fontSize: "0.75rem", color: "var(--muted)" }}>
                  Last check: {walletStatus.lastCheck ? new Date(walletStatus.lastCheck * 1000).toLocaleTimeString() : "—"}
                </span>
              </div>
            )}

            <div className="fade-in-up" style={{ marginBottom: "24px" }}>
              <span className="cyan-accent-line" />
              <h2 style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 800, fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
                letterSpacing: "-0.02em",
              }}>Security Dashboard</h2>
            </div>

            {/* Stats grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>

              {/* Wallet card */}
              <div className="glass-card fade-in-up" style={{ padding: "28px" }}>
                <p style={{ fontSize: "0.72rem", color: "var(--muted)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "16px" }}>
                  Monitored Wallet
                </p>
                <p style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "1.05rem", fontWeight: 700, color: "#00d2ff", marginBottom: "12px",
                }}>
                  {formatAddress(address, 6)}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <a
                    href={getExplorerUrl(address, "address")}
                    target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: "0.75rem", color: "var(--muted)" }}
                  >
                    View on PolygonScan ↗
                  </a>
                  <CopyButton text={address} />
                </div>
              </div>

              {/* Risk Score card */}
              {walletStatus && (
                <div className="glass-card fade-in-up" style={{ padding: "28px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <p style={{ fontSize: "0.72rem", color: "var(--muted)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "20px", alignSelf: "flex-start" }}>
                    Risk Score
                  </p>
                  <RiskRing score={walletStatus.highestRisk} />
                </div>
              )}

              {/* Wallet status card */}
              {walletStatus && (
                <div className="glass-card fade-in-up" style={{ padding: "28px" }}>
                  <p style={{ fontSize: "0.72rem", color: "var(--muted)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "16px" }}>
                    Wallet Status
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>Freeze Status</span>
                      <span className={`badge ${walletStatus.isFrozen ? "badge-critical" : "badge-safe"}`}>
                        {walletStatus.isFrozen ? "🔒 FROZEN" : "🔓 ACTIVE"}
                      </span>
                    </div>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                        <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>Guardian Approvals</span>
                        <span style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: "0.85rem", fontWeight: 700, color: "var(--text)",
                        }}>
                          {walletStatus.approvalCount}/{walletStatus.requiredCount}
                        </span>
                      </div>
                      {walletStatus.requiredCount > 0 && (
                        <div style={{
                          height: "6px", borderRadius: "3px",
                          background: "var(--surface-2)", overflow: "hidden",
                        }}>
                          <div style={{
                            height: "100%", borderRadius: "3px",
                            background: "linear-gradient(90deg, #00d2ff, #a78bfa)",
                            width: `${(walletStatus.approvalCount / walletStatus.requiredCount) * 100}%`,
                            transition: "width 0.8s ease",
                          }} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (

          /* ── Connect Prompt ── */
          <div className="fade-in-up" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            <div style={{
              width: "120px", height: "120px", borderRadius: "50%",
              border: "1px solid rgba(0,210,255,0.2)",
              background: "rgba(0,210,255,0.05)",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: "32px", fontSize: "3.5rem",
            }} className="shield-pulse">
              🛡️
            </div>

            <h2 style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 800, fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
              letterSpacing: "-0.02em", marginBottom: "16px",
            }}>
              Connect to Activate Guardian
            </h2>
            <p style={{
              color: "var(--muted)", maxWidth: "420px", lineHeight: 1.7, marginBottom: "36px",
            }}>
              Connect your wallet to see your real-time threat level, risk score, and guardian status.
            </p>

            {/* Contract info */}
            <div className="glass-card" style={{
              padding: "24px 32px", maxWidth: "480px", width: "100%", marginBottom: "32px",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
                <div>
                  <p style={{ fontSize: "0.72rem", color: "var(--muted)", fontWeight: 700, letterSpacing: "0.1em", marginBottom: "8px", textTransform: "uppercase" }}>
                    Deployed Contract
                  </p>
                  <p style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "0.85rem", color: "#00d2ff", fontWeight: 600,
                  }}>
                    {formatAddress(CONTRACT_ADDRESS, 8)}
                  </p>
                  <p style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: "4px" }}>
                    Polygon Amoy Testnet
                  </p>
                </div>
                <CopyButton text={CONTRACT_ADDRESS} />
              </div>
            </div>

            <div className="flex justify-center">
              <ConnectButton />
            </div>
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════ */}
      <footer style={{
        position: "relative", zIndex: 10,
        borderTop: "1px solid var(--border)",
        padding: "24px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: "12px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "1rem" }}>🛡️</span>
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700, fontSize: "0.85rem",
            background: "linear-gradient(135deg, #00d2ff 0%, #a78bfa 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            GuardianForge
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <a
            href={getExplorerUrl(CONTRACT_ADDRESS, "address")}
            target="_blank" rel="noopener noreferrer"
            style={{ fontSize: "0.78rem", color: "var(--muted)", textDecoration: "none" }}
          >
            Contract ↗
          </a>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: "4px",
            padding: "3px 10px",
            border: "1px solid rgba(139,92,246,0.3)",
            borderRadius: "4px",
            fontSize: "0.68rem", fontWeight: 700, color: "#a78bfa",
            letterSpacing: "0.08em",
          }}>
            POLYGON AMOY
          </span>
        </div>
      </footer>

    </div>
  );
}
