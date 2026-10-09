"use client";

import React, { useState } from "react";
import { Volume2, VolumeX, Globe, Sparkles, Mic, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { speakText, stopSpeaking } from "@/lib/voice-assistant";
import { useLanguage, Language } from "@/lib/language-context";
import { toast } from "sonner";

interface Props {
  role?: "picker" | "generator" | "admin";
}

export default function VoiceGuidanceBar({ role = "picker" }: Props) {
  const { lang, setLang, t, speak } = useLanguage();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const handleLangChange = (newLang: Language) => {
    setLang(newLang);
  };

  const handleToggleSound = () => {
    if (soundEnabled) {
      stopSpeaking();
      setSoundEnabled(false);
      toast.info("Audio voice muted");
    } else {
      setSoundEnabled(true);
      speak(lang === "hi" ? "आवाज चालू कर दी गई है।" : "Voice audio enabled.");
      toast.success("Audio voice enabled");
    }
  };

  const startVoiceCommand = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      toast.error("Voice recognition is not supported in this browser. Please use Chrome/Edge.");
      return;
    }

    try {
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = lang === "hi" ? "hi-IN" : lang === "kn" ? "kn-IN" : "en-IN";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsListening(true);
      toast.info(lang === "hi" ? "🎙️ बोलिए... (उदा: 'पिकअप स्वीकार करो' या 'कमाई बताओ')" : "🎙️ Listening... (e.g., 'Check Earnings')");

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        setIsListening(false);
        toast.success(`सुना: "${transcript}"`);
        
        if (transcript.includes("कमाई") || transcript.includes("earning") || transcript.includes("paisa")) {
          speak(lang === "hi" ? "आपकी आज की कमाई 450 रुपये है।" : "Your earnings today are 450 rupees.");
        } else if (transcript.includes("स्वीकार") || transcript.includes("accept")) {
          speak(lang === "hi" ? "पिकअप स्वीकार कर लिया गया है।" : "Pickup accepted.");
        } else {
          speak(lang === "hi" ? `आपने कहा: ${transcript}` : `You said: ${transcript}`);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      setIsListening(false);
      toast.error("Voice capture error");
    }
  };

  return (
    <>
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white px-4 py-2.5 rounded-2xl mb-6 shadow-md flex flex-wrap items-center justify-between gap-3 border border-emerald-700/50">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/20 p-2 rounded-xl border border-emerald-400/30 text-emerald-300">
            <Volume2 className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
              <span>{t("voice.barTitle")}</span>
              <span className="bg-emerald-500/30 text-[10px] px-1.5 py-0.2 rounded font-mono">Vernacular Audio</span>
            </div>
            <p className="text-xs text-slate-200">
              {t("voice.barSubtitle")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Language Selector */}
          <div className="flex bg-slate-800/80 rounded-xl p-1 border border-slate-700">
            <button
              onClick={() => handleLangChange("hi")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                lang === "hi" ? "bg-emerald-500 text-slate-950 shadow" : "text-slate-300 hover:text-white"
              }`}
            >
              हिन्दी
            </button>
            <button
              onClick={() => handleLangChange("en")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                lang === "en" ? "bg-emerald-500 text-slate-950 shadow" : "text-slate-300 hover:text-white"
              }`}
            >
              English
            </button>
            <button
              onClick={() => handleLangChange("kn")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                lang === "kn" ? "bg-emerald-500 text-slate-950 shadow" : "text-slate-300 hover:text-white"
              }`}
            >
              ಕನ್ನಡ
            </button>
          </div>

          {/* Voice Command Mic */}
          <Button
            size="sm"
            onClick={startVoiceCommand}
            className={`h-8 px-3 text-xs font-bold gap-1.5 rounded-xl ${
              isListening ? "bg-red-500 hover:bg-red-600 animate-pulse text-white" : "bg-emerald-600 hover:bg-emerald-500 text-white"
            }`}
          >
            <Mic className="h-3.5 w-3.5" />
            {isListening ? t("voice.listening") : t("voice.speakBtn")}
          </Button>

          {/* Mute Toggle */}
          <Button
            size="icon"
            variant="ghost"
            onClick={handleToggleSound}
            className="h-8 w-8 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl"
            title={soundEnabled ? "Mute Voice" : "Unmute Voice"}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-red-400" />}
          </Button>

          {/* Help */}
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setShowHelpModal(true)}
            className="h-8 w-8 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-slate-900 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-700">
                <Volume2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Voice & Accessibility Guide</h3>
                <p className="text-xs text-slate-500">आवाज और भाषा सहायता निर्देश</p>
              </div>
            </div>

            <div className="space-y-3 text-sm text-slate-600 mb-6 leading-relaxed">
              <div className="p-3 bg-slate-50 rounded-xl border">
                <strong className="text-slate-900 block mb-1">🔊 1. कार्ड सुनें (Listen to Cards):</strong>
                हर पिकअप कार्ड पर बने नीले स्पीकर बटन को दबाएं। ऐप आपको कचरे का प्रकार, वजन और पक्की कमाई बोलकर बताएगा।
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border">
                <strong className="text-slate-900 block mb-1">🎙️ 2. बोलकर चलाएं (Voice Commands):</strong>
                "बोलें" बटन दबाकर 'स्वीकार', 'कमाई बताओ', या 'वजन 5 किलो' बोलें।
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border">
                <strong className="text-slate-900 block mb-1">🇮🇳 3. भाषा बदलें (Languages):</strong>
                हिन्दी, English और कन्नड़ में तुरंत अनुवाद उपलब्ध है।
              </div>
            </div>

            <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-11" onClick={() => setShowHelpModal(false)}>
              समझ गए (Got it)
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
