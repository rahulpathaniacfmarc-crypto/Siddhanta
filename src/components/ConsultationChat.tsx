import React, { useState, useRef, useEffect } from "react";
import { KundliData, ChatMessage } from "../types";
import { MessageSquare, Send, Loader2, AlertCircle, ShieldAlert } from "lucide-react";

interface ConsultationChatProps {
  kundliData: KundliData;
}

// A simple but effective parser to convert markdown text into structured react elements
function MarkdownMini({ text }: { text: string }) {
  if (!text) return null;

  // Split text by lines
  const lines = text.split("\n");

  return (
    <div className="space-y-3 font-serif leading-relaxed text-sm lg:text-[15px] text-slate-200">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // Headers
        if (trimmed.startsWith("### ")) {
          return (
            <h4 key={idx} className="text-xs font-bold text-[#d8a53d] uppercase tracking-wider font-display mt-4">
              {trimmed.substring(4)}
            </h4>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <h3 key={idx} className="text-xs font-bold text-[#d8a53d] font-display border-b border-[#d8a53d]/20 pb-1 mt-5 uppercase tracking-widest">
              {trimmed.substring(3)}
            </h3>
          );
        }
        if (trimmed.startsWith("# ")) {
          return (
            <h2 key={idx} className="text-sm font-bold text-[#d8a53d] font-display border-b-2 border-[#d8a53d]/30 pb-2 mt-6 uppercase tracking-widest">
              {trimmed.substring(2)}
            </h2>
          );
        }

        // Bullet points
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          const content = trimmed.substring(2);
          return (
            <ul key={idx} className="list-disc list-inside pl-4 text-slate-300">
              <li>{parseInlineMarkdown(content)}</li>
            </ul>
          );
        }

        // Standard line
        if (trimmed === "") {
          return <div key={idx} className="h-2" />;
        }

        return <p key={idx} className="text-justify">{parseInlineMarkdown(line)}</p>;
      })}
    </div>
  );
}

// Simple parser for inline markdown like **bold** or *italic*
function parseInlineMarkdown(text: string) {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="text-[#d8a53d] font-bold font-sans">
          {part.substring(2, part.length - 2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={i} className="text-slate-100 italic">
          {part.substring(1, part.length - 1)}
        </em>
      );
    }
    return part;
  });
}

