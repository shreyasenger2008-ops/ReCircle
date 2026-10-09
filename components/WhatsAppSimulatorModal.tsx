"use client";

import React, { useState } from "react";
import { MessageCircle, Send, CheckCheck, MapPin, X, ExternalLink, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
  recipientPhone?: string;
  pickupAddress: string;
  wasteType: string;
  weightKg: number;
  amount: number;
  pickupId: string;
}

export default function WhatsAppSimulatorModal({
  isOpen,
  onClose,
  recipientName,
  recipientPhone = "+91 98765 43212",
  pickupAddress,
  wasteType,
  weightKg,
  amount,
  pickupId,
}: Props) {
  const [messages, setMessages] = useState<Array<{ sender: "bot" | "user"; text: string; time: string }>>([
    {
      sender: "bot",
      text: `👋 *नमस्ते ${recipientName} जी!*\n\nReCircle Fair से नया रीसाइक्लिंग पिकअप:\n\n📍 *पता:* ${pickupAddress}\n📦 *कचरा:* ${weightKg} kg ${wasteType}\n💰 *पक्की कमाई:* ₹${Math.round(amount)}\n🆔 *ऑर्डर ID:* #${pickupId.replace("req", "")}\n\nस्वीकार करने के लिए *1* भेजें, या लोकेशन देखने के लिए लिंक दबाएं: maps.google.com/q=12.9716,77.5946`,
      time: "10:30 AM",
    },
  ]);
  const [inputText, setInputText] = useState("");

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = inputText.trim();
    const newMsgList = [...messages, { sender: "user" as const, text: userMsg, time: "Just now" }];
    setMessages(newMsgList);
    setInputText("");

    setTimeout(() => {
      let reply = "धन्यवाद! आपका जवाब रिकॉर्ड कर लिया गया है। ✅";
      if (userMsg === "1" || userMsg.toLowerCase().includes("yes") || userMsg.toLowerCase().includes("haan")) {
        reply = `🎉 *पिकअप स्वीकार हुआ!*\n\nकस्टमर को सूचित कर दिया गया है कि आप रास्ते में हैं। कृपया समय पर पहुंचें। सुरक्षित यात्रा! 🚚`;
      }
      setMessages((prev) => [...prev, { sender: "bot", text: reply, time: "Just now" }]);
    }, 1000);
  };

  const openRealWhatsApp = () => {
    const rawText = `*ReCircle Fair Pickup Alert*\n\nPickup #${pickupId.replace("req", "")}\nLocation: ${pickupAddress}\nWaste: ${weightKg}kg ${wasteType}\nEarnings: ₹${amount}\n\nAccept link: http://localhost:3000/picker/nearby-requests`;
    window.open(`https://wa.me/?text=${encodeURIComponent(rawText)}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#111b21] w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-emerald-500/30 flex flex-col h-[580px]">
        {/* WhatsApp Header */}
        <div className="bg-[#202c33] px-4 py-3 text-white flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white shadow">
                RF
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#202c33] rounded-full"></span>
            </div>
            <div>
              <div className="font-semibold text-sm flex items-center gap-1.5 text-slate-100">
                ReCircle Fair Dispatch
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="text-[11px] text-emerald-400">Official WhatsApp Bot (Online)</div>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-slate-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* WhatsApp Chat Body */}
        <div className="flex-1 bg-[#0b141a] p-4 overflow-y-auto space-y-3 font-sans text-sm">
          <div className="text-center my-2">
            <span className="bg-[#182229] text-slate-400 text-[11px] px-3 py-1 rounded-md shadow-sm border border-slate-800">
              🔒 End-to-end encrypted notification
            </span>
          </div>

          {messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-md whitespace-pre-line text-sm ${
                  m.sender === "user"
                    ? "bg-[#005c4b] text-slate-100 rounded-tr-none"
                    : "bg-[#202c33] text-slate-200 rounded-tl-none border border-slate-700/40"
                }`}
              >
                {m.text}
                <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 mt-1">
                  <span>{m.time}</span>
                  {m.sender === "user" && <CheckCheck className="h-3.5 w-3.5 text-cyan-400" />}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* WhatsApp Action Footer */}
        <div className="bg-[#202c33] p-3 border-t border-slate-800 space-y-2">
          <form onSubmit={handleSend} className="flex gap-2">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type '1' to accept pickup..."
              className="bg-[#2a3942] border-none text-white text-sm placeholder:text-slate-400 rounded-full h-10 px-4 focus-visible:ring-1 focus-visible:ring-emerald-500"
            />
            <Button type="submit" size="icon" className="h-10 w-10 rounded-full bg-[#00a884] hover:bg-[#008f6f] text-slate-950">
              <Send className="h-4 w-4" />
            </Button>
          </form>

          <button
            onClick={openRealWhatsApp}
            className="w-full text-center text-xs text-emerald-400 hover:text-emerald-300 flex items-center justify-center gap-1.5 py-1"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open on actual WhatsApp app (wa.me)
          </button>
        </div>
      </div>
    </div>
  );
}
