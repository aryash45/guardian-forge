# GuardianForge Setup & Deployment Guide

This guide walks you through deploying and running the complete GuardianForge system.

## 📋 Prerequisites

- **Node.js 18+** - Required for all packages
- **Polygon Amoy Testnet MATIC** - Get from [faucet](https://faucet.polygon.technology/)
- **Groq API Key** - Free tier available at [console.groq.com](https://console.groq.com/)
- **WalletConnect Project ID** - Get from [cloud.walletconnect.com](https://cloud.walletconnect.com/)

---

## 🚀 Quick Start (5 Minutes)

### 1️⃣ **Deploy Smart Contract**

```bash
cd contracts
npm install

# Create and configure .env
cp .env.example .env
# Add your PRIVATE_KEY to .env (must have Amoy MATIC)

# Deploy contract
npx hardhat run scripts/deploy.ts --network amoy
```

**Save the deployed address!** You'll need it for the next steps.

### 2️⃣ **Setup Frontend**

```bash
cd ../frontend
npm install

# Create environment file
cp .env.local.example .env.local
```

**Edit `frontend/.env.local`:**

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x[your_deployed_address]
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_id
```

**Run frontend:**

```bash
npm run dev
# Open https://localhost:3001 in your browser
```

### 3️⃣ **Setup AI Agent**

In a new terminal:

```bash
cd ../agent
npm install

# Create environment file
cp .env.example .env
```

**Edit `agent/.env`:**

```env
RPC_URL=https://rpc-amoy.polygon.technology/
AGENT_PRIVATE_KEY=0x[your_agent_private_key]
CONTRACT_ADDRESS=0x[your_deployed_address]
MONITORED_WALLETS=0xYourWallet1,0xYourWallet2
GROQ_API_KEY=gsk_[your_groq_api_key]
```

**Run agent:**

```bash
npm run dev
```

---

## 📁 Project Structure

```
guardian-forge/
├── contracts/           # Solidity smart contract
│   ├── contracts/
│   │   └── GuardianForgeAgent.sol
│   ├── scripts/
│   │   └── deploy.ts    # Deployment script
│   ├── hardhat.config.ts
│   └── package.json
│
├── frontend/            # Next.js web interface
│   ├── app/
│   │   ├── page.tsx     # Main landing page
│   │   ├── contract.ts  # Web3 contract utilities
│   │   ├── providers.tsx # Wagmi + RainbowKit config
│   │   └── layout.tsx
│   ├── index.html       # Standalone 3D landing page
│   ├── .env.local.example
│   ├── tsconfig.json
│   └── package.json
│
├── agent/              # AI monitoring agent
│   ├── agent.ts         # Main monitoring loop
│   ├── simulate.ts      # Demo simulation
│   ├── .env.example
│   └── package.json
│
└── README.md           # Project overview
```

---

## 🔧 Configuration Details

### Frontend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Deployed contract address | `0x742d35Cc6634C0532925a3b844Bc8e7595f40bD5` |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect project ID | `a1b2c3d4e5f6...` |
| `NEXT_PUBLIC_RPC_URL` | Polygon Amoy RPC endpoint | `https://rpc-amoy.polygon.technology/` |

### Agent Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `RPC_URL` | Blockchain RPC endpoint | `https://rpc-amoy.polygon.technology/` |
| `AGENT_PRIVATE_KEY` | Agent wallet private key | `0x1234...abcd` |
| `CONTRACT_ADDRESS` | Guardian forge contract | `0x742d...` |
| `MONITORED_WALLETS` | Comma-separated wallet list | `0xABC...,0xDEF...` |
| `GROQ_API_KEY` | Groq LLM API key | `gsk_...` |
| `POLL_INTERVAL` | Monitoring check interval (ms) | `30000` |
| `HIGH_RISK_THRESHOLD` | Auto-freeze threshold (0-100) | `70` |
| `AUTO_FREEZE_ENABLED` | Enable auto-freeze | `true` |

---

## 🧪 Testing & Simulation

### Run Agent Simulation (No Blockchain Required)

```bash
cd agent
npm install
npm run simulate
```

This runs a demo of the LLM-based risk assessment without interacting with the blockchain.

### Interact with Frontend

1. Open `http://localhost:3001`
2. Connect your wallet using the RainbowKit button
3. View 3D visualization (Torus Knot)
4. Set up guardians for your wallet
5. Monitor recovery requests

---

## 📊 System Components

### Smart Contract Features

✅ **Guardian Management**
- Add multiple guardians per wallet
- Configurable approval requirements
- Guardian activation/deactivation

✅ **Anomaly Detection**
- AI agent reports anomalies with risk scores (0-100)
- Auto-freeze at 70+ risk
- Event logging for all actions

✅ **Recovery Mechanism**
- **Fast-track (24h)**: AI-detected threats
- **Standard (7 days)**: Manual triggers
- Multi-signature approval system
- Recovery execution with ownership transfer

### Frontend Features

✅ **3D Visualization**
- Immersive Torus Knot scene
- Neon lighting (blue key + purple fill)
- Scroll-triggered camera animations
- GSAP smooth interactions

✅ **Web3 Integration**
- Wallet connection (RainbowKit/Wagmi)
- Contract interaction
- Transaction signing
- Real-time status updates

✅ **UI Components**
- Guardian setup interface
- Recovery request display
- Risk score dashboard
- Transaction history

### AI Agent Features

✅ **Real-time Monitoring**
- Continuous wallet activity tracking
- Anomaly pattern detection
- On-chain reporting

✅ **LLM-Based Risk Assessment**
- Groq Llama 3.3 70B model
- Context-aware threat analysis
- Explainable risk scoring

✅ **Alert System**
- Automated on-chain triggers
- Optional Telegram notifications
- Comprehensive logging

---

## 🔐 Security Considerations

### Private Key Safety

⚠️ **NEVER commit `.env` files to git!**

```bash
# Verify .gitignore includes:
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
```

### Contract Deployment

1. Use a dedicated agent wallet (not your main wallet)
2. Fund with testnet MATIC only
3. Test thoroughly on Amoy before mainnet
4. Verify contract on PolygonScan

### Agent Security

1. Rotate private keys periodically
2. Use environment-specific credentials
3. Enable API key rotation in Groq console
4. Monitor agent logs for unauthorized access

---

## 🐛 Troubleshooting

### "Contract not found" Error

```
❌ Error: Contract address is invalid or not deployed
✅ Solution: Check NEXT_PUBLIC_CONTRACT_ADDRESS in .env.local
```

### "Insufficient MATIC" Error

```
❌ Error: Insufficient balance for gas fees
✅ Solution: Get testnet MATIC from https://faucet.polygon.technology/
```

### "WalletConnect connection failed"

```
❌ Error: Project ID is missing or invalid
✅ Solution: Generate ID at https://cloud.walletconnect.com/ and add to .env.local
```

### Agent not reporting anomalies

```
❌ Agent stuck or silent
✅ Check:
  - GROQ_API_KEY is valid in .env
  - CONTRACT_ADDRESS is deployed
  - Agent private key has gas (MATIC)
  - Check logs: npm run dev (agent console)
```

### 3D Scene not rendering

```
❌ Black screen in frontend
✅ Check:
  - Browser console for WebGL errors
  - Three.js and GSAP are loading from CDN
  - No conflicting CSS styles
```

---

## 📈 Next Steps

1. **Customize Guardian Recovery**: Add additional checks or customizable delays
2. **Enhanced Dashboard**: Add charts for risk history and recovery trends
3. **Mobile App**: Extend to React Native for mobile notifications
4. **Mainnet Deployment**: Deploy to Polygon mainnet with proper audits
5. **Advanced AI**: Integrate additional threat intelligence APIs
6. **Telegram Integration**: Full Telegram bot for recovery approvals

---

## 🔗 Useful Links

- [Polygon Amoy Testnet](https://wiki.polygon.technology/docs/develop/network-details/testnet-network/)
- [PolygonScan Amoy](https://amoy.polygonscan.com/)
- [Groq Console](https://console.groq.com/)
- [Hardhat Docs](https://hardhat.org/docs)
- [Wagmi Documentation](https://wagmi.sh/)
- [Three.js Docs](https://threejs.org/docs/)
- [GSAP Animation](https://gsap.com/)

---

## 💬 Support

For issues or questions:

1. Check this guide's troubleshooting section
2. Review contract events in PolygonScan
3. Check agent logs for detailed error messages
4. Ensure all dependencies are installed: `npm install` in each folder

---

**Version**: 1.0.0  
**Last Updated**: February 2026  
**Network**: Polygon Amoy Testnet
