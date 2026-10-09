"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { MOCK_HEALTH_CLAIMS, SURAKSHA_HEALTH_POOL_BALANCE, HealthFundClaim } from "@/lib/karma-score";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { HeartPulse, ShieldCheck, Plus, Stethoscope } from "lucide-react";
import { toast } from "sonner";
import SOSFloatingButton from "@/components/SOSFloatingButton";

export default function HealthPoolPage() {
  const { user } = useAuth();
  const { lang, t, speak } = useLanguage();
  const [claims, setClaims] = useState<HealthFundClaim[]>(MOCK_HEALTH_CLAIMS);
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [claimTitle, setClaimTitle] = useState("Glass Cut Clinic First-Aid");
  const [claimAmount, setClaimAmount] = useState(1200);
  const [claimDesc, setClaimDesc] = useState("");
  const [claimType, setClaimType] = useState<"injury" | "illness" | "equipment_damage">("injury");

  if (!user || user.role !== "picker") {
    return <div className="p-8">Unauthorized. Please log in as a Waste-Picker.</div>;
  }

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newClaim: HealthFundClaim = {
      id: `clm-${Date.now()}`,
      pickerId: user.id,
      pickerName: user.name,
      type: claimType,
      title: claimTitle,
      amount: Number(claimAmount),
      description: claimDesc || (lang === "hi" ? "कार्यस्थल पर चोट के लिए आपातकालीन चिकित्सा सहायता।" : "Emergency medical treatment for on-field injury."),
      status: "disbursed",
      date: new Date().toISOString().split("T")[0],
    };

    setClaims([newClaim, ...claims]);
    setClaimModalOpen(false);
    const msg = lang === "hi" 
      ? `₹${claimAmount} की आपातकालीन सहायता स्वीकृत कर आपके यूपीआई में भेज दी गई है!`
      : `Emergency Aid Claim of ₹${claimAmount} Approved & Disbursed!`;
    speak(msg);
    toast.success(msg);
  };

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <HeartPulse className="h-6 w-6 text-rose-500" />
            {t("health.title")}
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {t("health.subtitle")}
          </p>
        </div>
        <Button onClick={() => setClaimModalOpen(true)} className="bg-rose-600 hover:bg-rose-700 text-white shadow-xs rounded-xl text-xs font-bold h-10">
          <Plus className="mr-1.5 h-4 w-4" />
          {t("health.fileClaim")}
        </Button>
      </div>

      {/* Hero Reserve Banner */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 bg-gradient-to-br from-rose-950 via-slate-900 to-slate-950 text-white shadow-md border-0 rounded-2xl">
          <CardContent className="p-6 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between text-xs uppercase tracking-wider text-rose-300 mb-2 font-bold">
                <span>{t("health.poolBalance")}</span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" /> {lang === "hi" ? "सक्रिय" : "Active"}
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-rose-400 mb-1">₹{SURAKSHA_HEALTH_POOL_BALANCE.toLocaleString()}</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {lang === "hi" 
                  ? "नागरिकों द्वारा दिए गए दान व NGO CSR ग्रांट द्वारा वित्तपोषित।" 
                  : "Co-funded by citizen round-up tips & NGO CSR match."}
              </p>
            </div>

            <div className="pt-5 border-t border-slate-800/80 space-y-2 text-xs mt-4">
              <div className="flex justify-between text-slate-300">
                <span>{lang === "hi" ? "प्रति दुर्घटना सहायता सीमा:" : "Coverage Limit per Injury:"}</span>
                <span className="font-bold text-white">₹5,000</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>{lang === "hi" ? "मंजूरी की गति:" : "Approval Speed:"}</span>
                <span className="font-bold text-emerald-400">{lang === "hi" ? "तुरंत (बिना कागजी कार्रवाई)" : "Instant (Zero Paperwork)"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 shadow-xs border-slate-200 rounded-2xl bg-white">
          <CardHeader className="p-5 pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900">
              <Stethoscope className="h-5 w-5 text-rose-600" />
              {lang === "hi" ? "सुरक्षा कवच आपकी कैसे रक्षा करता है" : "How Suraksha Kawach Protects You"}
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              {lang === "hi" ? "रीसाइक्लिंग कार्य के जोखिमों के लिए समर्पित सुरक्षा कवच" : "Social safety net designed specifically for occupational recycling hazards"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 grid sm:grid-cols-3 gap-3.5">
            <div className="p-4 bg-rose-50/60 rounded-2xl border border-rose-100">
              <div className="text-2xl mb-2">🩹</div>
              <h4 className="font-bold text-rose-950 text-sm mb-1">{lang === "hi" ? "कांच व सुई से चोट" : "Glass & Needle Cuts"}</h4>
              <p className="text-xs text-rose-800 leading-relaxed">
                {lang === "hi" ? "टांके, टिटनेस का इंजेक्शन और ड्रेसिंग का तुरंत 100% खर्च।" : "Immediate reimbursement for clinic stitches, tetanus shots, and bandages."}
              </p>
            </div>

            <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-100">
              <div className="text-2xl mb-2">🦺</div>
              <h4 className="font-bold text-amber-950 text-sm mb-1">{lang === "hi" ? "वार्षिक सुरक्षा किट" : "Annual Safety Kits"}</h4>
              <p className="text-xs text-amber-800 leading-relaxed">
                {lang === "hi" ? "साल में दो बार मुफ्त कट-प्रतिरोधी दस्ताने, जूते और जैकेट।" : "Free cut-resistant gloves, safety boots, and reflective jackets provided twice a year."}
              </p>
            </div>

            <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100">
              <div className="text-2xl mb-2">🛞</div>
              <h4 className="font-bold text-blue-950 text-sm mb-1">{lang === "hi" ? "आपात ठेला मरम्मत" : "Emergency Pushcart Repair"}</h4>
              <p className="text-xs text-blue-800 leading-relaxed">
                {lang === "hi" ? "रूट के दौरान ठेले का पहिया या धुरी टूटने पर तुरंत वेल्डिंग सहायता।" : "Immediate roadside welder grant if your cart axle or tire breaks during a route."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Claim History */}
      <Card className="shadow-xs border-slate-200 rounded-2xl bg-white">
        <CardHeader className="p-5 pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900">
            <HeartPulse className="h-5 w-5 text-rose-600" />
            {t("health.recentClaims")}
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            {lang === "hi" ? "सफाई मित्रों को वितरित चिकित्सा सहायता का पारदर्शी विवरण" : "Transparent log of medical aid disbursed to verified waste workers"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {claims.map((claim) => (
              <div key={claim.id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-slate-50 transition-colors">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 bg-rose-50 text-rose-700 rounded-xl mt-0.5 border border-rose-100">
                    <Stethoscope className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      {claim.title}
                      <Badge variant="success" className="bg-emerald-100 text-emerald-800 text-[10px] rounded-lg">
                        {lang === "hi" ? "यूपीआई में भेजा गया" : "Disbursed to UPI"}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{claim.description}</p>
                    <div className="text-[11px] text-slate-400 mt-1">
                      {lang === "hi" ? "लाभार्थी:" : "Beneficiary:"} {claim.pickerName} • {claim.date}
                    </div>
                  </div>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <div className="text-xl font-bold text-rose-600">₹{claim.amount.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">{lang === "hi" ? "आपातकालीन सहायता" : "Emergency Aid Paid"}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Claim Modal */}
      {claimModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 text-slate-900 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-rose-100 text-rose-700 rounded-2xl">
                <HeartPulse className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">{t("health.claimModalTitle")}</h3>
                <p className="text-xs text-slate-500">{lang === "hi" ? "काम के दौरान चोट लगने पर तुरंत आर्थिक सहायता" : "Instant payout for occupational injuries & clinic visits"}</p>
              </div>
            </div>

            <form onSubmit={handleClaimSubmit} className="space-y-4 text-sm">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  {lang === "hi" ? "क्लेम का प्रकार" : "Claim Category"}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setClaimType("injury");
                      setClaimTitle(lang === "hi" ? "कांच/धातु से चोट का इलाज" : "Glass/Metal Cut Treatment");
                    }}
                    className={`p-2.5 rounded-xl text-center text-xs font-bold border transition-all ${
                      claimType === "injury" ? "bg-slate-900 text-white border-slate-900 shadow-xs" : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200"
                    }`}
                  >
                    🩹 {lang === "hi" ? "चोट / घाव" : "Cut / Injury"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setClaimType("illness");
                      setClaimTitle(lang === "hi" ? "डॉक्टर परामर्श व दवा" : "Clinic Doctor Visit");
                    }}
                    className={`p-2.5 rounded-xl text-center text-xs font-bold border transition-all ${
                      claimType === "illness" ? "bg-slate-900 text-white border-slate-900 shadow-xs" : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200"
                    }`}
                  >
                    🩺 {lang === "hi" ? "दवा / क्लिनिक" : "Medicine"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setClaimType("equipment_damage");
                      setClaimTitle(lang === "hi" ? "ठेले की धुरी/पहिया मरम्मत" : "Pushcart Axle Breakdown");
                    }}
                    className={`p-2.5 rounded-xl text-center text-xs font-bold border transition-all ${
                      claimType === "equipment_damage" ? "bg-slate-900 text-white border-slate-900 shadow-xs" : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200"
                    }`}
                  >
                    🛞 {lang === "hi" ? "ठेला मरम्मत" : "Cart Welder"}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  {lang === "hi" ? "आवश्यक सहायता राशि (₹)" : "Claim Amount Needed (₹)"}
                </label>
                <Input
                  type="number"
                  min="100"
                  max="5000"
                  value={claimAmount}
                  onChange={(e) => setClaimAmount(Number(e.target.value))}
                  required
                  className="rounded-xl h-10 text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  {lang === "hi" ? "घटना का विवरण" : "Incident Description"}
                </label>
                <textarea
                  className="flex min-h-[70px] w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder={lang === "hi" ? "क्या हुआ था संक्षेप में बताएं (उदा: गत्ता उठाते समय कांच से बाएं हाथ पर कट लगा)..." : "Describe what happened..."}
                  value={claimDesc}
                  onChange={(e) => setClaimDesc(e.target.value)}
                />
              </div>

              <div className="pt-2 flex gap-3">
                <Button type="button" variant="outline" className="flex-1 rounded-xl text-xs font-semibold" onClick={() => setClaimModalOpen(false)}>
                  {t("btn.cancel")}
                </Button>
                <Button type="submit" className="flex-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold">
                  {t("health.claimSubmit")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SOS Button */}
      <SOSFloatingButton />
    </div>
  );
}
