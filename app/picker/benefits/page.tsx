"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { MOCK_PICKERS } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Award, HeartPulse, ShieldCheck, TrendingUp, Sparkles, AlertTriangle, 
  CreditCard, CheckCircle2, Lock, ArrowRight, ShieldAlert, Heart, FileText, Info
} from "lucide-react";
import { toast } from "sonner";
import SOSFloatingButton from "@/components/SOSFloatingButton";
import { formatCurrency, formatDate } from "@/lib/formatters";

export default function PickerBenefitsPage() {
  const { user } = useAuth();
  const { lang, t, speak } = useLanguage();
  const [activeTab, setActiveTab] = useState<"karma" | "health">("karma");

  // Microloan Simulator State
  const [loanAmount, setLoanAmount] = useState(5000);
  const [loanTenureMonths, setLoanTenureMonths] = useState(3);
  const [loanApplied, setLoanApplied] = useState(false);

  // Health Claim Modal State
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [claimType, setClaimType] = useState("Accidental Cut / Wound Care");
  const [claimAmount, setClaimAmount] = useState("1200");
  const [claimDesc, setClaimDesc] = useState("");
  const [claimsList, setClaimsList] = useState([
    {
      id: "clm-101",
      type: "Tetanus Vaccine & Clinic Dressing",
      date: "2026-09-28",
      amount: 650,
      status: "approved",
      disbursedVia: "Instant UPI"
    },
    {
      id: "clm-098",
      type: "Eye Protection & Safety Gloves",
      date: "2026-09-10",
      amount: 400,
      status: "approved",
      disbursedVia: "Voucher"
    }
  ]);

  if (!user || user.role !== "picker") {
    return <div className="p-8">Unauthorized. Please log in as a Waste-Picker.</div>;
  }

  const pickerProfile = MOCK_PICKERS.find(p => p.userId === user.id);
  const karmaScore = 782; // Gold Tier
  const nextTierPoints = 850; // Platinum Tier
  const progressPercent = Math.min(100, Math.round(((karmaScore - 700) / (nextTierPoints - 700)) * 100));

  // Loan calculation: 1% nominal social interest rate
  const monthlyInterestRate = 0.01;
  const totalInterest = Math.round(loanAmount * monthlyInterestRate * loanTenureMonths);
  const totalRepayable = loanAmount + totalInterest;
  const monthlyEmi = Math.round(totalRepayable / loanTenureMonths);

  const handleApplyLoan = (e: React.FormEvent) => {
    e.preventDefault();
    setLoanApplied(true);
    const msg = lang === "hi" 
      ? `₹${loanAmount} के माइक्रोलोन का आवेदन सफलतापूर्वक दर्ज हो गया। एनजीओ पार्टनर द्वारा सत्यापन के बाद राशि सीधे UPI खाते में भेजी जाएगी।`
      : `Microloan pre-application for ₹${loanAmount} submitted. Funds will be disbursed to your linked UPI upon verification.`;
    speak(msg);
    toast.success(msg);
  };

  const handleSubmitClaim = (e: React.FormEvent) => {
    e.preventDefault();
    const newClaim = {
      id: `clm-${Date.now().toString().slice(-4)}`,
      type: claimType,
      date: "2026-10-10",
      amount: Number(claimAmount),
      status: "approved",
      disbursedVia: "Instant UPI Direct Escrow"
    };

    setClaimsList([newClaim, ...claimsList]);
    setClaimModalOpen(false);
    const msg = lang === "hi"
      ? `₹${claimAmount} का आपातकालीन स्वास्थ्य क्लेम तुरंत स्वीकृत हो गया!`
      : `Emergency health relief of ₹${claimAmount} approved & disbursed instantly via UPI.`;
    speak(msg);
    toast.success(msg);
  };

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Award className="h-6 w-6 text-emerald-600" />
            {lang === "hi" ? "सफाई मित्र कल्याण व सुरक्षा लाभ" : lang === "kn" ? "ಸಫಾಯಿ ಮಿತ್ರ ಕಲ್ಯಾಣ ಮತ್ತು ಸೌಲಭ್ಯಗಳು" : "Worker Benefits & Welfare Portal"}
          </h2>
          <p className="text-sm text-slate-600 mt-0.5">
            {lang === "hi" 
              ? "कचरा कर्मा क्रेडिट स्कोर, आसान माइक्रोलोन और शून्य-कागजी सुरक्षा कवच हेल्थ फंड।" 
              : "Karma credit scoring, zero-collateral microloans, and Suraksha Kawach health relief pool."}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-xs w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("karma")}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 min-h-[44px] ${
              activeTab === "karma" 
                ? "bg-slate-900 text-white shadow-xs" 
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sparkles className="h-4 w-4 text-amber-400" />
            {lang === "hi" ? "कर्मा क्रेडिट (782 ⭐)" : "Karma Credit (782 ⭐)"}
          </button>
          <button
            onClick={() => setActiveTab("health")}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 min-h-[44px] ${
              activeTab === "health" 
                ? "bg-slate-900 text-white shadow-xs" 
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <HeartPulse className="h-4 w-4 text-rose-500" />
            {lang === "hi" ? "सुरक्षा हेल्थ पूल (₹54,200)" : "Health Safety Pool (₹54.2k)"}
          </button>
        </div>
      </div>

      {activeTab === "karma" ? (
        /* ================= KARMA CREDIT TAB ================= */
        <div className="space-y-6">
          {/* Hero Karma Score Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 bg-gradient-to-br from-slate-900 via-slate-850 to-emerald-950 text-white shadow-xl border-0 rounded-3xl overflow-hidden relative p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-amber-400 text-slate-950 font-black text-xs px-2.5 py-0.5 rounded-lg">
                      🥇 Gold Tier
                    </Badge>
                    <span className="text-xs text-slate-300 font-medium">{lang === "hi" ? "ऋण हेतु पूर्व-स्वीकृत" : "Pre-Approved for Loans"}</span>
                  </div>
                  <h3 className="text-4xl font-black text-amber-300 tracking-tight flex items-center gap-2">
                    782 <span className="text-base text-slate-400 font-normal">/ 900 pts</span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-md">
                    {lang === "hi"
                      ? "समय पर 100% पिकअप, शुद्ध छंटाई और उत्कृष्ट नागरिक समीक्षा के आधार पर आपका कर्मा स्कोर।"
                      : "Alternative credit rating proving reliability through punctual collections & certified waste sorting."}
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center shrink-0 w-full sm:w-44">
                  <div className="text-[11px] uppercase tracking-wider text-slate-300 font-bold">{lang === "hi" ? "माइक्रोलोन सीमा" : "Microloan Limit"}</div>
                  <div className="text-2xl font-black text-emerald-400 mt-0.5">₹10,000</div>
                  <div className="text-[10px] text-emerald-300 font-semibold">{lang === "hi" ? "0% जमानत • तुरंत UPI" : "Zero Collateral • Instant UPI"}</div>
                </div>
              </div>

              {/* Progress to Next Tier */}
              <div className="mt-6 pt-5 border-t border-slate-700/80 relative z-10">
                <div className="flex justify-between items-center text-xs font-bold mb-2">
                  <span className="text-slate-200 flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                    {lang === "hi" ? "अगले टियर (Platinum 850 pts) तक की प्रगति" : "Progress to Platinum Tier (850 pts)"}
                  </span>
                  <span className="text-amber-300">{progressPercent}% • {nextTierPoints - karmaScore} pts to go</span>
                </div>
                <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-300 mt-2">
                  💡 <strong>{lang === "hi" ? "अगला स्तर कैसे पाएं:" : "How to reach next tier:"}</strong>{" "}
                  {lang === "hi" 
                    ? "अगले 12 पिकअप को समय पर पूरा करें और 0 विवाद बनाए रखें। प्लेटिनम टियर में ₹25,000 तक माइक्रोलोन उपलब्ध होगा।" 
                    : "Complete 12 consecutive pickups on time with 0 disputes to unlock ₹25,000 microloan limit."}
                </p>
              </div>
            </Card>

            {/* Quick Stats Pill Card */}
            <Card className="border-slate-200 rounded-3xl bg-white shadow-xs flex flex-col justify-between p-6">
              <div>
                <h4 className="font-bold text-sm text-slate-900 mb-3">{lang === "hi" ? "कर्मा स्कोर के मुख्य आधार" : "Karma Metric Factors"}</h4>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-600 font-medium">⏰ {lang === "hi" ? "समय की पाबंदी" : "Punctuality Rate"}</span>
                    <strong className="text-emerald-700 font-bold">98.4%</strong>
                  </div>
                  <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-600 font-medium">♻️ {lang === "hi" ? "सटीक छंटाई ग्रेड" : "Sorting Precision"}</span>
                    <strong className="text-emerald-700 font-bold">96.0%</strong>
                  </div>
                  <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-600 font-medium">⭐ {lang === "hi" ? "नागरिक संतुष्टि" : "Citizen Rating"}</span>
                    <strong className="text-amber-700 font-bold">4.9 / 5.0</strong>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500">
                {lang === "hi" ? "सत्यापित पहचान: #WP-KA-2026-084" : "Verified Recycler: #WP-KA-2026-084"}
              </div>
            </Card>
          </div>

          {/* Microloan Simulator */}
          <Card className="border-slate-200 rounded-3xl bg-white shadow-xs overflow-hidden">
            <CardHeader className="bg-slate-50/70 border-b border-slate-100 p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-emerald-600" />
                    {lang === "hi" ? "आसान कर्मा माइक्रोलोन सिम्युलेटर" : "Instant Microloan Simulator"}
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 mt-0.5">
                    {lang === "hi" ? "बिना किसी गारंटर या बैंक चक्कर के तुरंत कार्यशील पूंजी प्राप्त करें।" : "Access transparent, low-interest working capital for carts, boots, and tools."}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold text-xs">
                  {lang === "hi" ? "1% मासिक सामाजिक ब्याज" : "1% Flat Nominal Rate"}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <form onSubmit={handleApplyLoan} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  {/* Loan Slider */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        {lang === "hi" ? "ऋण राशि (Loan Amount)" : "Required Amount"}
                      </label>
                      <span className="text-xl font-black text-emerald-600">{formatCurrency(loanAmount)}</span>
                    </div>
                    <input 
                      type="range" 
                      min="1000" 
                      max="10000" 
                      step="500" 
                      value={loanAmount} 
                      onChange={(e) => setLoanAmount(Number(e.target.value))}
                      className="w-full h-3 accent-emerald-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[11px] text-slate-400 font-semibold">
                      <span>₹1,000 (Min)</span>
                      <span>₹5,000</span>
                      <span>₹10,000 (Max Limit)</span>
                    </div>
                  </div>

                  {/* Tenure Selection */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      {lang === "hi" ? "चुकौती अवधि (Repayment Tenure)" : "Repayment Duration"}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 3, 6].map((months) => (
                        <button
                          key={months}
                          type="button"
                          onClick={() => setLoanTenureMonths(months)}
                          className={`py-3 px-2 rounded-xl text-xs font-bold border transition-all ${
                            loanTenureMonths === months 
                              ? "bg-slate-900 text-white border-slate-900 shadow-xs" 
                              : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200"
                          }`}
                        >
                          {months} {lang === "hi" ? "महीने" : "Months"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Repayment Calculation Bar */}
                <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200/90 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase">{lang === "hi" ? "मासिक किस्त (EMI)" : "Monthly EMI"}</div>
                    <div className="text-xl font-black text-slate-900">{formatCurrency(monthlyEmi)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase">{lang === "hi" ? "कुल ब्याज" : "Total Interest"}</div>
                    <div className="text-xl font-black text-emerald-700">{formatCurrency(totalInterest)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase">{lang === "hi" ? "कुल वापसी" : "Total Repayable"}</div>
                    <div className="text-xl font-black text-slate-900">{formatCurrency(totalRepayable)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase">{lang === "hi" ? "वितरण खाता" : "Disbursal Mode"}</div>
                    <div className="text-xs font-black text-emerald-800 mt-1 font-mono">suresh@okaxis (UPI)</div>
                  </div>
                </div>

                {/* Disbursal Action */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                  <div className="text-xs text-slate-500 flex items-start gap-1.5 max-w-md">
                    <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>
                      * <strong>{lang === "hi" ? "वैधानिक नोट:" : "Verification Footnote:"}</strong>{" "}
                      {lang === "hi" 
                        ? "माइक्रोलोन एक पूर्व-स्वीकृत संस्थागत सुविधा है जो एनजीओ पहचान सत्यापन और क्रेडिट ब्यूरो दिशानिर्देशों के अधीन है।" 
                        : "Microloan is an institutional pre-qualified credit facility subject to NGO partner identity verification and standard credit terms."}
                    </span>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full sm:w-auto bg-slate-900 hover:bg-emerald-700 text-white font-bold h-12 px-8 rounded-2xl text-xs shadow-md"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-400" />
                    {lang === "hi" ? `₹${loanAmount} के ऋण हेतु आवेदन करें` : `Apply for ₹${loanAmount} Microloan`}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Achievement Badges with Explicit Unlock Requirements */}
          <Card className="border-slate-200 rounded-3xl bg-white shadow-xs p-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">{lang === "hi" ? "सफलता बैज व टियर अनलॉक शर्तें" : "Achievement Badges & Unlock Criteria"}</h3>
              <p className="text-xs text-slate-500">{lang === "hi" ? "नए बैज अनलॉक करने पर कर्मा स्कोर और ऋण सीमा में वृद्धि होती है" : "Earn verified badges to permanently elevate your credit rating."}</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Badge 1 (Unlocked) */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col justify-between">
                <div>
                  <div className="text-3xl mb-2">🏅</div>
                  <h4 className="font-bold text-sm text-slate-900">{lang === "hi" ? "समयनिष्ठ मास्टर" : "Punctual Master"}</h4>
                  <p className="text-[11px] text-slate-600 mt-1">{lang === "hi" ? "लगातार 25 पिकअप समय पर पूरे किए।" : "Completed 25 consecutive scheduled pickups on time."}</p>
                </div>
                <Badge className="mt-3 bg-emerald-600 text-white text-[10px] w-fit font-bold">{lang === "hi" ? "अनलॉक ✅" : "Unlocked ✅"}</Badge>
              </div>

              {/* Badge 2 (Unlocked) */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col justify-between">
                <div>
                  <div className="text-3xl mb-2">♻️</div>
                  <h4 className="font-bold text-sm text-slate-900">{lang === "hi" ? "शुद्ध सॉर्टर (Pure Sorter)" : "Pure Sorter"}</h4>
                  <p className="text-[11px] text-slate-600 mt-1">{lang === "hi" ? "95%+ शुद्ध रीसाइक्लेबल छंटाई ग्रेड प्राप्त किया।" : "Maintained 95%+ dry recyclable purity grade."}</p>
                </div>
                <Badge className="mt-3 bg-emerald-600 text-white text-[10px] w-fit font-bold">{lang === "hi" ? "अनलॉक ✅" : "Unlocked ✅"}</Badge>
              </div>

              {/* Badge 3 (Locked with requirements) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between opacity-80 hover:opacity-100 transition-opacity">
                <div>
                  <div className="text-3xl mb-2 grayscale">⚡</div>
                  <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1">
                    {lang === "hi" ? "ईएसजी सुपरहीरो" : "ESG Superhero"}
                    <Lock className="h-3 w-3 text-slate-400" />
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    <strong>{lang === "hi" ? "अनलॉक शर्त:" : "Requirement:"}</strong> {lang === "hi" ? "कुल 500 kg सूखा कचरा लैंडफिल से बचाएं (वर्तमान: 340 kg)" : "Divert 500 kg total recyclables (Current: 340 kg)."}
                  </p>
                </div>
                <Badge variant="outline" className="mt-3 bg-white text-slate-600 text-[10px] w-fit font-bold">{lang === "hi" ? "68% प्रगति 🔒" : "68% Done 🔒"}</Badge>
              </div>

              {/* Badge 4 (Locked with requirements) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between opacity-80 hover:opacity-100 transition-opacity">
                <div>
                  <div className="text-3xl mb-2 grayscale">👑</div>
                  <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1">
                    {lang === "hi" ? "शून्य विवाद चैंपियन" : "Zero Dispute Legend"}
                    <Lock className="h-3 w-3 text-slate-400" />
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    <strong>{lang === "hi" ? "अनलॉक शर्त:" : "Requirement:"}</strong> {lang === "hi" ? "बिना किसी विवाद के 100 लगातार पिकअप पूरे करें (वर्तमान: 68/100)" : "Complete 100 consecutive jobs with zero arbitration disputes."}
                  </p>
                </div>
                <Badge variant="outline" className="mt-3 bg-white text-slate-600 text-[10px] w-fit font-bold">{lang === "hi" ? "68/100 पूर्ण 🔒" : "68/100 Done 🔒"}</Badge>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        /* ================= HEALTH SAFETY POOL TAB ================= */
        <div className="space-y-6">
          {/* Health Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-slate-900 to-slate-850 text-white rounded-3xl p-6 shadow-md border-0">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{t("health.poolBalance")}</p>
                  <h3 className="text-3xl font-black text-rose-400">₹54,200</h3>
                  <p className="text-xs text-slate-300 mt-1">{lang === "hi" ? "सामुदायिक टिप व ग्रीन टैक्स से पोषित" : "Citizen pooled tips + CSR Health Pool"}</p>
                </div>
                <div className="p-3 bg-rose-500/20 text-rose-400 rounded-2xl border border-rose-500/30">
                  <Heart className="h-6 w-6" />
                </div>
              </div>
            </Card>

            <Card className="border-slate-200 rounded-3xl bg-white p-6 shadow-xs">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{t("health.yourCoverage")}</p>
                  <h3 className="text-3xl font-black text-slate-900">₹25,000</h3>
                  <p className="text-xs text-emerald-700 font-semibold mt-1">100% {lang === "hi" ? "कैशलेस क्लिनिक सहायता" : "Cashless OPD / Emergency Cover"}</p>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">
                  <ShieldCheck className="h-6 w-6" />
                </div>
              </div>
            </Card>

            <Card className="border-slate-200 rounded-3xl bg-white p-6 shadow-xs flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{lang === "hi" ? "आपातकालीन त्वरित राहत" : "Rapid Relief Disbursal"}</p>
                <h3 className="text-xl font-black text-slate-900">⚡ {lang === "hi" ? "शून्य लालफीताशाही" : "Zero Red-Tape"}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{lang === "hi" ? "सीधे UPI में 10 मिनट में क्लेम" : "Claim deposited to UPI in <10 mins"}</p>
              </div>
              <Button 
                onClick={() => setClaimModalOpen(true)}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs h-10 mt-3 shadow-xs"
              >
                + {lang === "hi" ? "नया मेडिकल क्लेम दर्ज करें" : "File Emergency Claim"}
              </Button>
            </Card>
          </div>

          {/* Claims History */}
          <Card className="border-slate-200 rounded-3xl bg-white shadow-xs overflow-hidden">
            <CardHeader className="bg-slate-50/70 border-b border-slate-100 p-6">
              <CardTitle className="text-base font-bold text-slate-900">{t("health.recentClaims")}</CardTitle>
              <CardDescription className="text-xs text-slate-500">
                {lang === "hi" ? "सत्यापित मेडिकल प्रतिपूर्ति और सुरक्षा उपकरण सहायता का इतिहास" : "Audit ledger of emergency healthcare assistance disbursed to Suresh"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {claimsList.map((claim) => (
                  <div key={claim.id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 mt-0.5">
                        <HeartPulse className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{claim.type}</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {formatDate(claim.date)} • {claim.disbursedVia}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-center">
                      <div className="text-right">
                        <div className="text-lg font-black text-slate-900">{formatCurrency(claim.amount)}</div>
                        <Badge variant="success" className="text-[10px] bg-emerald-100 text-emerald-800 rounded-lg">
                          100% Settled
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Emergency Claim Modal */}
      {claimModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <Card className="w-full max-w-md shadow-2xl rounded-3xl bg-white">
            <CardHeader className="p-5 pb-3 border-b bg-rose-50/80 rounded-t-3xl border-rose-100">
              <CardTitle className="text-base font-bold text-rose-950 flex items-center gap-2">
                <HeartPulse className="h-5 w-5 text-rose-600" />
                {lang === "hi" ? "आपातकालीन चिकित्सा क्लेम आवेदन" : "Emergency Health Relief Claim"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <form onSubmit={handleSubmitClaim} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    {lang === "hi" ? "चिकित्सा सहायता का प्रकार" : "Claim Category"}
                  </label>
                  <select 
                    value={claimType}
                    onChange={(e) => setClaimType(e.target.value)}
                    className="flex h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="Accidental Cut / Wound Care">{lang === "hi" ? "कांच/धातु की चोट व ड्रेसिंग" : "Cuts / Wound Care / Dressing"}</option>
                    <option value="Tetanus & Safety Injections">{lang === "hi" ? "टिटनेस इंजेक्शन व दवाइयां" : "Tetanus Vaccine & Medication"}</option>
                    <option value="Safety Gear (Boots/Gloves)">{lang === "hi" ? "सुरक्षा जूते व भारी दस्ताने" : "Safety Shoes / Heavy Gloves"}</option>
                    <option value="Family Medical OPD">{lang === "hi" ? "पारिवारिक क्लिनिक ओपीडी" : "Family OPD / Doctor Checkup"}</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    {lang === "hi" ? "क्लेम राशि (₹)" : "Claim Amount (₹)"}
                  </label>
                  <Input 
                    type="number"
                    value={claimAmount}
                    onChange={(e) => setClaimAmount(e.target.value)}
                    required
                    min="100"
                    max="5000"
                    className="h-11 rounded-xl font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    {lang === "hi" ? "संक्षिप्त विवरण / क्लिनिक का नाम" : "Clinic Name / Notes"}
                  </label>
                  <textarea 
                    value={claimDesc}
                    onChange={(e) => setClaimDesc(e.target.value)}
                    placeholder={lang === "hi" ? "उदा. कोरमंगला प्राथमिक स्वास्थ्य केंद्र ड्रेसिंग..." : "e.g., Primary Health Centre clinic dressing bill..."}
                    className="flex min-h-[70px] w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <Button type="button" variant="outline" className="flex-1 rounded-xl text-xs font-semibold" onClick={() => setClaimModalOpen(false)}>
                    {t("btn.cancel")}
                  </Button>
                  <Button type="submit" className="flex-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold">
                    {lang === "hi" ? "क्लेम तुरंत जारी करें" : "Submit & Disburse"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* SOS Floating Button */}
      <SOSFloatingButton />
    </div>
  );
}
