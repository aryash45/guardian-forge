"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useBlockNumber, useBalance, useChainId } from "wagmi";

// Contract address from .env
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// Chain names
const CHAIN_NAMES: Record<number, string> = {
  1: "Ethereum",
  80002: "Polygon Amoy",
  31337: "Hardhat Local",
  137: "Polygon",
};

// Types
type Phase = "idle" | "monitoring" | "detecting" | "analyzing" | "alerting" | "frozen" | "recovering" | "safe";
type Scenario = "drainer" | "phishing" | "rugpull" | "seedloss";

const SCENARIOS = {
  drainer: {
    name: "Wallet Drainer",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    color: "text-red-500",
    description: "Malicious contract detection",
    threat: "DRAINER DETECTED",
    logs: [
      { text: "Unlimited approval request detected", type: "warning" },
      { text: "Contract hash matches known drainer", type: "danger" },
      { text: "Attempting 847 ETH transfer to 0xdead...", type: "danger" },
    ],
  },
  phishing: {
    name: "Phishing Attack",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
    color: "text-orange-500",
    description: "Fake dApp signature request",
    threat: "PHISHING ATTEMPT",
    logs: [
      { text: "Origin domain mismatch detected", type: "warning" },
      { text: "Malicious permit() signature request", type: "danger" },
      { text: "Domain: uniswap.org.fake.xyz", type: "danger" },
    ],
  },
  rugpull: {
    name: "Rug Pull",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-8a2 2 0 012-2h14a2 2 0 012 2v8M16 11V7a4 4 0 00-8 0v4M5 21l14-14" />
      </svg>
    ),
    color: "text-purple-500",
    description: "Token liquidity removal",
    threat: "RUG PULL IMMINENT",
    logs: [
      { text: "Token contract scan initiated", type: "info" },
      { text: "Owner can pause transfers", type: "danger" },
      { text: "Liquidity removal function found", type: "danger" },
    ],
  },
  seedloss: {
    name: "Lost Access",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    ),
    color: "text-yellow-500",
    description: "Social recovery protocol",
    threat: "RECOVERY MODE",
    logs: [
      { text: "Manual recovery requested", type: "info" },
      { text: "Waiting for guardian approval", type: "warning" },
      { text: "24h Timelock active", type: "info" },
    ],
  },
};

const GUARDIANS = [
  { name: "Alice", role: "Family Node", initials: "AL" },
  { name: "Bob", role: "Friend Node", initials: "BO" },
  { name: "Carol", role: "Cold Storage", initials: "CS" },
];

