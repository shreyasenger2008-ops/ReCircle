"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  MessageSquare, X, Send, Sparkles, Bot, User, Volume2, 
  HelpCircle, RefreshCw, ChevronDown, CheckCircle2, Leaf, MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { speakText, stopSpeaking } from "@/lib/voice-assistant";
import { toast } from "sonner";
import { useLanguage } from "@/lib/language-context";

interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: string;
}

const POPULAR_QUESTIONS = [
  { text: "🌱 Waste Sorting Rules", q: "How to segregate household waste correctly?" },
  { text: "💰 Live Scrap Benchmark Rates", q: "What are today's benchmark scrap prices per kg?" },
  { text: "🍕 Are Pizza Boxes Recyclable?", q: "Can greasy pizza boxes be recycled?" },
  { text: "📦 How Doorstep Pickup Works", q: "How do I schedule a doorstep scrap pickup?" },
  { text: "🌟 What is Green Karma?", q: "What are Green Karma points and how to earn them?" },
  { text: "📱 E-Waste Disposal", q: "How should I dispose of old chargers and batteries?" },
];

export default function CitizenEcoBot() {
  const { lang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPromptHint, setShowPromptHint] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial welcome greeting
    const welcomeText = lang === "hi"
      ? "नमस्ते! 👋 मैं **ReCircle EcoBot** हूँ - आपका AI रीसाइक्लिंग व स्क्रैप मूल्य सहायक।\n\nकचरा छंटाई नियम, आज के मंडी स्क्रैप भाव या डोरस्टेप पिकअप के बारे में मुझसे कुछ भी पूछें!"
      : "Hello! 👋 I'm **ReCircle EcoBot**, your AI Circular Economy guide.\n\nAsk me anything about waste sorting rules, benchmark scrap prices, or how to schedule ethical doorstep pickups!";

    setMessages([
      {
        id: "msg_welcome",
        sender: "bot",
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);

    const handleOpenBot = () => setIsOpen(true);
    const handleToggleBot = () => setIsOpen((prev) => !prev);

    window.addEventListener("open-citizen-ecobot", handleOpenBot);
    window.addEventListener("toggle-citizen-ecobot", handleToggleBot);

    return () => {
      window.removeEventListener("open-citizen-ecobot", handleOpenBot);
      window.removeEventListener("toggle-citizen-ecobot", handleToggleBot);
    };
  }, [lang]);

  useEffect(() => {
    if (isOpen) {
      setShowPromptHint(false);
      scrollToBottom();
    }
  }, [isOpen, messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async (customQuery?: string) => {
    const textToSend = customQuery || inputVal.trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: "usr_" + Date.now(),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customQuery) setInputVal("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend, lang }),
      });

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: "bot_" + Date.now(),
        sender: "bot",
        text: data.reply || "I couldn't process that request. Please try asking again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: "bot_err_" + Date.now(),
        sender: "bot",
        text: "Network error. Please ask about scrap rates or waste segregation rules.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeak = (text: string) => {
    const cleanText = text.replace(/[*_#`]/g, "");
    speakText(cleanText, lang === "hi" ? "hi-IN" : "en-IN");
  };

  return (
    <>
      {/* Floating Bottom-Right Trigger Button with Label & Suggested Prompt Callout */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2 animate-in fade-in slide-in-from-bottom-5">
          
          {/* Suggested Prompt Callout Bubble */}
          {showPromptHint && (
            <div className="hidden sm:flex items-center gap-2 bg-slate-900/95 text-white text-xs font-semibold px-3.5 py-2 rounded-2xl shadow-xl border border-emerald-500/40 backdrop-blur-md max-w-xs animate-bounce">
              <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
              <span>{lang === "hi" ? "💡 'क्या पिज़्ज़ा बॉक्स रीसायकल होते हैं?' पूछें" : "💡 Ask: 'Can pizza boxes be recycled?'"}</span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPromptHint(false);
                }}
                className="text-slate-400 hover:text-white ml-1"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Expanded Pill Trigger Button */}
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open ReCircle EcoBot"
            title="Ask ReCircle EcoBot"
            className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-900 text-white shadow-2xl hover:shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95 border-2 border-white/20 min-h-[48px]"
          >
            <div className="relative">
              <Bot className="h-5 w-5 text-emerald-300" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
              </span>
            </div>
            <span className="text-xs font-black tracking-tight">
              {lang === "hi" ? "🌿 EcoBot से पूछें" : "🌿 Ask EcoBot"}
            </span>
          </button>
        </div>
      )}

      {/* Expanded Chatbot Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[92vw] sm:w-[410px] h-[580px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 fade-in duration-200">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-900 text-white p-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
                <Bot className="h-5 w-5 text-emerald-300" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-black text-sm text-white leading-none">ReCircle EcoBot</h3>
                  <Badge className="bg-emerald-500/30 text-emerald-200 border-0 text-[10px] px-1.5 py-0 font-mono">
                    AI Online
                  </Badge>
                </div>
                <p className="text-[11px] text-emerald-100/80 mt-0.5">
                  {lang === "hi" ? "कचरा छंटाई व ताज़ा भाव गाइड" : "Eco Sorting & Fair Scrap Assistant"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  stopSpeaking();
                  setIsOpen(false);
                }}
                className="h-8 w-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/80 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Quick Popular Chips */}
          <div className="bg-slate-50 border-b border-slate-100 p-2.5 overflow-x-auto flex gap-1.5 scrollbar-none">
            {POPULAR_QUESTIONS.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip.q)}
                className="shrink-0 bg-white hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 border border-slate-200 hover:border-emerald-300 rounded-full px-3 py-1 text-[11px] font-bold transition-all shadow-2xs"
              >
                {chip.text}
              </button>
            ))}
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50">
            {messages.map((m) => {
              const isBot = m.sender === "bot";
              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-2.5 ${isBot ? "justify-start" : "justify-end"}`}
                >
                  {isBot && (
                    <div className="h-7 w-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 text-xs shadow-xs mt-0.5">
                      <Leaf className="h-3.5 w-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] rounded-2xl p-3 text-xs leading-relaxed shadow-xs ${
                      isBot
                        ? "bg-white border border-slate-200 text-slate-800"
                        : "bg-slate-900 text-white"
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-medium">
                      {m.text}
                    </div>

                    <div className={`flex items-center justify-between mt-1.5 text-[10px] ${isBot ? "text-slate-400" : "text-slate-300"}`}>
                      <span>{m.timestamp}</span>
                      {isBot && (
                        <button
                          onClick={() => handleSpeak(m.text)}
                          className="hover:text-emerald-600 flex items-center gap-0.5 font-bold p-1 rounded hover:bg-slate-100 transition-colors"
                          title="Listen to this response"
                        >
                          <Volume2 className="h-3 w-3" />
                          <span className="text-[9px]">Listen</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {!isBot && (
                    <div className="h-7 w-7 rounded-xl bg-slate-700 text-white flex items-center justify-center shrink-0 text-xs shadow-xs mt-0.5">
                      <User className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold p-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce"></div>
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]"></div>
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]"></div>
                <span>EcoBot is researching...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask about scrap rates, sorting rules, batteries..."
              className="flex-1 h-10 px-3.5 bg-slate-100 focus:bg-white rounded-xl text-xs font-semibold text-slate-900 border border-transparent focus:border-emerald-500 focus:outline-none transition-all"
            />
            <Button
              size="icon"
              onClick={() => handleSend()}
              disabled={!inputVal.trim() || isLoading}
              className="h-10 w-10 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white shrink-0 shadow-xs disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

        </div>
      )}
    </>
  );
}
