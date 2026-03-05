"use client";

import { useState, useRef, useEffect } from "react";
import { sendChatMessage } from "../lib/api";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatPanelProps {
  walletAddress: string;
}

const SUGGESTIONS = [
  "Am I at risk of liquidation?",
  "What should I repay first?",
  "Explain my position simply",
];

export default function ChatPanel({ walletAddress }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const data = await sendChatMessage(text.trim(), walletAddress);
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I couldn't process that. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card flex flex-col" style={{ height: 420 }}>
      <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3 uppercase tracking-wider flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[var(--cyan)] animate-pulse" />
        AI Risk Advisor
      </h3>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <p className="text-[var(--text-muted)] text-sm">
              Ask me about your DeFi position risk
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-xs px-3 py-1.5 rounded-full border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--cyan)] hover:text-[var(--cyan)] transition-colors cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`px-4 py-3 text-sm max-w-[85%] ${
              msg.role === "user"
                ? "chat-bubble-user ml-auto"
                : "chat-bubble-ai"
            }`}
          >
            <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
          </div>
        ))}

        {loading && (
          <div className="chat-bubble-ai px-4 py-3 max-w-[85%]">
            <div className="flex gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)] animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)] animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)] animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex gap-2"
      >
        <input
          className="input flex-1"
          placeholder="Ask about your risk..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="btn-primary text-sm"
        >
          Send
        </button>
      </form>
    </div>
  );
}
