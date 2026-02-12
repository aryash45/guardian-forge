/**
 * GuardianForge Demo Simulation (Simplified)
 * 
 * Runs 3 test scenarios to demo: detect → LLM analyze → contract call
 */

import "dotenv/config";
import { ethers } from "ethers";
import Groq from "groq-sdk";

const config = {
  rpcUrl: process.env.RPC_URL || "https://rpc-amoy.polygon.technology/",
  privateKey: process.env.AGENT_PRIVATE_KEY || "",
  contractAddress: process.env.CONTRACT_ADDRESS || "",
  groqApiKey: process.env.GROQ_API_KEY || "",
};

const CONTRACT_ABI = [
  "function reportAnomaly(address wallet, uint256 anomalyType, uint256 riskScore) external",
  "function getWalletStatus(address wallet) external view returns (bool, uint256, uint256, uint256, uint8, uint256, uint256)",
];

const groq = new Groq({ apiKey: config.groqApiKey });

// Test scenarios
const scenarios = [
  { name: "🟢 Normal", wallet: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bB12", balanceChange: "-0.05" },
  { name: "🟡 Suspicious", wallet: "0x8ba1f109551bD432803012645Ac136ddd64DBA72", balanceChange: "-1.5" },
  { name: "🔴 Critical Drain", wallet: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc", balanceChange: "-8.2" },
];

async function assessRisk(wallet: string, balanceChange: string) {
  const prompt = `Blockchain security AI. Analyze:
Wallet: ${wallet}, Balance Change: ${balanceChange} ETH
Respond JSON only: {"riskScore": <0-100>, "anomalyType": <0-5>, "reasoning": "<brief>"}
Risk: large outflows = higher risk. 0-30 low, 31-50 moderate, 51-70 high, 71-100 critical`;

  const completion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama-3.3-70b-versatile",
    temperature: 0.1,
    max_tokens: 150,
  });

  const text = completion.choices[0]?.message?.content || "";
  const match = text.match(/\{[\s\S]*\}/);
  return match ? JSON.parse(match[0]) : { riskScore: 0, anomalyType: 0, reasoning: "Parse failed" };
}

async function run() {
  console.log("\n🧪 GuardianForge Demo Simulation\n");

  if (!config.privateKey || !config.contractAddress || !config.groqApiKey) {
    console.error("❌ Set AGENT_PRIVATE_KEY, CONTRACT_ADDRESS, GROQ_API_KEY in .env");
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(config.rpcUrl);
  const wallet = new ethers.Wallet(config.privateKey, provider);
  const contract = new ethers.Contract(config.contractAddress, CONTRACT_ABI, wallet);

  console.log(`Agent: ${wallet.address}\n`);

  for (const s of scenarios) {
    console.log(`━━━ ${s.name} ━━━`);
    console.log(`Wallet: ${s.wallet.slice(0, 12)}...`);
    console.log(`Balance Change: ${s.balanceChange} ETH`);

    const result = await assessRisk(s.wallet, s.balanceChange);
    console.log(`Risk Score: ${result.riskScore}/100`);
    console.log(`Analysis: ${result.reasoning}`);

    if (result.riskScore >= 50) {
      try {
        const tx = await contract.reportAnomaly(s.wallet, result.anomalyType || 5, result.riskScore);
        console.log(`✅ Contract TX: ${tx.hash}`);
        await tx.wait();
        
        const status = await contract.getWalletStatus(s.wallet);
        if (status[0]) console.log(`🔒 Wallet FROZEN!`);
      } catch (err: any) {
        console.log(`⚠️ Contract call: ${err.reason || err.message}`);
      }
    }
    console.log("");
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log("✅ Simulation complete! Check your frontend dashboard.\n");
}

run().catch(console.error);