export default function Home() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: blockNumber } = useBlockNumber({ watch: true });
  const { data: balance } = useBalance({ address });
  
  const chainName = CHAIN_NAMES[chainId] || `Chain ${chainId}`;
  
  const [isDemo, setIsDemo] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [scenario, setScenario] = useState<Scenario>("drainer");
  const [riskScore, setRiskScore] = useState(5);
  const [guardians, setGuardians] = useState(GUARDIANS.map(g => ({ ...g, status: "pending" as "pending" | "notified" | "approved" })));
  const [logs, setLogs] = useState<{ text: string; type: string }[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showScenarios, setShowScenarios] = useState(false);

  // Auto-scroll logs
  const scrollRef = useCallback((node: HTMLDivElement) => {
    if (node) {
      node.scrollTop = node.scrollHeight;
    }
  }, [logs]);

  const addLog = useCallback((text: string, type: string = "info") => {
    setLogs(prev => [...prev.slice(-10), { text, type }]);
  }, []);

  const resetDemo = useCallback(() => {
    setPhase("idle");
    setRiskScore(5);
    setGuardians(GUARDIANS.map(g => ({ ...g, status: "pending" as const })));
    setLogs([]);
    setIsRunning(false);
  }, []);

  const runDemo = useCallback(async (selectedScenario: Scenario) => {
    if (isRunning) return;
    setIsRunning(true);
    setShowScenarios(false);
    resetDemo();
    setScenario(selectedScenario);
    setIsDemo(true);

    const delay = (ms: number) => new Promise(r => setTimeout(r, ms));
    const scenarioData = SCENARIOS[selectedScenario];

    // Phase 1: Monitoring
    setPhase("monitoring");
    addLog("SYSTEM INITIALIZED. SCANNING MEMPOOL...", "success");
    await delay(1000);
    
    // Phase 2: Detection
    setPhase("detecting");
    addLog(scenarioData.logs[0].text, scenarioData.logs[0].type);
    setRiskScore(35);
    await delay(1100);
    addLog(scenarioData.logs[1].text, scenarioData.logs[1].type);
    setRiskScore(58);
    await delay(1000);

    // Phase 3: AI Analysis
    setPhase("analyzing");
    addLog("GROQ AI: PATTERN MATCH CONFIRMED", "warning");
    setRiskScore(72);
    await delay(1200);
    addLog(scenarioData.logs[2].text, scenarioData.logs[2].type);
    setRiskScore(91);
    await delay(800);
    addLog(`CRITICAL THREAT: ${scenarioData.threat}`, "danger");

    // Phase 4: Freeze
    setPhase("frozen");
    const txHash = `0x${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    addLog("PROTOCOL OVERRIDE: WALLET FROZEN", "danger");
    addLog(`TX: ${txHash.slice(0, 10)}...${txHash.slice(-6)}`, "info");
    setRiskScore(95);
    await delay(900);

    // Phase 5: Alert Guardians
    setPhase("alerting");
    addLog("BROADCASTING TO GUARDIAN MESH...", "warning");
    await delay(700);

    for (let i = 0; i < guardians.length; i++) {
        await delay(500);
        setGuardians(prev => prev.map((g, idx) => idx === i ? { ...g, status: "notified" as const } : g));
        addLog(`NODE ${GUARDIANS[i].initials} NOTIFIED`, "info");
    }

    await delay(800);

    // Phase 6: Approvals
    setPhase("recovering");
    for (let i = 0; i < 2; i++) {
        await delay(900);
        setGuardians(prev => prev.map((g, idx) => idx === i ? { ...g, status: "approved" as const } : g));
        addLog(`SIG CONFIRMED: ${GUARDIANS[i].initials} (${i + 1}/2)`, "success");
    }

    await delay(600);
    addLog("QUORUM REACHED. EXECUTING RECOVERY...", "success");
    await delay(800);

    // Phase 7: Success
    setPhase("safe");
    setRiskScore(0);
    addLog("ASSETS SECURED. THREAT NEUTRALIZED.", "success");
    setIsRunning(false);
  }, [isRunning, addLog, resetDemo, guardians.length]);

  const currentScenario = SCENARIOS[scenario];
  const isCritical = ["frozen", "alerting", "recovering"].includes(phase);

  return (
    <div className="min-h-screen font-sans bg-background text-foreground overflow-hidden selection:bg-primary selection:text-black">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-secondary/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full mix-blend-screen" />
        {/* Nano Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:100px_100px] opacity-20" />
      </div>

      {/* Header */}
      <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             {/* Tech Banana Icon */}
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-black font-bold text-xl leading-none">
              🍌
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg tracking-tight leading-none text-white">
                GUARDIAN<span className="text-primary">FORGE</span>
              </span>
              <span className="text-[10px] tracking-[0.2em] text-secondary font-mono">NANO EDITION</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-4 text-xs font-mono text-slate-400">
               <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span>{chainName}</span>
               </div>
               {blockNumber !== undefined && <span>#{blockNumber.toString()}</span>}
            </div>

            {isDemo ? (
                <button 
                  onClick={() => { setIsDemo(false); resetDemo(); }}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary border border-primary/20 hover:bg-primary/10 rounded transition-colors"
                >
                  Exit Sim
                </button>
            ) : (
                <ConnectButton showBalance={false} />
            )}
          </div>
        </div>
      </header>

      <main className="relative pt-24 px-6 pb-12 max-w-7xl mx-auto min-h-screen flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {!isDemo ? (
            <motion.div 
              key="hero"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, filter: "blur(10px)" }}
              className="text-center max-w-4xl mx-auto"
            >
              {/* Hero Visual */}
              <motion.div 
                className="w-40 h-40 mx-auto mb-8 relative"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                 <div className="absolute inset-0 bg-primary/20 blur-[50px] rounded-full animate-pulse-banana" />
                 <div className="relative w-full h-full bg-gradient-to-br from-gray-900 to-black rounded-3xl border border-white/10 flex items-center justify-center text-7xl shadow-2xl glass-panel">
                    🍌
                    <div className="absolute top-2 right-2 w-3 h-3 bg-secondary rounded-full animate-ping" />
                 </div>
              </motion.div>

              <h1 className="text-6xl md:text-8xl font-display font-bold text-white mb-6 tracking-tight">
                POTASSIUM <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">POWERED</span>
              </h1>
              
              <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 font-mono">
                Next-gen AI agent protecting your wallet from drainers, scams, and slips. 
                Powered by <span className="text-primary">Groq</span> & <span className="text-secondary">Nano-Tech</span>.
              </p>

              <motion.button
                onClick={() => setShowScenarios(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-primary text-black font-bold text-lg px-8 py-4 rounded-full shadow-[0_0_30px_rgba(244,224,77,0.3)] hover:shadow-[0_0_50px_rgba(244,224,77,0.5)] transition-shadow"
              >
                INITIALIZE AGENT_
              </motion.button>

              <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                {[
                    { title: "AI SENTINEL", desc: "Real-time threat detection using large language models." },
                    { title: "NANO FREEZE", desc: "Instant automated transaction blocking protocol." },
                    { title: "SOCIAL MESH", desc: "Recover keys through trusted guardian nodes." }
                ].map((item, i) => (
                    <div key={i} className="glass-panel p-6 rounded-2xl hover:border-primary/30 transition-colors group">
                        <h3 className="font-display font-bold text-xl text-white mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                ))}
              </div>

            </motion.div>
          ) : (
            <motion.div
                key="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full max-w-6xl grid lg:grid-cols-12 gap-8"
            >
                {/* Main Monitor */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    {/* Status Display */}
                    <motion.div 
                        className={`glass-panel p-8 rounded-3xl relative overflow-hidden transition-colors duration-500`}
                        style={{
                            borderColor: phase === "frozen" ? "rgba(239, 68, 68, 0.5)" : 
                                         phase === "safe" ? "rgba(34, 197, 94, 0.5)" : "rgba(255, 255, 255, 0.1)"
                        }}
                    >   
                        <div className="absolute top-0 right-0 p-4 opacity-20">
                            <span className="text-9xl font-display font-bold text-white">{riskScore}</span>
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-2">
                                <div className={`w-3 h-3 rounded-full animate-pulse ${
                                    isCritical ? "bg-red-500 shadow-[0_0_10px_red]" : "bg-primary shadow-[0_0_10px_yellow]"
                                }`} />
                                <span className="font-mono text-sm tracking-widest text-slate-400 uppercase">System Status</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-2">
                                {phase === "idle" ? "SYSTEM READY" :
                                 phase === "monitoring" ? "SCANNING NETWORK" :
                                 phase === "detecting" ? "THREAT DETECTED" :
                                 phase === "frozen" ? "WALLET LOCKED" :
                                 phase === "safe" ? "SECURE" : phase.toUpperCase()}
                            </h2>
                            <p className={`font-mono ${isCritical ? "text-red-400" : "text-primary"}`}>
                                {isCritical ? "/// INTERVENTION REQUIRED" : "/// SYSTEM NOMINAL"}
                            </p>
                        </div>
                        
                        {/* Risk Bar */}
                        <div className="mt-8 h-2 bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                                className={`h-full ${
                                    riskScore > 80 ? "bg-red-500 shadow-[0_0_20px_red]" : 
                                    riskScore > 50 ? "bg-orange-500" : "bg-primary"
                                }`}
                                initial={{ width: 0 }}
                                animate={{ width: `${riskScore}%` }}
                                transition={{ type: "spring", stiffness: 50 }}
                            />
                        </div>
                    </motion.div>

                    {/* Terminal */}
                    <div className="glass-panel rounded-2xl overflow-hidden flex flex-col h-64 font-mono text-sm">
                        <div className="px-4 py-2 bg-white/5 border-b border-white/5 flex items-center justify-between">
                            <span className="text-slate-400 text-xs">TERMINAL_OUTPUT</span>
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
                                <div className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
                            </div>
                        </div>
                        <div className="p-4 overflow-y-auto flex-1 space-y-1" ref={scrollRef}>
                            {logs.length === 0 && <span className="text-slate-600 animate-pulse">Waiting for input...</span>}
                            {logs.map((log, i) => (
                                <div key={i} className={`flex gap-3 ${
                                    log.type === "danger" ? "text-red-400" : 
                                    log.type === "warning" ? "text-orange-400" : 
                                    log.type === "success" ? "text-green-400" : "text-slate-400"
                                }`}>
                                    <span className="opacity-50">[{new Date().toLocaleTimeString()}]</span>
                                    <span>{log.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Side Panel */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    {/* Active Scenario Card */}
                    <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-primary">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="font-display font-bold text-white text-lg">ACTIVE PROTOCOL</h3>
                            <div className={`${currentScenario.color}`}>{currentScenario.icon}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-sm text-slate-400 font-mono">SCENARIO:</div>
                            <div className="text-xl font-bold text-white">{currentScenario.name}</div>
                            <div className="text-xs text-slate-500 mt-2">{currentScenario.description}</div>
                        </div>
                    </div>

                    {/* Guardian Mesh */}
                    <div className="glass-panel p-6 rounded-2xl">
                        <h3 className="font-display font-bold text-white text-lg mb-4">GUARDIAN MESH</h3>
                        <div className="space-y-3">
                            {guardians.map((g, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded bg-white/5 border border-white/5">
                                    <div className={`w-8 h-8 rounded flex items-center justify-center font-bold text-xs ${
                                        g.status === "approved" ? "bg-green-500 text-black" : 
                                        g.status === "notified" ? "bg-orange-500 text-black animate-pulse" : "bg-slate-700 text-slate-400"
                                    }`}>
                                        {g.initials}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-bold text-white">{g.name}</div>
                                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">{g.role}</div>
                                    </div>
                                    <div className="text-xs">
                                        {g.status === "approved" ? "✅" : g.status === "notified" ? "⚠️" : "💤"}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Select Scenario Modal */}
      <AnimatePresence>
        {showScenarios && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={() => setShowScenarios(false)}
            >
                <motion.div 
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="glass-panel max-w-2xl w-full p-8 rounded-3xl border border-primary/20 shadow-[0_0_50px_rgba(244,224,77,0.1)]"
                    onClick={e => e.stopPropagation()}
                >
                    <h2 className="text-3xl font-display font-bold text-white mb-2">RUN SIMULATION</h2>
                    <p className="text-slate-400 mb-8 font-mono text-sm">Select a threat vector to test response protocols.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(Object.keys(SCENARIOS) as Scenario[]).map(key => (
                            <button
                                key={key}
                                onClick={() => runDemo(key)}
                                className="group p-4 bg-white/5 hover:bg-primary/10 border border-white/10 hover:border-primary/50 rounded-xl text-left transition-all"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={`text-slate-400 group-hover:text-primary transition-colors`}>
                                        {SCENARIOS[key].icon}
                                    </div>
                                    <span className="font-bold text-white font-display group-hover:text-primary transition-colors">
                                        {SCENARIOS[key].name}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 group-hover:text-slate-300 transition-colors">
                                    {SCENARIOS[key].description}
                                </p>
                            </button>
                        ))}
                    </div>

                    <button 
                        onClick={() => setShowScenarios(false)}
                        className="mt-8 w-full py-3 text-sm font-mono text-slate-500 hover:text-white transition-colors"
                    >
                        [CANCEL OPERATIONS]
                    </button>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
