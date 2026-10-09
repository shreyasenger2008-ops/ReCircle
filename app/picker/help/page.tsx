"use client";

import React, { useState } from "react";
import { useLanguage } from "@/lib/language-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldAlert, PhoneCall, HeartPulse, Volume2, MessageCircle, Stethoscope, Sparkles
} from "lucide-react";
import SOSFloatingButton from "@/components/SOSFloatingButton";
import { speakText, LanguageCode } from "@/lib/voice-assistant";
import { toast } from "sonner";

export default function PickerHelpPage() {
  const { lang, t, speak } = useLanguage();

  const safetyRules = [
    {
      title: lang === "hi" ? "1. कांच व नुकीली वस्तुएं (Broken Glass & Sharp Objects)" : "1. Broken Glass & Sharp Objects",
      desc: lang === "hi" 
        ? "कचरा उठाते समय कभी भी नंगे हाथों का प्रयोग न करें। हमेशा कट-प्रतिरोधी रबर दस्ताने पहनें। यदि चोट लग जाए, तो साफ कपड़े से दबाएं और सुरक्षा कवच से तुरंत सहायता क्लेम करें।"
        : "Never reach into bags with bare hands. Always wear rubber-coated puncture-resistant gloves. If cut, press clean cloth on the wound and claim instant First-Aid funds from Suraksha Kawach.",
      icon: "🧤"
    },
    {
      title: lang === "hi" ? "2. भारी ठेला संचालन (Heavy Pushcart Handling)" : "2. Heavy Pushcart Handling",
      desc: lang === "hi"
        ? "रूट प्लानर के डाउनहिल क्लस्टरिंग का उपयोग करें। अकेले 80kg से अधिक भारी ठेला चढ़ाई पर न खींचें। ढलान पर रुकते समय हमेशा पहियों में गुटका लगाएं।"
        : "Use the Route Planner's downhill clustering. Never push >80kg uphill alone. Always engage wooden wheel wedges when stopping on inclined slopes.",
      icon: "🛒"
    },
    {
      title: lang === "hi" ? "3. बैटरी व रासायनिक रिसाव (Leaking Batteries & Chemicals)" : "3. Leaking Batteries & Chemicals",
      desc: lang === "hi"
        ? "फूली हुई लिथियम-आयन मोबाइल बैटरी को न दबाएं। कार बैटरी के एसिड को हाथ न लगाएं। ई-कचरे को अलग प्लास्टिक टब में रखें।"
        : "Do not puncture swelling lithium-ion phone batteries or touch leaking car battery acids. Keep e-waste segregated in separate heavy-duty plastic tubs.",
      icon: "🔋"
    },
    {
      title: lang === "hi" ? "4. पक्की कमाई व रेट विवाद (Fair Floor Protection)" : "4. Fair Payout Protection",
      desc: lang === "hi"
        ? "सामग्री उठाने से पहले डिजिटल तराजू का वजन जरूर जांचें। यदि कोई नागरिक उचित मूल्य देने से मना करे, तो 'शिकायत दर्ज करें' बटन दबाएं—बहस न करें।"
        : "Always verify the weighing scale reading before leaving the pickup location. If a customer refuses to pay fair rate, tap 'Raise Dispute'—never engage in verbal arguments.",
      icon: "⚖️"
    }
  ];

  const handleSpeakSafety = () => {
    const langCode = (lang === "hi" ? "hi-IN" : lang === "kn" ? "kn-IN" : "en-IN") as LanguageCode;
    const msg = lang === "hi"
      ? "सुरक्षा निर्देश: कांच और लोहे के कबाड़ को हमेशा दस्ताने पहनकर छुएं। चोट लगने पर तुरंत सुरक्षा कवच से फर्स्ट-एड क्लेम करें। आपातकाल में लाल एसओएस बटन दबाएं।"
      : "Worker safety instructions: Always wear puncture-resistant gloves when handling scrap. Use the downhill route planner to avoid physical strain. In emergencies, tap the red SOS button.";
    speakText(msg, langCode);
    toast.info(lang === "hi" ? "🔊 सुरक्षा गाइड का ऑडियो चल रहा है..." : "🔊 Playing safety audio guide...");
  };

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-rose-600" />
            {lang === "hi" ? "सुरक्षा दिशानिर्देश व आपातकालीन हेल्पलाइन" : "Worker Safety Guidelines & Helpline"}
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {lang === "hi" ? "व्यावसायिक स्वास्थ्य नियम, प्राथमिक चिकित्सा और 24/7 हेल्पलाइन नंबर।" : "Occupational health protocols, first-aid procedures, and emergency contacts."}
          </p>
        </div>
        <Button onClick={handleSpeakSafety} variant="outline" className="gap-2 border-emerald-300 text-emerald-800 bg-emerald-50 rounded-xl text-xs font-semibold">
          <Volume2 className="h-4 w-4 text-emerald-600" />
          {lang === "hi" ? "ऑडियो सुनें (Listen)" : "Listen Audio Guide"}
        </Button>
      </div>

      {/* Emergency Helpline Banner */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-rose-600 text-white p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-rose-200 font-bold">{lang === "hi" ? "आपातकालीन एम्बुलेंस" : "Emergency Ambulance"}</div>
            <div className="text-2xl font-black mt-1">108 / 112</div>
            <div className="text-xs text-rose-100">{lang === "hi" ? "24x7 तत्काल चिकित्सा सेवा" : "24x7 Medical Response"}</div>
          </div>
          <PhoneCall className="h-8 w-8 text-rose-200" />
        </div>

        <div className="bg-emerald-700 text-white p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-emerald-200 font-bold">{lang === "hi" ? "सफाई मित्र हेल्पलाइन" : "ReCircle Support"}</div>
            <div className="text-2xl font-black mt-1">1800-419-7324</div>
            <div className="text-xs text-emerald-100">{lang === "hi" ? "निशुल्क सहायता केंद्र" : "Toll-Free Worker Desk"}</div>
          </div>
          <MessageCircle className="h-8 w-8 text-emerald-200" />
        </div>

        <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-amber-400 font-bold">{lang === "hi" ? "सुरक्षा कवच दावा" : "Suraksha Aid Pool"}</div>
            <div className="text-2xl font-black mt-1">₹5,000 / {lang === "hi" ? "चोट" : "claim"}</div>
            <div className="text-xs text-slate-300">{lang === "hi" ? "तुरंत बिना कागजी कार्रवाई" : "Instant Zero-Paperwork"}</div>
          </div>
          <HeartPulse className="h-8 w-8 text-rose-400" />
        </div>
      </div>

      {/* Safety Protocol Cards */}
      <Card className="shadow-xs border-slate-200 rounded-2xl bg-white">
        <CardHeader className="p-5 pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-slate-900">
            {lang === "hi" ? "अनिवार्य कार्यस्थल सुरक्षा नियम" : "Mandatory On-Field Safety Rules"}
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            {lang === "hi" ? "अपने स्वास्थ्य और शारीरिक सुरक्षा के लिए इन 4 नियमों का पालन करें" : "Follow these 4 safety habits to protect your health while collecting recyclables"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid sm:grid-cols-2 gap-4">
            {safetyRules.map((rule, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex gap-3.5">
                <div className="text-3xl shrink-0 p-2 bg-white rounded-xl h-fit border border-slate-100">{rule.icon}</div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1">{rule.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{rule.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* SOS Button */}
      <SOSFloatingButton />
    </div>
  );
}