export default function ConsultationChat({ kundliData }: ConsultationChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom on new messages
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Add initial greetings from the Astrologer
    const initialGreeting: ChatMessage = {
      id: "initial-greet",
      sender: "astrologer",
      text: `### Lifetime Horoscopic Consultation
Welcome, ${kundliData.birthInfo.name}. 

I am your Vedic Astrologer, prepared to interpret the cosmic design mapped during your descent into the physical plane. Your chart has been cast according to classical **Brihat Parashara Hora Shastra** and **Phaladeepika** parameters.

Your Ascendant (Lagna) is **${kundliData.lagna.sign}** at **${kundliData.lagna.degree.toFixed(2)}°**, positioned within the Nakshatra of **${kundliData.lagna.nakshatra}** ruled by **${kundliData.lagna.nakshatraLord}**.

Ask any specific question regarding your career, finances, relationships, health, or life purpose. Every answer is computed strictly using your birth chart variables, including your divisional varga charts (D9, D10), Shadbala strengths, and Vimshottari dasha cycles.

*Please note: This platform strictly provides objective planetary interpretations. It does not recommend remedies, rituals, gemstones, or spiritual prescriptions.*`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages([initialGreeting]);
  }, [kundliData]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userQuery = input.trim();
    setInput("");
    setError(null);

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: userQuery,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // Map previous chat logs for context
      const historyContext = updatedMessages.slice(-6).map((msg) => ({
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.text }],
      }));

      const response = await fetch("/api/astrology/ask-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: userQuery,
          kundliData,
          history: historyContext,
         }),
      });

      if (!response.ok) {
        let errMsg = "Failed to consult the planetary grids. Please try again.";
        try {
          const errData = await response.json();
          if (errData && errData.error) {
            errMsg = errData.error;
          }
        } catch (e) {}
        throw new Error(errMsg);
      }

      const resData = await response.json();

      const astrologerMessage: ChatMessage = {
        id: `astro-${Date.now()}`,
        sender: "astrologer",
        text: resData.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, astrologerMessage]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected planetary interference occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="consultation-chat" className="bg-[#1a1224]/80 border border-[#d8a53d]/30 rounded-none shadow-[0_0_30px_rgba(216,165,61,0.06)] h-[650px] flex flex-col overflow-hidden relative z-10 backdrop-blur-md">
      {/* Header */}
      <div className="p-4 border-b border-[#d8a53d]/20 bg-[#241733]/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-none bg-[#160f1f] border border-[#d8a53d]/30 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-[#d8a53d]" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-[#d8a53d] uppercase tracking-widest font-display">Vedic Astrologer Consultation</h2>
            <span className="text-[10px] text-slate-300 font-mono font-bold uppercase tracking-wider">
              Parashari & Jaimini Engine Active
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-[#160f1f] border border-[#d8a53d]/20 rounded-none">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-widest">
            Objective Analysis
          </span>
        </div>
      </div>

      {/* Warnings & Remedies Clause Banner */}
      <div className="px-4 py-2 border-b border-[#d8a53d]/20 bg-[#160f1f]/80 flex items-center gap-2.5">
        <ShieldAlert className="w-4 h-4 text-[#a8452f] shrink-0" />
        <p className="text-[10px] text-slate-300 leading-normal font-serif">
          <span className="font-semibold text-slate-200">Disclaimer:</span> This platform strictly performs objective horoscope interpretation. Gemstones, rituals, mantras, and remedies are intentionally excluded.
        </p>
      </div>

      {/* Messages Scrollway */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 select-text bg-[#160f1f]">
        {messages.map((msg) => {
          const isUser = msg.sender === "user";
          return (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[85%] ${isUser ? "ml-auto items-end" : "mr-auto items-start"}`}
            >
              {/* Message Capsule */}
              <div
                className={`p-4 rounded-none border ${
                  isUser
                    ? "bg-[#241733] border-[#d8a53d]/30 text-slate-100 rounded-br-none shadow-md"
                    : "bg-[#1a1224]/95 border-[#d8a53d]/20 text-slate-200 rounded-bl-none shadow-xl"
                }`}
              >
                {isUser ? (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap font-sans text-slate-100">{msg.text}</p>
                ) : (
                  <MarkdownMini text={msg.text} />
                )}
              </div>
              <span className="text-[9px] font-mono text-slate-400 mt-1 px-1">{msg.timestamp}</span>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex flex-col mr-auto max-w-[85%] items-start animate-pulse">
            <div className="p-4 rounded-none border bg-[#1a1224]/95 border-[#d8a53d]/20 text-slate-300 rounded-bl-none flex items-center gap-3 shadow-xl">
              <Loader2 className="w-4 h-4 text-[#d8a53d] animate-spin" />
              <span className="text-xs font-medium font-serif">Synthesizing natal combinations, Vimshottari cycles, and transit positions...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 border border-[#a8452f]/40 bg-[#a8452f]/10 rounded-none flex gap-2 text-xs text-slate-200">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#c76b8f]" />
            <div>
              <span className="font-semibold text-slate-100">Interplanetary Interruption:</span> {error}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Tray */}
      <form onSubmit={handleSend} className="p-4 border-t border-[#d8a53d]/20 bg-[#1a1224]/95 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question (e.g. 'How will the Saturn Mahadasha affect my career path?')"
          disabled={isLoading}
          className="flex-1 bg-[#160f1f] border border-[#d8a53d]/30 rounded-none px-4 py-2.5 text-sm text-slate-100 placeholder-[#d8a53d]/40 focus:outline-none focus:border-[#d8a53d] focus:ring-0 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="bg-gradient-to-r from-[#d8a53d] to-[#e08b2e] hover:from-[#e08b2e] hover:to-[#d8a53d] disabled:from-[#241733] disabled:to-[#241733] disabled:opacity-50 text-[#160f1f] disabled:text-slate-400 px-4 py-2.5 rounded-none font-bold text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5 shrink-0 shadow-md"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Ask</span>
        </button>
      </form>
    </div>
  );
}

