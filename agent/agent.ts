/**
 * GuardianForge AI Agent (Simplified)
 * 
 * Monitors wallet activity for anomalies and uses Groq LLM for risk rating.
 * Triggers on-chain reportAnomaly() when threats are detected.
 */

import "dotenv/config";
import { ethers } from "ethers";
import Groq from "groq-sdk";

// ============ CONFIGURATION ============

const config = {
  rpcUrl: process.env.RPC_URL || "https://rpc-amoy.polygon.technology/",
  privateKey: process.env.AGENT_PRIVATE_KEY || "",
  contractAddress: process.env.CONTRACT_ADDRESS || "",
  monitoredWallets: (process.env.MONITORED_WALLETS || "").split(",").filter(Boolean),
  groqApiKey: process.env.GROQ_API_KEY || "",
  pollInterval: parseInt(process.env.POLL_INTERVAL || "30000"),
};

// ============ CONTRACT ABI ============

const CONTRACT_ABI = [
  "function reportAnomaly(address wallet, uint256 anomalyType, uint256 riskScore) external",
  "function getWalletStatus(address wallet) external view returns (bool isFrozen, uint256 frozenAt, uint256 lastCheck, uint256 highestRisk, uint8 recoveryStatus, uint256 approvalCount, uint256 requiredCount)",
];

// Anomaly types
enum AnomalyType {
  NONE = 0,
  LARGE_TRANSACTION = 1,
  FAILED_SIGNATURE = 2,
  SUSPICIOUS_CONTRACT = 3,
  RAPID_TRANSACTIONS = 4,
  HIGH_RISK_INTERACTION = 5,
}

// ============ GROQ LLM ============

const groq = new Groq({ apiKey: config.groqApiKey });

interface RiskAssessment {
  riskScore: number;
  anomalyType: AnomalyType;
  reasoning: string;
}

async function assessRisk(wallet: string, balanceChange: string): Promise<RiskAssessment> {
  try {
    const prompt = `You are a blockchain security AI. Analyze this wallet activity:

Wallet: ${wallet}
Balance Change: ${balanceChange} ETH

Respond ONLY with JSON (no markdown):
{"riskScore": <0-100>, "anomalyType": <0-5>, "reasoning": "<brief>"}

Risk: 0-30 low, 31-50 moderate, 51-70 high, 71-100 critical
AnomalyType: 0=NONE, 1=LARGE_TX, 2=FAILED_SIG, 3=SUS_CONTRACT, 4=RAPID_TX, 5=HIGH_RISK`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      max_tokens: 200,
    });

    const text = completion.choices[0]?.message?.content || "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return { riskScore: 0, anomalyType: 0, reasoning: "Parse failed" };
    
    const parsed = JSON.parse(match[0]);
    return {
      riskScore: Math.min(100, Math.max(0, parsed.riskScore)),
      anomalyType: parsed.anomalyType || 0,
      reasoning: parsed.reasoning || "",
    };
  } catch (error) {
    console.error("LLM error:", error);
    return { riskScore: 0, anomalyType: 0, reasoning: "LLM error" };
  }
}

// ============ WALLET STATE ============

const walletBalances: Map<string, bigint> = new Map();

// ============ MAIN LOOP ============

async function runAgent(): Promise<void> {
  console.log("\n🛡️  GuardianForge Agent Starting...\n");

  // Validate
  if (!config.privateKey || !config.contractAddress || !config.groqApiKey) {
    console.error("❌ Missing required env vars: AGENT_PRIVATE_KEY, CONTRACT_ADDRESS, GROQ_API_KEY");
    process.exit(1);
  }
  if (config.monitoredWallets.length === 0) {
    console.error("❌ No MONITORED_WALLETS configured");
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(config.rpcUrl);
  const wallet = new ethers.Wallet(config.privateKey, provider);
  const contract = new ethers.Contract(config.contractAddress, CONTRACT_ABI, wallet);

  console.log(`🔗 RPC: ${config.rpcUrl}`);
  console.log(`🤖 Agent: ${wallet.address}`);
  console.log(`📜 Contract: ${config.contractAddress}`);
  console.log(`👀 Monitoring: ${config.monitoredWallets.join(", ")}`);
  console.log("\n🚀 Monitoring started!\n");

  while (true) {
    for (const addr of config.monitoredWallets) {
      try {
        const balance = await provider.getBalance(addr);
        const prev = walletBalances.get(addr) || balance;
        const change = balance - prev;
        walletBalances.set(addr, balance);

        // Skip if no significant change
        if (Math.abs(Number(ethers.formatEther(change))) < 0.01) {
          console.log(`✅ ${addr.slice(0, 8)}... - No activity`);
          continue;
        }

        // Analyze with LLM
        console.log(`🔍 ${addr.slice(0, 8)}... - Activity detected!`);
        const assessment = await assessRisk(addr, ethers.formatEther(change));
        
        console.log(`   Risk: ${assessment.riskScore}/100`);
        console.log(`   Analysis: ${assessment.reasoning}`);

        // Report if risk >= 50
        if (assessment.riskScore >= 50) {
          console.log(`   📝 Reporting to contract...`);
          const tx = await contract.reportAnomaly(addr, assessment.anomalyType, assessment.riskScore);
          console.log(`   ✅ TX: ${tx.hash}`);
          await tx.wait();
        }
      } catch (err: any) {
        console.error(`❌ Error checking ${addr}: ${err.message}`);
      }
    }

    await new Promise(r => setTimeout(r, config.pollInterval));
  }
}

runAgent().catch(console.error);
