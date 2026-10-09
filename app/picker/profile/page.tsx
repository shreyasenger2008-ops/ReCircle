"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { MOCK_PICKERS } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, ShieldCheck, MapPin, Save, QrCode, Lock, Smartphone, CreditCard, ShieldAlert, CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import SOSFloatingButton from "@/components/SOSFloatingButton";
import OTPVerificationModal from "@/components/OTPVerificationModal";

export default function PickerProfilePage() {
  const { user } = useAuth();
  const { lang, t, speak } = useLanguage();
  const pickerProfile = MOCK_PICKERS.find(p => p.userId === user?.id);

  const [name] = useState(user?.name || "Suresh (Picker)");
  const [phone, setPhone] = useState(user?.phone || "+91 98765 43212");
  const [upiVpa, setUpiVpa] = useState("suresh@okaxis");
  const [vehicle, setVehicle] = useState("Manual Pushcart (Thela)");
  const [materials, setMaterials] = useState<string[]>(pickerProfile?.materialsHandled || ["Plastic", "Cardboard", "Metal"]);
  const [serviceAreas, setServiceAreas] = useState<string[]>(pickerProfile?.serviceAreas || ["Koramangala", "HSR Layout", "BTM Layout"]);

  // OTP Modal State
  const [isOtpOpen, setIsOtpOpen] = useState(false);
  const [otpTarget, setOtpTarget] = useState<"phone" | "upi">("phone");

  if (!user || user.role !== "picker") {
    return <div className="p-8">Unauthorized. Please log in as a Waste-Picker.</div>;
  }

  const openOtpModal = (target: "phone" | "upi") => {
    setOtpTarget(target);
    setIsOtpOpen(true);
  };

  const handleVerifiedSuccess = (newVal: string) => {
    if (otpTarget === "phone") {
      setPhone(newVal);
    } else {
      setUpiVpa(newVal);
    }
  };

  const handleSaveOperational = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = lang === "hi" 
      ? "सफाई मित्र वाहन व कार्य संचालन सेटिंग्स सुरक्षित कर ली गईं!" 
      : "Worker vehicle capacity & operational settings saved!";
    speak(msg);
    toast.success(msg);
  };

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <User className="h-6 w-6 text-emerald-600" />
            {lang === "hi" ? "सफाई मित्र पहचान व सुरक्षा सेटिंग्स" : "Worker Profile & Payout Security"}
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {lang === "hi" ? "आधिकारिक नगर निगम क्रेडेंशियल्स, सुरक्षित UPI भुगतान और कार्य क्षेत्र।" : "Official municipal recycler credentials, OTP-secured UPI settlement, and operational wards."}
          </p>
        </div>
        <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-800 text-xs py-1.5 px-3 flex items-center gap-1.5 font-bold rounded-xl">
          <ShieldCheck className="h-4 w-4 text-emerald-600" /> {lang === "hi" ? "नगर निगम प्रमाणित रीसायकलर" : "Municipal Certified Worker"}
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Digital Worker Identity Card */}
        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 text-white shadow-md border-0 rounded-2xl overflow-hidden relative">
            <div className="bg-emerald-600 px-4 py-2 text-center text-slate-950 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-1">
              <ShieldCheck className="h-4 w-4" /> {lang === "hi" ? "आधिकारिक रीसायकलर पहचान पत्र" : "Official Waste Recycler ID"}
            </div>
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-20 h-20 rounded-2xl bg-emerald-500 text-slate-950 font-black text-3xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 border-2 border-white/20">
                {name.charAt(0)}
              </div>

              <div>
                <h3 className="font-bold text-lg text-white flex items-center justify-center gap-1.5">
                  {name}
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                </h3>
                <div className="text-xs text-slate-400 font-mono">Reg ID: #WP-KA-2026-084</div>
                <div className="text-xs text-emerald-400 font-semibold mt-1">{lang === "hi" ? "विश्वसनीयता रेटिंग: 4.8 / 5.0 ⭐" : "Trust Rating: 4.8 / 5.0 ⭐"}</div>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-xs text-left space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>{lang === "hi" ? "वाहन:" : "Vehicle:"}</span>
                  <span className="font-bold text-white">{vehicle}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>{lang === "hi" ? "यूपीआई आईडी:" : "Settlement UPI:"}</span>
                  <span className="font-mono text-emerald-400">{upiVpa}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>{lang === "hi" ? "कर्मा स्कोर:" : "Karma Score:"}</span>
                  <span className="font-bold text-amber-400">782 (Gold)</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-center gap-2 text-xs text-slate-400">
                <QrCode className="h-4 w-4 text-slate-300" /> {lang === "hi" ? "आधार व नगर निगम द्वारा सत्यापित" : "Verified via Municipal Portal"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Protected Worker Profile & Operations Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-xs border-slate-200 rounded-2xl bg-white">
            <CardHeader className="p-5 pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900">{lang === "hi" ? "सफाई मित्र पहचान व सुरक्षित भुगतान" : "Worker Identity & Secure Payouts"}</CardTitle>
                  <CardDescription className="text-xs text-slate-500 mt-0.5">
                    {lang === "hi" ? "पहचान नगर निगम द्वारा लॉक है। फोन और भुगतान UPI केवल OTP सत्यापन से ही बदले जा सकते हैं।" : "Worker ID is locked. Phone and UPI payout account require live OTP verification to prevent unauthorized changes."}
                  </CardDescription>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                  <ShieldCheck className="h-4 w-4" /> {lang === "hi" ? "बायोमेट्रिक प्रमाणित" : "KYC Locked"}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              
              {/* Security Notice */}
              <div className="p-3.5 bg-amber-50/80 border border-amber-200/90 rounded-2xl flex items-start gap-3 text-xs text-amber-900 font-semibold">
                <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900">
                    {lang === "hi" ? "सफाई मित्र वित्तीय सुरक्षा नीति (Payout Protection Policy)" : "Direct Payout Protection"}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    {lang === "hi"
                      ? "आपके दैनिक पारिश्रमिक की सुरक्षा हेतु, UPI आईडी और फोन नंबर बदलने के लिए पंजीकृत सिम पर 6-अंकीय OTP सत्यापन अनिवार्य है।"
                      : "To safeguard your hard-earned recycling wages, modifying your payout UPI ID or Phone number requires instant 6-digit OTP confirmation."}
                  </p>
                </div>
              </div>

              {/* Grid 1: Worker Name (Locked) & Phone (OTP Protected) */}
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Worker Name: KYC Locked */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {lang === "hi" ? "सफाई मित्र का नाम" : "Worker Legal Name"}
                    </label>
                    <span className="text-[10px] font-black text-slate-400 flex items-center gap-1">
                      <Lock className="h-3 w-3" /> {lang === "hi" ? "अपरिवर्तनीय" : "Non-Editable"}
                    </span>
                  </div>
                  <div className="h-11 px-3.5 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between text-xs font-bold text-slate-800">
                    <span>{name}</span>
                    <Badge variant="secondary" className="bg-slate-200/80 text-slate-700 text-[10px] font-bold">
                      🔒 Municipal Verified
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

              {/* Grid 2: Settlement UPI ID (OTP Protected) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {lang === "hi" ? "सीधे भुगतान हेतु UPI खाता (Payout VPA)" : "Direct Payout UPI ID (Settlement Account)"}
                  </label>
                  <span className="text-[10px] font-black text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> {lang === "hi" ? "सत्यापित खाता" : "Bank Linked"}
                  </span>
                </div>
                <div className="h-11 px-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-bold text-slate-800">
                  <div className="flex items-center gap-2 pl-1">
                    <CreditCard className="h-4 w-4 text-emerald-600" />
                    <span className="font-mono text-emerald-800 font-bold">{upiVpa}</span>
                  </div>
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="outline"
                    onClick={() => openOtpModal("upi")} 
                    className="h-8 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border-emerald-300 rounded-lg"
                  >
                    <Lock className="h-3 w-3 mr-1" /> {lang === "hi" ? "सुरक्षित OTP से बदलें" : "Change (OTP)"}
                  </Button>
                </div>
              </div>

              {/* Form for Operational Settings */}
              <form onSubmit={handleSaveOperational} className="space-y-4 pt-3 border-t border-slate-100">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    {lang === "hi" ? "परिवहन वाहन क्षमता" : "Transport Vehicle & Payload"}
                  </label>
                  <select
                    value={vehicle}
                    onChange={(e) => setVehicle(e.target.value)}
                    className="flex h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Manual Pushcart (Thela)">{lang === "hi" ? "हाथ ठेला (Max 100kg)" : "Manual Pushcart (Max 100kg)"}</option>
                    <option value="Cycle Rickshaw (रिक्शा)">{lang === "hi" ? "साइकिल रिक्शा (Max 60kg)" : "Cycle Rickshaw (Max 60kg)"}</option>
                    <option value="On Foot Sack (बोरी)">{lang === "hi" ? "पैदल बोरी (Max 20kg)" : "On Foot Sack (Max 20kg)"}</option>
                    <option value="Electric E-Loader">{lang === "hi" ? "ई-लोडर रिक्शा (Max 300kg)" : "Electric E-Loader (Max 300kg)"}</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    {lang === "hi" ? "सक्रिय कार्य क्षेत्र (वार्ड)" : "Operational Service Wards"}
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {serviceAreas.map((area, idx) => (
                      <span key={idx} className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-emerald-600" /> {area}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button type="submit" className="bg-slate-900 hover:bg-emerald-700 text-white gap-1.5 rounded-xl px-6 text-xs font-bold h-10 shadow-md">
                    <Save className="h-4 w-4" /> {lang === "hi" ? "वाहन सेटिंग्स सुरक्षित करें" : "Save Operational Settings"}
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
        currentValue={otpTarget === "phone" ? phone : upiVpa}
        onVerifiedSuccess={handleVerifiedSuccess}
      />

      {/* SOS Button */}
      <SOSFloatingButton />
    </div>
  );
}