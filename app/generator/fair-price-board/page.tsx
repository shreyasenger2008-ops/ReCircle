"use client";

import React, { useState } from "react";
import { useLanguage } from "@/lib/language-context";
import { usePlatformData } from "@/lib/platform-data-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DollarSign, TrendingUp, Calculator, CheckCircle2
} from "lucide-react";

export default function FairPriceBoard() {
  const { lang, t } = useLanguage();
  const { rates } = usePlatformData();
  const [calcMaterial, setCalcMaterial] = useState("Plastic");
  const [calcWeight, setCalcWeight] = useState(15);

  const selectedRate = rates.find(r => r.material.toLowerCase() === calcMaterial.toLowerCase()) || rates[0] || { fairRate: 18, marketRate: 12, material: "Plastic" };
  const marketTotal = selectedRate.marketRate * calcWeight;
  const fairTotal = selectedRate.fairRate * calcWeight;
  const extraWorkerBonus = fairTotal - marketTotal;
  const workerBonusPercent = Math.round((extraWorkerBonus / (marketTotal || 1)) * 100);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-emerald-600" />
            {lang === "hi" ? "प्लेटफॉर्म फेयर फ्लोर व मंडी भाव बोर्ड" : "Platform Fair Price & Mandi Benchmark Board"}
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {lang === "hi" 
              ? "पारदर्शी न्यूनतम दरें जो सुनिश्चित करती हैं कि सफाई मित्रों को बाजार से 33% अधिक उचित मूल्य मिले।"
              : "Transparent floor rates ensuring informal waste workers are paid above-market value."}
          </p>
        </div>
        <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-800 text-xs py-1.5 px-3 font-bold rounded-xl">
          ✅ {lang === "hi" ? "0% प्लेटफॉर्म कमीशन" : "0% Platform Take Rate"}
        </Badge>
      </div>

      {/* Interactive Value Calculator */}
      <Card className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 text-white shadow-md border-0 rounded-2xl overflow-hidden">
        <CardHeader className="p-5 pb-3 border-b border-slate-800">
          <CardTitle className="text-base flex items-center gap-2 text-emerald-400 font-bold">
            <Calculator className="h-5 w-5" />
            {lang === "hi" ? "उचित मूल्य व बिचौलिया-मुक्ति कैलकुलेटर" : "Interactive Fair Value & Anti-Middleman Calculator"}
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            {lang === "hi"
              ? "देखें कि बिचौलियों को हटाकर सफाई मित्र को कितनी अतिरिक्त सीधी आय मिलती है"
              : "See how much extra income goes directly to the waste-picker by eliminating exploitative middlemen"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 sm:p-6">
          <div className="grid md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    {lang === "hi" ? "कचरे का प्रकार" : "Select Material"}
                  </label>
                  <select
                    value={calcMaterial}
                    onChange={(e) => setCalcMaterial(e.target.value)}
                    className="flex h-11 w-full rounded-xl border border-slate-700 bg-slate-800 px-3 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {rates.map(r => (
                      <option key={r.id} value={r.material}>
                        {lang === "hi" ? (r.material === "Plastic" ? "प्लास्टिक" : r.material === "Paper" ? "कागज़" : r.material === "Cardboard" ? "गत्ता" : r.material === "Metal" ? "धातु" : r.material) : r.material} (₹{r.fairRate}/kg)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    {lang === "hi" ? "अनुमानित वजन (kg)" : "Estimated Weight (kg)"}
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={calcWeight}
                    onChange={(e) => setCalcWeight(Number(e.target.value) || 1)}
                    className="h-11 rounded-xl bg-slate-800 border-slate-700 text-white font-bold text-base"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700 text-xs text-slate-300 space-y-1.5">
                <div className="flex justify-between">
                  <span>{lang === "hi" ? "स्थानीय कबाड़ी दर:" : "Local Middleman Rate:"}</span>
                  <span className="font-mono text-slate-400">₹{selectedRate.marketRate}/kg (₹{marketTotal})</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-400">
                  <span>{lang === "hi" ? "ReCircle फेयर फ्लोर दर:" : "ReCircle Fair Rate:"}</span>
                  <span className="font-mono">₹{selectedRate.fairRate}/kg (₹{fairTotal})</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-6 bg-emerald-950/60 p-5 rounded-2xl border border-emerald-500/30 flex flex-col justify-between h-full text-center md:text-left">
              <div>
                <div className="text-xs uppercase tracking-wider text-emerald-300 font-bold mb-1">
                  {lang === "hi" ? "सफाई मित्र को अतिरिक्त लाभ" : "Worker Economic Benefit"}
                </div>
                <div className="text-4xl font-black text-emerald-400">+₹{extraWorkerBonus.toFixed(0)}</div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {lang === "hi"
                    ? `कबाड़ी डीलर की तुलना में सफाई मित्र को +${workerBonusPercent}% अधिक आय मिलती है।`
                    : `Worker earns +${workerBonusPercent}% more compared to selling to predatory scrap dealers.`}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-emerald-500/20 text-[11px] text-emerald-300 flex items-center justify-center md:justify-start gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                {lang === "hi" ? "100% पूरा भुगतान सीधे सफाई मित्र के बैंक खाते में" : "Guaranteed full digital payout directly to worker's UPI"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rates Table */}
      <Card className="shadow-xs border-slate-200 rounded-2xl bg-white overflow-hidden">
        <CardHeader className="p-5 pb-3 border-b border-slate-100 bg-slate-50/50">
          <CardTitle className="text-base font-bold text-slate-900">
            {lang === "hi" ? "लाइव स्क्रैप भाव सूचकांक" : "Live Scrap Commodity Index"}
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            {lang === "hi" ? "औद्योगिक मिल बेंचमार्क के आधार पर प्रतिदिन अपडेट की जाने वाली फ्लोर दरें" : "Floor prices updated daily against industrial mill benchmarks"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] text-slate-500 uppercase bg-slate-50/80 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5 font-bold">{lang === "hi" ? "सामग्री का प्रकार" : "Material Grade"}</th>
                  <th className="px-6 py-3.5 font-bold">{lang === "hi" ? "कबाड़ी दर / kg" : "Middleman Rate / kg"}</th>
                  <th className="px-6 py-3.5 font-bold text-emerald-700">{lang === "hi" ? "ReCircle फेयर दर / kg" : "ReCircle Fair Rate / kg"}</th>
                  <th className="px-6 py-3.5 font-bold">{lang === "hi" ? "छंटाई प्रयास" : "Sorting Effort"}</th>
                  <th className="px-6 py-3.5 font-bold">{lang === "hi" ? "बाजार मांग" : "Market Demand"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {rates.map((rate) => (
                  <tr key={rate.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 text-sm">
                      {lang === "hi" ? (rate.material === "Plastic" ? "प्लास्टिक (Plastic)" : rate.material === "Paper" ? "कागज़ (Paper)" : rate.material === "Cardboard" ? "गत्ता (Cardboard)" : rate.material === "Metal" ? "धातु (Metal)" : rate.material === "Glass" ? "कांच (Glass)" : rate.material) : rate.material}
                    </td>
                    <td className="px-6 py-4 text-slate-400 line-through">
                      ₹{rate.marketRate}
                    </td>
                    <td className="px-6 py-4 font-black text-emerald-600 bg-emerald-50/40 text-sm">
                      <div className="flex items-center gap-1.5">
                        ₹{rate.fairRate}
                        <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={`rounded-lg text-[10px] ${
                        rate.sortingDifficulty === 'high' ? 'border-rose-200 text-rose-700 bg-rose-50' : 
                        rate.sortingDifficulty === 'medium' ? 'border-amber-200 text-amber-700 bg-amber-50' : 
                        'border-blue-200 text-blue-700 bg-blue-50'}
                      `}>
                        {lang === "hi" ? (rate.sortingDifficulty === 'high' ? "कठिन प्रयास" : rate.sortingDifficulty === 'medium' ? "मध्यम प्रयास" : "आसान प्रयास") : `${rate.sortingDifficulty} effort`}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                        rate.demandLevel === 'high' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {lang === "hi" ? (rate.demandLevel === 'high' ? "उच्च मांग" : "सामान्य मांग") : rate.demandLevel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      {/* How is the fair premium funded? */}
      <Card className="shadow-xs border-emerald-200/80 rounded-2xl bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/50 overflow-hidden">
        <CardHeader className="p-5 pb-3 border-b border-emerald-100/60">
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">💡</span>
            {lang === "hi" ? "उचित मूल्य प्रीमियम (Fair Premium) कैसे फंड होता है?" : "How is the Fair Premium Funded?"}
          </CardTitle>
          <CardDescription className="text-xs text-slate-600">
            {lang === "hi" 
              ? "बिना नागरिकों पर अतिरिक्त बोझ डाले सफाई मित्रों को 30-40% अधिक मूल्य कैसे मिलता है?" 
              : "How we provide 30–40% above-market payouts without burdening waste generators:"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-white border border-emerald-100 shadow-2xs space-y-1.5">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">1</span>
                {lang === "hi" ? "बिचौलियों का खात्मा" : "Middlemen Recapture"}
              </div>
              <p className="text-slate-600 leading-relaxed">
                {lang === "hi"
                  ? "पारंपरिक श्रृंखला में 3-4 कबाड़ी डीलर 40% मार्जिन दबा लेते हैं। डायरेक्ट मिल कनेक्शन से यह पैसा सीधे सफाई मित्र को मिलता है।"
                  : "Traditional supply chains have 3–4 layers of scrap dealers taking 40% margins. We connect directly to aggregate mills, returning this margin to pickers."}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-emerald-100 shadow-2xs space-y-1.5">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">2</span>
                {lang === "hi" ? "EPR ब्रांड सब्सिडी" : "Brand EPR Subsidies"}
              </div>
              <p className="text-slate-600 leading-relaxed">
                {lang === "hi"
                  ? "FMCG और पैकेजिंग ब्रांड विस्तारित उत्पादक उत्तरदायित्व (EPR) नियमों के तहत प्रमाणित रीसाइक्लिंग पर प्रति किलो ग्रीन इंसेंटिव देते हैं।"
                  : "FMCG brands fund ethical collection credits under Extended Producer Responsibility (EPR) mandates, directly co-funding worker floor rates."}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-emerald-100 shadow-2xs space-y-1.5">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">3</span>
                {lang === "hi" ? "नगर निगम लैंडफिल बचत" : "Zero-Landfill Grants"}
              </div>
              <p className="text-slate-600 leading-relaxed">
                {lang === "hi"
                  ? "कचरा डंपिंग यार्ड तक न जाने से नगर निगम की टिपिंग फीस बचती है, जिसका एक हिस्सा वर्कर वेलफेयर पूल में डाला जाता है।"
                  : "Diverting dry recyclables at source saves municipal landfill tipping fees. Municipalities share these operational savings with the Suraksha health pool."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}