"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  AlertTriangle, 
  ShieldAlert, 
  PhoneCall, 
  CheckCircle2, 
  X, 
  MapPin, 
  Radio, 
  BatteryMedium, 
  Building2, 
  ShieldCheck,
  Flame
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/lib/language-context";
import { toast } from "sonner";

export default function SOSFloatingButton() {
  const { lang, speak } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isTriggered, setIsTriggered] = useState(false);
  
  // Hold-to-confirm state (2000ms)
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const startHolding = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (isTriggered) return;
    
    setIsHolding(true);
    startTimeRef.current = Date.now();

    holdTimerRef.current = setInterval(() => {
      if (!startTimeRef.current) return;
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(100, Math.round((elapsed / 2000) * 100));
      setHoldProgress(pct);

      if (elapsed >= 2000) {
        clearInterval(holdTimerRef.current!);
        holdTimerRef.current = null;
        triggerEmergencySOS();
      }
    }, 40);
  };

  const stopHolding = () => {
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    setIsHolding(false);
    if (holdProgress < 100) {
      setHoldProgress(0);
    }
  };

  const triggerEmergencySOS = () => {
    setIsTriggered(true);
    setIsHolding(false);
    setHoldProgress(100);
    
    const alertMsg = lang === "hi"
      ? "🚨 आपातकालीन एसओएस सक्रिय! एनजीओ व पुलिस सुरक्षा टीम को लाइव लोकेशन भेजी गई है।"
      : lang === "kn"
      ? "🚨 ತುರ್ತು SOS ಸಕ್ರಿಯಗೊಂಡಿದೆ! ರಕ್ಷಣಾ ತಂಡಕ್ಕೆ ಲೈವ್ ಸ್ಥಳ ಕಳುಹಿಸಲಾಗಿದೆ."
      : "🚨 EMERGENCY SOS BROADCASTED! Live GPS & Safety Alert sent to NGO Rapid Response & 112.";
    
    speak(alertMsg);
    toast.error(alertMsg);
  };

  useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearInterval(holdTimerRef.current);
    };
  }, []);

  return (
    <>
      {/* Floating Red SOS Pill (Lifted up above mobile bottom bar) */}
      <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40">
        <button
          onClick={() => {
            setIsOpen(true);
            setHoldProgress(0);
            setIsTriggered(false);
          }}
          className="group flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-black px-4 py-3 rounded-full shadow-2xl border-2 border-rose-400 hover:scale-105 active:scale-95 transition-all min-h-[48px]"
          aria-label="Emergency SOS"
        >
          <Radio className="h-5 w-5 animate-pulse text-white" />
          <span className="text-xs font-black uppercase tracking-wider">
            {lang === "hi" ? "SOS सुरक्षा (2s दबाएं)" : lang === "kn" ? "SOS ತುರ್ತು ಸಹಾಯ" : "SOS Safety"}
          </span>
        </button>
      </div>

      {/* SOS Modal with 2s Hold-to-Confirm Interaction */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-slate-900 shadow-2xl border-4 border-rose-500 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl shrink-0">
                  <ShieldAlert className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-rose-600">
                    {lang === "hi" ? "आपातकालीन सुरक्षा एवं सहायता" : lang === "kn" ? "ತುರ್ತು ಸುರಕ್ಷತೆ ಮತ್ತು ಸಹಾಯ" : "Worker Safety & Emergency SOS"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {lang === "hi" ? "2 सेकंड दबाकर रखें" : lang === "kn" ? "2 ಸೆಕೆಂಡು ಒತ್ತಿಹಿಡಿಯಿರಿ" : "Hold for 2 seconds to broadcast"}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {!isTriggered ? (
              <div className="space-y-4">
                
                {/* Notice of what will be shared */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
                  <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    {lang === "hi" ? "सत्यापित डेटा जो तुरंत साझा होगा:" : "Data that will be transmitted instantly:"}
                  </div>
                  <div className="space-y-1.5 text-slate-600 pt-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                      <span><strong>{lang === "hi" ? "लाइव जीपीएस स्थिति:" : "Live GPS:"}</strong> 12.9352° N, 77.6245° E (±4m)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BatteryMedium className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                      <span><strong>{lang === "hi" ? "बैटरी स्थिति:" : "Battery:"}</strong> 84% • Suresh (ID #WP-084)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span><strong>{lang === "hi" ? "निकटतम एनजीओ यूनिट:" : "NGO Rapid Unit:"}</strong> Hasiru Dala Ward 151 (0.7 km)</span>
                    </div>
                  </div>
                </div>

                {/* 2-Second Hold-to-Confirm Button */}
                <div className="pt-2 text-center">
                  <div className="relative">
                    <button
                      onMouseDown={startHolding}
                      onMouseUp={stopHolding}
                      onMouseLeave={stopHolding}
                      onTouchStart={startHolding}
                      onTouchEnd={stopHolding}
                      className={`w-full min-h-[64px] rounded-2xl font-black text-base transition-all select-none relative overflow-hidden flex items-center justify-center gap-2 shadow-xl ${
                        isHolding 
                          ? "bg-rose-700 text-white scale-[0.98]" 
                          : "bg-rose-600 hover:bg-rose-700 text-white"
                      }`}
                    >
                      {/* Background fill progress bar */}
                      <div 
                        className="absolute left-0 top-0 bottom-0 bg-rose-950/40 transition-all duration-75"
                        style={{ width: `${holdProgress}%` }}
                      />
                      
                      <div className="relative z-10 flex items-center gap-2">
                        <AlertTriangle className={`h-5 w-5 ${isHolding ? 'animate-bounce' : ''}`} />
                        <span>
                          {holdProgress > 0 
                            ? `${lang === "hi" ? "दबाए रखें..." : "HOLDING..."} ${holdProgress}%`
                            : lang === "hi" 
                            ? "एसओएस भेजने हेतु 2 सेकंड दबाएं" 
                            : lang === "kn"
                            ? "ಕಳುಹಿಸಲು 2 ಸೆಕೆಂಡ್ ಒತ್ತಿಹಿಡಿಯಿರಿ"
                            : "HOLD 2 SECONDS TO BROADCAST"}
                        </span>
                      </div>
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-500 mt-2">
                    {lang === "hi" 
                      ? "⚠️ गलती से दबने से बचाने के लिए 2 सेकंड दबाकर रखना आवश्यक है।"
                      : "⚠️ Hold firmly for 2 seconds to prevent accidental triggers."}
                  </p>
                </div>

                {/* Direct Emergency Call Shortcuts */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <a
                    href="tel:112"
                    className="flex items-center justify-center gap-1.5 py-3 px-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-800 text-center min-h-[44px]"
                  >
                    <PhoneCall className="h-4 w-4 text-blue-600" />
                    Police (112)
                  </a>
                  <a
                    href="tel:108"
                    className="flex items-center justify-center gap-1.5 py-3 px-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-800 text-center min-h-[44px]"
                  >
                    <PhoneCall className="h-4 w-4 text-emerald-600" />
                    Ambulance (108)
                  </a>
                </div>

              </div>
            ) : (
              /* Confirmation Dispatched Screen */
              <div className="text-center py-4 space-y-4 animate-in zoom-in">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                
                <div>
                  <h4 className="text-xl font-black text-slate-900">
                    {lang === "hi" ? "🚨 आपातकालीन अलर्ट प्रसारित!" : "🚨 Emergency SOS Dispatched!"}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto leading-relaxed">
                    {lang === "hi" 
                      ? "आपकी लाइव जीपीएस स्थिति 'हसिरू डाला रैपिड रिस्पांस यूनिट' और स्थानीय पीसीआर वैन को भेज दी गई है।" 
                      : "Your live location & worker ID have been sent to Hasiru Dala Safety Unit and Koramangala PCR."}
                  </p>
                </div>

                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-xs text-left space-y-1.5 text-emerald-950">
                  <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                    <ShieldCheck className="h-4 w-4" />
                    {lang === "hi" ? "साझा किया गया विवरण:" : "Transmitted Incident Summary:"}
                  </div>
                  <div>• <strong>Location:</strong> 12.9352° N, 77.6245° E</div>
                  <div>• <strong>Worker:</strong> Suresh (#WP-KA-2026-084)</div>
                  <div>• <strong>Field Coordinator:</strong> Ramesh (+91 98450 12345) en route</div>
                </div>

                <Button 
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold min-h-[48px]" 
                  onClick={() => setIsOpen(false)}
                >
                  {lang === "hi" ? "खिड़की बंद करें" : "Close Window"}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
