# 🛡️ GuardianForge

> **Autonomous AI Agent for Wallet Security & Guardian Recovery**

An AI-powered wallet protection system that monitors for real-time threats, rates risk using LLM, and escalates to guardians for on-chain recovery — faster than waiting for inactivity.

![Polygon Amoy](https://img.shields.io/badge/Polygon-Amoy%20Testnet-8247e5)
![Next.js 14](https://img.shields.io/badge/Next.js-14-black)
![Groq](https://img.shields.io/badge/LLM-Groq%20Llama%203.3-orange)

---

## 🎯 What Makes This Different

| Traditional (Argent/Safe) | GuardianForge                 |
| ------------------------- | ----------------------------- |
| Manual guardian triggers  | **AI auto-detects anomalies** |
| Wait for inactivity       | **Real-time threat response** |
| No risk assessment        | **LLM rates risk 0-100**      |
| No prevention             | **Auto-freeze at 70+ risk**   |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Polygon Amoy testnet MATIC (get from [faucet](https://faucet.polygon.technology/))
- [Groq API key](https://console.groq.com/) (free)
- [WalletConnect Project ID](https://cloud.walletconnect.com/)

### 1. Deploy Contract

```bash
cd contracts
npm install
cp .env.example .env
# Add your PRIVATE_KEY to .env

npx hardhat run scripts/deploy.ts --network amoy
# Note the deployed address!
```

### 2. Setup Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourDeployedAddress
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

Run:

```bash
npm run dev
# Open http://localhost:3000
```

### 3. Setup Agent

```bash
cd agent
npm install
cp .env.example .env
```

Edit `.env`:

```env
RPC_URL=https://rpc-amoy.polygon.technology/
AGENT_PRIVATE_KEY=your_private_key
CONTRACT_ADDRESS=0xYourDeployedAddress
MONITORED_WALLETS=0xYourWallet1,0xYourWallet2
GROQ_API_KEY=gsk_...
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

Run the agent:

```bash
npm run dev
```

Or run demo simulation:

```bash
npm run simulate
```

---

## 📱 Frontend Features

- **Wallet Connect** - RainbowKit on Polygon Amoy
- **Heartbeat Animation** - Pulsing green (safe) / red (threat)
- **Risk Meter** - 0-100 score from AI analysis
- **Alert Guardians Button** - Manual SOS trigger
- **Guardian Setup** - Add 3-5 guardian addresses

---

## 🤖 Agent Features

- **Wallet Polling** - Monitors balance/tx changes
- **Groq LLM** - Llama 3.3 70B for risk assessment
- **Smart Scoring** - 0-30 low, 31-50 moderate, 51-70 high, 71-100 critical
- **On-chain Reports** - Calls `reportAnomaly()` at 50+ risk
- **Auto-freeze** - Contract freezes wallet at 70+ risk
- **Telegram Alerts** - Instant notifications

---

## 🎮 Demo Flow

1. **Connect wallet** on frontend
2. **Add 3 guardians** → Save
3. **Run simulation**: `cd agent && npm run simulate`
4. Watch:
   - 🟢 Low risk → No action
   - 🟡 Medium risk → Telegram alert
   - 🔴 Critical risk → Contract call + freeze + Telegram

---

## 📁 Project Structure

```
guardian-forge/
├── contracts/           # Solidity smart contract
│   ├── GuardianForgeAgent.sol
│   └── scripts/deploy.ts
├── frontend/            # Next.js 14 dashboard
│   └── app/
│       ├── page.tsx     # Main dashboard
│       ├── providers.tsx # RainbowKit setup
│       └── contract.ts  # ABI & address
├── agent/               # Node.js AI agent
│   ├── agent.ts         # Main monitoring loop
│   └── simulate.ts      # Demo scenarios
└── README.md
```

---

## 🔐 Contract Functions

| Function                              | Description                        |
| ------------------------------------- | ---------------------------------- |
| `setGuardians(addresses[], required)` | Set guardian addresses             |
| `alertGuardians()`                    | Manual SOS (starts 24h fast-track) |
| `reportAnomaly(wallet, type, risk)`   | Agent reports threat               |
| `approveRecovery(wallet, newOwner)`   | Guardian approves                  |
| `executeRecovery(wallet)`             | Execute after delay                |

---

## 🌐 Environment Variables

### Frontend (`.env.local`)

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=...
```

### Agent (`.env`)

```env
RPC_URL=https://rpc-amoy.polygon.technology/
AGENT_PRIVATE_KEY=...
CONTRACT_ADDRESS=0x...
MONITORED_WALLETS=0x...,0x...
GROQ_API_KEY=gsk_...
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
```

---

## ⚙️ Tech Stack

- **Smart Contract**: Solidity 0.8.20 + Hardhat
- **Frontend**: Next.js 14 + Tailwind + Framer Motion
- **Wallet**: RainbowKit + Wagmi + Viem
- **AI**: Groq Llama 3.3 70B
- **Alerts**: Telegraf
- **Network**: Polygon Amoy Testnet

---

## 📄 License

MIT

---

**Built for hackathon demo** 🏆
