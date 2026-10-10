"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, ShieldCheck, Bell, Share2, Copy, Leaf, Save, Lock, Smartphone, Mail, CheckCircle2, ShieldAlert
} from "lucide-react";
import { toast } from "sonner";
import OTPVerificationModal from "@/components/OTPVerificationModal";

export default function GeneratorProfilePage() {
  const { user } = useAuth();
  const { lang, t, speak } = useLanguage();
  
  const [name] = useState(user?.name || "Rajesh Kumar");
  const [email, setEmail] = useState(user?.email || "rajesh@example.com");
  const [phone, setPhone] = useState(user?.phone || "+91 98765 43210");
  const [primaryAddress, setPrimaryAddress] = useState(user?.address || "12, MG Road, Koramangala, Bengaluru - 560034");

  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [autoRoundUp, setAutoRoundUp] = useState(true);

  // OTP Modal State
  const [isOtpOpen, setIsOtpOpen] = useState(false);
  const [otpTarget, setOtpTarget] = useState<"phone" | "email">("phone");

  if (!user || user.role !== "generator") {
    return <div className="p-8">Unauthorized. Please log in as a Citizen Generator.</div>;
  }

  const openOtpModal = (target: "phone" | "email") => {
    setOtpTarget(target);
    setIsOtpOpen(true);
  };

  const handleVerifiedSuccess = (newVal: string) => {
    if (otpTarget === "phone") {
      setPhone(newVal);
    } else {
      setEmail(newVal);
    }
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = lang === "hi" 
      ? "पिकअप प्राथमिकताएं व पता सुरक्षित कर लिए गए हैं!" 
      : "Pickup preferences and address saved successfully!";
    speak(msg);
    toast.success(msg);
  };

  const copyReferral = () => {
    navigator.clipboard.writeText("https://recircle.app/join?ref=RAJESH84");
    toast.success(lang === "hi" ? "रेफरल लिंक कॉपी हुआ! पड़ोसियों के साथ साझा करें (+100 कर्मा अंक)।" : "Referral link copied! Share with neighbors for +100 Green Karma points.");
  };

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <User className="h-6 w-6 text-emerald-600" />
            {lang === "hi" ? "नागरिक प्रोफ़ाइल व सुरक्षा सेटिंग्स" : "Citizen Profile & Security Settings"}
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {lang === "hi" ? "सत्यापित पहचान, पता, ग्रीन क्रेडेंशियल्स और ओटीपी-सुरक्षित संपर्क विवरण।" : "Verified KYC credentials, address, and OTP-protected contact details."}
          </p>
        </div>
        <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-800 text-xs py-1.5 px-3 font-bold rounded-xl flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          🌱 {lang === "hi" ? "आधार प्रमाणित इको-सिटिजन" : "KYC Verified Eco-Citizen"}
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <Card className="shadow-xs border-slate-200 rounded-2xl bg-white">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black text-3xl shadow-lg shadow-emerald-500/20">
                {name.charAt(0)}
              </div>
              <span className="absolute bottom-0 right-0 p-1 bg-white rounded-full shadow-xs">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
              </span>
            </div>

            <h3 className="font-bold text-base text-slate-900 flex items-center gap-1.5">
              {name}
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{email}</p>
            <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
              <Lock className="h-3 w-3 text-slate-400" /> {lang === "hi" ? "सरकारी आईडी से लॉक" : "Government ID Bound"}
            </div>

            <div className="w-full my-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-center">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{lang === "hi" ? "विश्वास स्कोर" : "Trust Score"}</div>
                <div className="font-black text-emerald-600 text-base">4.8 / 5.0</div>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{lang === "hi" ? "ग्रीन रैंक" : "Green Rank"}</div>
                <div className="font-black text-amber-600 text-base">{lang === "hi" ? "वार्ड #1" : "#1 Ward"}</div>
              </div>
            </div>

            {/* Referral Banner */}
            <div className="w-full p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 text-left space-y-2 mt-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                <Share2 className="h-4 w-4 text-emerald-600" /> {lang === "hi" ? "अपनी सोसाइटी को आमंत्रित करें" : "Invite Your Society"}
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                {lang === "hi"
                  ? "अपने पड़ोसियों को पहले पिकअप पर ₹50 की छूट दें और +100 ग्रीन कर्मा पाएं।"
                  : "Give your neighbors ₹50 off their first fair pickup & earn +100 Green Karma."}
              </p>
              <Button size="sm" onClick={copyReferral} className="w-full h-8 text-xs bg-slate-900 hover:bg-slate-800 text-white gap-1.5 rounded-xl font-bold">
                <Copy className="h-3 w-3" /> {lang === "hi" ? "इनवाइट लिंक कॉपी करें" : "Copy Invite Link"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Protected Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-xs border-slate-200 rounded-2xl bg-white">
            <CardHeader className="p-5 pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900">{lang === "hi" ? "पहचान व 2-स्टेप सुरक्षा विवरण" : "Identity & Security Details"}</CardTitle>
                  <CardDescription className="text-xs text-slate-500 mt-0.5">
                    {lang === "hi" ? "नाम व आईडी स्थायी हैं। फोन और ईमेल केवल OTP सत्यापन के बाद ही बदले जा सकते हैं।" : "Full Name is KYC-locked. Contact details can only be changed via live 2-step OTP verification."}
                  </CardDescription>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                  <ShieldCheck className="h-4 w-4" /> {lang === "hi" ? "सुरक्षित खाता" : "2FA Protected"}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              
              {/* Security Notice Banner */}
              <div className="p-3.5 bg-amber-50/80 border border-amber-200/90 rounded-2xl flex items-start gap-3 text-xs text-amber-900 font-semibold">
                <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900">
                    {lang === "hi" ? "खाता सुरक्षा नीति (Account Protection Policy)" : "Identity Protection Rule"}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    {lang === "hi"
                      ? "धोखाधड़ी रोकने के लिए पंजीकृत नाम में सीधे बदलाव की अनुमति नहीं है। फोन व ईमेल बदलने के लिए 6-अंकीय OTP सत्यापन अनिवार्य है।"
                      : "To prevent identity fraud and unauthorized payouts, citizen names cannot be directly modified. Phone number and Email updates require a verified 6-digit OTP."}
                  </p>
                </div>
              </div>

              {/* Grid 1: Name (Locked) & Phone (OTP Protected) */}
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Name: KYC Locked */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {lang === "hi" ? "नागरिक का नाम" : "Full Legal Name"}
                    </label>
                    <span className="text-[10px] font-black text-slate-400 flex items-center gap-1">
                      <Lock className="h-3 w-3" /> {lang === "hi" ? "अपरिवर्तनीय" : "Non-Editable"}
                    </span>
                  </div>
                  <div className="h-11 px-3.5 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between text-xs font-bold text-slate-800">
                    <span>{name}</span>
                    <Badge variant="secondary" className="bg-slate-200/80 text-slate-700 text-[10px] font-bold">
                      🔒 KYC Locked
                    </Badge>
                  </div>
                </div>

                {/* Phone: OTP Protected */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {lang === "hi" ? "पंजीकृत फोन नंबर" : "Registered Phone"}
                    </label>
                    <span className="text-[10px] font-black text-emerald-600 flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" /> {lang === "hi" ? "सत्यापित" : "Verified"}
                    </span>
                  </div>
                  <div className="h-11 px-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-bold text-slate-800">
                    <span className="font-mono pl-1">{phone}</span>
                    <Button 
                      type="button" 
                      size="sm" 
                      variant="outline"
                      onClick={() => openOtpModal("phone")} 
                      className="h-8 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border-emerald-300 rounded-lg"
                    >
                      <Smartphone className="h-3 w-3 mr-1" /> {lang === "hi" ? "OTP से बदलें" : "Change (OTP)"}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Grid 2: Email (OTP Protected) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {lang === "hi" ? "पंजीकृत ईमेल पता" : "Registered Email"}
                  </label>
                  <span className="text-[10px] font-black text-emerald-600 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" /> {lang === "hi" ? "सत्यापित" : "Verified"}
                  </span>
                </div>
                <div className="h-11 px-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-bold text-slate-800">
                  <span className="font-mono pl-1">{email}</span>
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="outline"
                    onClick={() => openOtpModal("email")} 
                    className="h-8 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border-emerald-300 rounded-lg"
                  >
                    <Mail className="h-3 w-3 mr-1" /> {lang === "hi" ? "OTP से बदलें" : "Change (OTP)"}
                  </Button>
                </div>
              </div>

              {/* Form for Address and Preferences */}
              <form onSubmit={handleSavePreferences} className="space-y-4 pt-3 border-t border-slate-100">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    {lang === "hi" ? "प्राथमिक पिकअप पता (संपादनीय)" : "Primary Pickup Address (Editable)"}
                  </label>
                  <textarea
                    className="flex min-h-[85px] w-full rounded-xl border-2 border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs"
                    value={primaryAddress}
                    onChange={(e) => setPrimaryAddress(e.target.value)}
                    placeholder="Enter your street, building, and apartment number"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{lang === "hi" ? "प्राथमिकताएं" : "Preferences"}</h4>
                  
                  <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <Bell className="h-4 w-4 text-emerald-600" />
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          {lang === "hi" ? "व्हाट्सएप डिस्पैच अलर्ट" : "WhatsApp Dispatch Alerts"}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {lang === "hi" ? "सफाई मित्र के पहुंचते ही तुरंत व्हाट्सएप संदेश प्राप्त करें" : "Receive instant WhatsApp message when picker arrives"}
                        </div>
                      </div>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={whatsappAlerts} 
                      onChange={(e) => setWhatsappAlerts(e.target.checked)}
                      className="h-4 w-4 text-emerald-600 rounded border-slate-300"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <Leaf className="h-4 w-4 text-rose-600" />
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          {lang === "hi" ? "सुरक्षा हेल्थ फंड हेतु ऑटो राउंड-अप" : "Auto Round-Up for Suraksha Health Pool"}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {lang === "hi" ? "सफाई मित्र क्लिनिक फंड के लिए भुगतान को निकटतम ₹10 तक राउंड अप करें" : "Round up payments to the nearest ₹10 for picker clinic fund"}
                        </div>
                      </div>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={autoRoundUp} 
                      onChange={(e) => setAutoRoundUp(e.target.checked)}
                      className="h-4 w-4 text-rose-600 rounded border-slate-300"
                    />
                  </label>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button type="submit" className="bg-slate-900 hover:bg-emerald-700 text-white gap-1.5 rounded-xl px-6 text-xs font-bold h-10 shadow-md">
                    <Save className="h-4 w-4" /> {lang === "hi" ? "पता व प्राथमिकताएं सुरक्षित करें" : "Save Address & Preferences"}
                  </Button>
                </div>
              </form>

            </CardContent>
          </Card>
        </div>
      </div>

      {/* 2-Step OTP Verification Modal */}
      <OTPVerificationModal
        isOpen={isOtpOpen}
        onClose={() => setIsOtpOpen(false)}
        targetType={otpTarget}
        currentValue={otpTarget === "phone" ? phone : email}
        onVerifiedSuccess={handleVerifiedSuccess}
      />
    </div>
  );
}