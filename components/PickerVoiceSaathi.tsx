"use client";

import React, { useState, useEffect } from "react";
import { 
  Mic, MicOff, Volume2, VolumeX, ShieldAlert, MapPin, 
  IndianRupee, Sparkles, X, ChevronUp, ChevronDown, CheckCircle2,
  Navigation, Flame
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/lib/language-context";
import { speakText, stopSpeaking } from "@/lib/voice-assistant";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function PickerVoiceSaathi() {
  const { lang } = useLanguage();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [lastAnswer, setLastAnswer] = useState<string>("");

  useEffect(() => {
    const handleOpenEvent = () => setIsOpen(true);
    window.addEventListener("open-safai-saathi", handleOpenEvent);
    return () => {
      window.removeEventListener("open-safai-saathi", handleOpenEvent);
      stopSpeaking();
    };
  }, []);

  const triggerVoiceResponse = (text: string, navigatePath?: string) => {
    setLastAnswer(text);
    setIsSpeaking(true);
    speakText(text, lang === "hi" ? "hi-IN" : "en-IN", 0.92);

    setTimeout(() => {
      setIsSpeaking(false);
    }, 4500);

    if (navigatePath) {
      setTimeout(() => {
        router.push(navigatePath);
      }, 1500);
    }
  };

  // Voice Query Handlers
  const handleQuery = (queryType: "earnings" | "next_pickup" | "prices" | "route" | "sos") => {
    if (queryType === "earnings") {
      const msg = lang === "hi"
        ? "सुरेश जी, आज आपने 4 पिकअप पूरे किए हैं और आपकी आज की कुल कमाई 450 रुपये है। आज का लक्ष्य 800 रुपये है।"
        : "Suresh, you have completed 4 pickups today with total earnings of 450 rupees. Target is 800 rupees.";
      triggerVoiceResponse(msg);
    } else if (queryType === "next_pickup") {
      const msg = lang === "hi"
        ? "आपका अगला पिकअप 1.2 किलोमीटर दूर कोरमंगला 4th ब्लॉक में है। 8 किलो प्लास्टिक, आपकी पक्की कमाई है 144 रुपये।"
        : "Next pickup is 1.2 kilometers away at Koramangala 4th block. 8 kilograms of plastic, guaranteed payout 144 rupees.";
      triggerVoiceResponse(msg);
    } else if (queryType === "prices") {
      const msg = lang === "hi"
        ? "आज के कबाड़ भाव हैं: ई-कचरा 70 रुपये, लोहा व धातु 35 रुपये, प्लास्टिक 18 रुपये, और गत्ता 14 रुपये प्रति किलो।"
        : "Today's fair rates: E-Waste 70 rupees, Metal 35 rupees, Plastic 18 rupees, Cardboard 14 rupees per kilogram.";
      triggerVoiceResponse(msg);
    } else if (queryType === "route") {
      const msg = lang === "hi"
        ? "डाउनहिल रूट मैप खोला जा रहा है। ढलान के क्रम में चलने पर आपको ठेला खींचने में कम मेहनत लगेगी।"
        : "Opening downhill route map. Following this order reduces pushcart physical strain.";
      triggerVoiceResponse(msg, "/picker/route-planner");
    } else if (queryType === "sos") {
      const msg = lang === "hi"
        ? "आपातकालीन सुरक्षा अलर्ट सक्रिय किया जा रहा है। आपके जीपीएस निर्देशांक नजदीकी वार्ड कंट्रोल रूम को भेज दिए गए हैं।"
        : "Emergency SOS activated. Your GPS coordinates have been broadcast to the nearest ward control team.";
      triggerVoiceResponse(msg);
      toast.error(lang === "hi" ? "🚨 आपातकालीन अलर्ट भेजा गया!" : "🚨 Emergency SOS Sent!");
    }
  };

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      toast.error(lang === "hi" ? "इस ब्राउज़र में माइक उपलब्ध नहीं है।" : "Speech recognition not supported in browser.");
      return;
    }

    try {
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = lang === "hi" ? "hi-IN" : "en-IN";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsListening(true);
      setTranscript(lang === "hi" ? "सुन रहे हैं... (बोलिए: 'कमाई', 'अगला काम', 'कबाड़ का भाव', 'रूट')" : "Listening... (say 'earnings', 'next pickup', 'rates')");

      recognition.onresult = (event: any) => {
        const spoken = event.results[0][0].transcript.toLowerCase();
        setIsListening(false);
        setTranscript(`"${spoken}"`);

        if (spoken.includes("कम") || spoken.includes("earning") || spoken.includes("पैसा") || spoken.includes("paisa") || spoken.includes("kamai")) {
          handleQuery("earnings");
        } else if (spoken.includes("अगला") || spoken.includes("next") || spoken.includes("काम") || spoken.includes("kahan")) {
          handleQuery("next_pickup");
        } else if (spoken.includes("भाव") || spoken.includes("rate") || spoken.includes("price") || spoken.includes("daam") || spoken.includes("bhav")) {
          handleQuery("prices");
        } else if (spoken.includes("रूट") || spoken.includes("रास्ता") || spoken.includes("map") || spoken.includes("nakshe")) {
          handleQuery("route");
        } else if (spoken.includes("मदद") || spoken.includes("help") || spoken.includes("sos") || spoken.includes("emergency")) {
          handleQuery("sos");
        } else {
          const fallback = lang === "hi"
            ? `आपने कहा: "${spoken}"। आप 'कमाई बताओ', 'अगला पिकअप', या 'कबाड़ का भाव' पूछ सकते हैं।`
            : `You said: "${spoken}". Try asking 'check earnings', 'next pickup', or 'rates'.`;
          triggerVoiceResponse(fallback);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
        setTranscript("");
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      setIsListening(false);
      toast.error("Voice mic error");
    }
  };

  return (
    <>
      {/* Floating Trigger Button for Safai Saathi (Positioned clearly above SOS on bottom-right) */}
      {!isOpen && (
        <div className="fixed bottom-20 right-6 z-50 animate-in fade-in slide-in-from-bottom-5">
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-3 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white p-3 pr-5 rounded-full shadow-2xl hover:shadow-emerald-500/40 transition-all hover:scale-105 active:scale-95 border-2 border-emerald-400"
          >
            <div className="h-10 w-10 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-black shadow-md">
              <Mic className="h-5 w-5 animate-pulse" />
            </div>
            <div className="text-left">
              <div className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Voice Co-Pilot
              </div>
              <div className="text-xs font-black text-white">
                {lang === "hi" ? "सफाई साथी (बोलें) 🎙️" : "Safai Saathi Audio 🎙️"}
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Expanded Voice Co-Pilot Dock */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[92vw] sm:w-[420px] bg-slate-950 text-white rounded-3xl shadow-2xl border-2 border-emerald-500/50 p-5 space-y-4 animate-in zoom-in-95 fade-in duration-200">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-emerald-500/30">
                <Mic className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-sm text-white">
                    {lang === "hi" ? "सफाई साथी वॉइस असिस्टेंट" : "Safai Saathi Voice Co-Pilot"}
                  </h3>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </div>
                <p className="text-[11px] text-emerald-400 font-semibold">
                  {lang === "hi" ? "बोलें या 1-टैप में जानकारी सुनें" : "Speak or 1-tap to hear details"}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                stopSpeaking();
                setIsOpen(false);
              }}
              className="h-8 w-8 rounded-full bg-slate-900 hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Audio Wave Visualizer & Status */}
          <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 text-center space-y-2 relative overflow-hidden">
            {/* Wave animation */}
            <div className="flex items-center justify-center gap-1.5 h-8">
              {[40, 75, 95, 60, 85, 50, 90, 70, 45].map((h, i) => (
                <div
                  key={i}
                  className={`w-1.5 rounded-full transition-all duration-150 ${
                    isListening
                      ? "bg-red-500 animate-pulse"
                      : isSpeaking
                      ? "bg-emerald-400 animate-bounce"
                      : "bg-slate-700 h-2"
                  }`}
                  style={{
                    height: isListening || isSpeaking ? `${h}%` : "6px",
                    animationDelay: `${i * 0.08}s`,
                  }}
                />
              ))}
            </div>

            <div className="text-xs font-bold text-slate-300">
              {isListening
                ? (lang === "hi" ? "🎙️ आपकी आवाज़ सुन रहे हैं... बोलिए!" : "🎙️ Listening... Speak now!")
                : isSpeaking
                ? (lang === "hi" ? "🔊 सफाई साथी बोल रहा है..." : "🔊 Safai Saathi is speaking...")
                : transcript || (lang === "hi" ? "माइक दबाकर बोलें या नीचे विकल्प चुनें" : "Tap Mic to speak or select an option below")}
            </div>

            {lastAnswer && (
              <div className="mt-2 pt-2 border-t border-slate-800 text-xs font-medium text-emerald-300 bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-800/40 text-left">
                {lastAnswer}
              </div>
            )}
          </div>

          {/* Big Tap Mic Button */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={startListening}
              className={`flex-1 h-12 rounded-2xl font-black text-xs gap-2 shadow-lg transition-all ${
                isListening
                  ? "bg-red-600 hover:bg-red-700 text-white animate-pulse"
                  : "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
              }`}
            >
              <Mic className="h-5 w-5" />
              {isListening ? (lang === "hi" ? "सुन रहे हैं..." : "Listening...") : (lang === "hi" ? "माइक दबाकर बोलें 🎙️" : "Tap to Speak 🎙️")}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                stopSpeaking();
                setIsSpeaking(false);
              }}
              className="h-12 w-12 rounded-2xl border-slate-800 bg-slate-900 text-slate-300 hover:text-white shrink-0"
              title="Stop Audio"
            >
              <VolumeX className="h-5 w-5" />
            </Button>
          </div>

          {/* Quick Voice One-Tap Action Cards */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => handleQuery("earnings")}
              className="p-3 bg-slate-900 hover:bg-emerald-950/60 border border-slate-800 hover:border-emerald-500/50 rounded-2xl text-left transition-all group"
            >
              <div className="flex items-center justify-between text-emerald-400 text-xs font-black">
                <span className="flex items-center gap-1.5">
                  <IndianRupee className="h-4 w-4" />
                  {lang === "hi" ? "आज की कमाई" : "Today's Earnings"}
                </span>
                <Volume2 className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100" />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {lang === "hi" ? "₹450 पक्की कमाई" : "₹450 earned"}
              </p>
            </button>

            <button
              onClick={() => handleQuery("next_pickup")}
              className="p-3 bg-slate-900 hover:bg-emerald-950/60 border border-slate-800 hover:border-emerald-500/50 rounded-2xl text-left transition-all group"
            >
              <div className="flex items-center justify-between text-amber-400 text-xs font-black">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {lang === "hi" ? "अगला पिकअप" : "Next Pickup"}
                </span>
                <Volume2 className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100" />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {lang === "hi" ? "1.2 km Koramangala" : "1.2 km away"}
              </p>
            </button>

            <button
              onClick={() => handleQuery("prices")}
              className="p-3 bg-slate-900 hover:bg-emerald-950/60 border border-slate-800 hover:border-emerald-500/50 rounded-2xl text-left transition-all group"
            >
              <div className="flex items-center justify-between text-teal-400 text-xs font-black">
                <span className="flex items-center gap-1.5">
                  <Flame className="h-4 w-4" />
                  {lang === "hi" ? "कबाड़ के भाव" : "Scrap Rates"}
                </span>
                <Volume2 className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100" />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {lang === "hi" ? "प्लास्टिक ₹18, धातु ₹35" : "Plastic ₹18, Metal ₹35"}
              </p>
            </button>

            <button
              onClick={() => handleQuery("route")}
              className="p-3 bg-slate-900 hover:bg-emerald-950/60 border border-slate-800 hover:border-emerald-500/50 rounded-2xl text-left transition-all group"
            >
              <div className="flex items-center justify-between text-cyan-400 text-xs font-black">
                <span className="flex items-center gap-1.5">
                  <Navigation className="h-4 w-4" />
                  {lang === "hi" ? "डाउनहिल रूट" : "Downhill Map"}
                </span>
                <Volume2 className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100" />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {lang === "hi" ? "कम मेहनत वाला रास्ता" : "Low strain route"}
              </p>
            </button>
          </div>

          {/* SOS Emergency button */}
          <button
            onClick={() => handleQuery("sos")}
            className="w-full p-2.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 rounded-2xl text-rose-300 flex items-center justify-center gap-2 text-xs font-black transition-all"
          >
            <ShieldAlert className="h-4 w-4 text-rose-500" />
            {lang === "hi" ? "आपातकालीन मदद / SOS अलर्ट" : "Emergency SOS Broadcast"}
          </button>

        </div>
      )}
    </>
  );
}
