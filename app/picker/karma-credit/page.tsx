"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { INITIAL_KARMA_PROFILE, KarmaBadge } from "@/lib/karma-score";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, Banknote, ArrowUpRight, CheckCircle2, TrendingUp, Lock } from "lucide-react";
import { toast } from "sonner";
import SOSFloatingButton from "@/components/SOSFloatingButton";

export default function KarmaCreditPage() {
  const { user } = useAuth();
  const { lang, t, speak } = useLanguage();
  const [profile, setProfile] = useState(INITIAL_KARMA_PROFILE);
  const [loanModalOpen, setLoanModalOpen] = useState(false);
  const [loanApplied, setLoanApplied] = useState(false);
  const [selectedLoanAmount, setSelectedLoanAmount] = useState(10000);
  const [loanPurpose, setLoanPurpose] = useState("E-Cart Battery Upgrade");

  if (!user || user.role !== "picker") {
    return <div className="p-8">Unauthorized. Please log in as a Waste-Picker.</div>;
  }

  const handleApplyLoan = (e: React.FormEvent) => {
    e.preventDefault();
    setLoanApplied(true);
    const msg = lang === "hi" 
      ? `₹${selectedLoanAmount.toLocaleString()} का माइक्रोलोन कर्मा स्कोर से स्वीकृत हुआ!`
      : `Loan Application for ₹${selectedLoanAmount.toLocaleString()} Approved via Karma Score!`;
    speak(msg);
    toast.success(msg);
  };

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Award className="h-6 w-6 text-amber-500" />
            {t("karma.title")}
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {t("karma.subtitle")}
          </p>
        </div>
        <Badge variant="outline" className="border-amber-400 bg-amber-50 text-amber-800 text-xs py-1.5 px-3 rounded-xl font-bold">
          ⭐ {lang === "hi" ? "गोल्ड टियर सदस्य" : "Gold Tier Member"}
        </Badge>
      </div>

      {/* Hero Score Gauge */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 text-white shadow-md border-0 rounded-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
            <div className="text-xs uppercase tracking-widest text-slate-400 mb-2">
              {lang === "hi" ? "सत्यापित कर्मा स्कोर" : "Verified Karma Score"}
            </div>

            {/* Score Visual Ring */}
            <div className="relative w-44 h-44 flex items-center justify-center my-3">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-amber-400 stroke-current"
                  strokeWidth="3.5"
                  strokeDasharray={`${(profile.score / 900) * 100}, 100`}
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-black text-amber-400">{profile.score}</span>
                <span className="text-xs text-slate-400">/ 900 {lang === "hi" ? "अंक" : "Points"}</span>
              </div>
            </div>

            <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/40 mt-1 mb-4 rounded-xl text-xs font-semibold">
              {t("karma.excellent")}
            </Badge>

            <p className="text-xs text-slate-300 max-w-xs leading-relaxed">
              {lang === "hi" 
                ? "आपका कर्मा स्कोर शहर के शीर्ष 5% सफाई मित्रों में है। आप बिना गारंटी तुरंत माइक्रोलोन के पात्र हैं।"
                : "Your Karma Score is in the top 5% of city recyclers. You qualify for instant zero-collateral microloans."}
            </p>
          </CardContent>
        </Card>

        {/* Score Drivers Breakdown */}
        <Card className="lg:col-span-2 shadow-xs border-slate-200 rounded-2xl bg-white">
          <CardHeader className="p-5 pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              {lang === "hi" ? "स्कोर कारक और विश्वसनीयता" : "Score Factors & Trust Performance"}
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              {lang === "hi" ? "आपका दैनिक काम किस प्रकार आपकी वित्तीय साख बनाता है" : "How your daily work builds your formal financial credit profile"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="space-y-3.5">
              {/* Factor 1 */}
              <div>
                <div className="flex justify-between text-xs mb-1 font-semibold">
                  <span className="text-slate-700 flex items-center gap-1.5">
                    🌍 {lang === "hi" ? `कुल लैंडफिल से बचाया कचरा (${profile.totalKgRecycled} kg)` : `Total Landfill Diverted (${profile.totalKgRecycled} kg)`}
                  </span>
                  <span className="font-bold text-emerald-600">+140 pts</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "95%" }}></div>
                </div>
              </div>

              {/* Factor 2 */}
              <div>
                <div className="flex justify-between text-xs mb-1 font-semibold">
                  <span className="text-slate-700 flex items-center gap-1.5">
                    ⚖️ {lang === "hi" ? `सटीक वजन व शून्य मिलावट (${profile.weightAccuracyPercent}%)` : `Accurate Weighing & Zero Fraud (${profile.weightAccuracyPercent}%)`}
                  </span>
                  <span className="font-bold text-blue-600">+120 pts</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: "98%" }}></div>
                </div>
              </div>

              {/* Factor 3 */}
              <div>
                <div className="flex justify-between text-xs mb-1 font-semibold">
                  <span className="text-slate-700 flex items-center gap-1.5">
                    ⚡ {lang === "hi" ? `समय की पाबंदी दर (${profile.onTimePunctualityPercent}%)` : `On-Time Punctuality Rate (${profile.onTimePunctualityPercent}%)`}
                  </span>
                  <span className="font-bold text-amber-600">+115 pts</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: "96%" }}></div>
                </div>
              </div>

              {/* Factor 4 */}
              <div>
                <div className="flex justify-between text-xs mb-1 font-semibold">
                  <span className="text-slate-700 flex items-center gap-1.5">
                    ✨ {lang === "hi" ? `उत्कृष्ट छंटाई गुणवत्ता (${profile.zeroContaminationScore}%)` : `Pure Sorting Quality (${profile.zeroContaminationScore}%)`}
                  </span>
                  <span className="font-bold text-purple-600">+100 pts</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: "94%" }}></div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row justify-between items-center gap-4 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
              <div>
                <div className="font-bold text-emerald-900 text-xs">{lang === "hi" ? "उपलब्ध माइक्रोलोन सीमा" : "Unlocked Microloan Limit"}</div>
                <div className="text-2xl font-black text-emerald-700">₹{profile.unlockedLoanAmount.toLocaleString()}</div>
                <div className="text-[11px] text-emerald-800">
                  {lang === "hi" ? "रियायती 2.0% वार्षिक ब्याज दर पर" : "At subsidized 2.0% annual interest rate"}
                </div>
              </div>
              <Button onClick={() => setLoanModalOpen(true)} className="bg-slate-900 hover:bg-emerald-700 text-white shadow-xs rounded-xl text-xs font-bold">
                {t("karma.applyLoan")} <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Badges and Milestones */}
      <Card className="shadow-xs border-slate-200 rounded-2xl bg-white">
        <CardHeader className="p-5 pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900">
            <Award className="h-5 w-5 text-amber-500" />
            {t("karma.badges")}
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            {lang === "hi" ? "बैज अर्जित करके अपना कर्मा स्कोर बढ़ाएं" : "Earn badges to boost your karma score and unlock municipal identity perks"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {profile.badges.map((b) => (
              <div
                key={b.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  b.unlocked
                    ? "bg-gradient-to-b from-amber-50/50 to-white border-amber-200 shadow-xs"
                    : "bg-slate-50 border-slate-200 opacity-60"
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-3xl">{b.icon}</span>
                    {b.unlocked ? (
                      <Badge variant="success" className="bg-emerald-100 text-emerald-800 border-none text-[10px] rounded-lg">
                        {lang === "hi" ? "अनलॉक" : "Unlocked"}
                      </Badge>
                    ) : (
                      <span className="p-1 bg-slate-200 rounded-full text-slate-500">
                        <Lock className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{lang === "hi" ? b.titleHi : b.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{b.description}</p>
                </div>
                {b.unlocked && b.unlockedAt && (
                  <div className="text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-100">
                    {lang === "hi" ? "प्राप्त:" : "Earned:"} {b.unlockedAt}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Micro-Loan Application Modal */}
      {loanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 text-slate-900 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl">
                  <Banknote className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">{t("karma.microloanTitle")}</h3>
                  <p className="text-xs text-slate-500">{t("karma.loanSubtitle")}</p>
                </div>
              </div>
            </div>

            {!loanApplied ? (
              <form onSubmit={handleApplyLoan} className="space-y-4 text-sm">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    {lang === "hi" ? `ऋण राशि चुनें (अधिकतम ₹${profile.unlockedLoanAmount.toLocaleString()})` : `Select Loan Amount (Max ₹${profile.unlockedLoanAmount.toLocaleString()})`}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[5000, 10000, 25000].map((amt) => (
                      <button
                        type="button"
                        key={amt}
                        onClick={() => setSelectedLoanAmount(amt)}
                        className={`py-2.5 px-2 rounded-xl text-center font-bold border transition-all text-xs ${
                          selectedLoanAmount === amt
                            ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                            : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200"
                        }`}
                      >
                        ₹{amt.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    {lang === "hi" ? "ऋण का उद्देश्य" : "Purpose of Loan"}
                  </label>
                  <select
                    className="flex h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={loanPurpose}
                    onChange={(e) => setLoanPurpose(e.target.value)}
                  >
                    <option value="E-Cart Battery Upgrade">{lang === "hi" ? "ई-कार्ट बैटरी अपग्रेड" : "E-Cart Battery Upgrade"}</option>
                    <option value="Pushcart Repairs">{lang === "hi" ? "ठेला मरम्मत व नए पहिए" : "Pushcart Repairs & Heavy-Duty Tires"}</option>
                    <option value="Safety Gear">{lang === "hi" ? "तराजू व सुरक्षा किट" : "Safety Gear & Digital Weighing Scale"}</option>
                    <option value="Medical Need">{lang === "hi" ? "पारिवारिक चिकित्सा सहायता" : "Emergency Family Medical Need"}</option>
                  </select>
                </div>

                <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                  <div className="font-bold flex items-center justify-between">
                    <span>{lang === "hi" ? "मासिक ईएमआई (12 माह):" : "Monthly EMI (12 Months):"}</span>
                    <span className="text-sm font-black text-emerald-700">₹{Math.round((selectedLoanAmount * 1.02) / 12)} / {lang === "hi" ? "माह" : "month"}</span>
                  </div>
                  <div>{lang === "hi" ? "ब्याज दर: 2% वार्षिक (NGO समर्थित)" : "Interest Rate: 2% p.a. (Subsidized)"}</div>
                  <div>{lang === "hi" ? "जमानत: कोई गारंटी नहीं (कर्मा स्कोर 782 द्वारा सुरक्षित)" : "Collateral: None (Secured by Karma Score)"}</div>
                </div>

                <div className="pt-2 flex gap-3">
                  <Button type="button" variant="outline" className="flex-1 rounded-xl text-xs font-semibold" onClick={() => setLoanModalOpen(false)}>
                    {t("btn.cancel")}
                  </Button>
                  <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold">
                    {lang === "hi" ? "स्वीकार करें व पैसे पाएं" : "Confirm & Disburse Funds"}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="text-center py-6 space-y-4 animate-in zoom-in">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900">
                    {lang === "hi" ? "ऋण तुरंत बैंक में भेज दिया गया!" : "Loan Disbursed Instantly!"}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    {lang === "hi"
                      ? `₹${selectedLoanAmount.toLocaleString()} आपके यूपीआई खाते suresh@upi में ट्रांसफर कर दिए गए हैं।`
                      : `₹${selectedLoanAmount.toLocaleString()} has been transferred to your linked UPI VPA: suresh@upi.`}
                  </p>
                </div>
                <Button
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
                  onClick={() => {
                    setLoanApplied(false);
                    setLoanModalOpen(false);
                  }}
                >
                  {lang === "hi" ? "पूर्ण (Done)" : "Done"}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SOS Button */}
      <SOSFloatingButton />
    </div>
  );
}
