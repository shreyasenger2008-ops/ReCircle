"use client";

import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { MOCK_REQUESTS, MOCK_IMPACTS } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Recycle, Leaf, DollarSign, CalendarCheck, ArrowRight, Activity, MapPin, Sparkles, Trophy } from "lucide-react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import VoiceGuidanceBar from "@/components/VoiceGuidanceBar";

export default function GeneratorDashboard() {
  const { user } = useAuth();
  const { lang, t } = useLanguage();

  if (!user || user.role !== "generator") {
    return <div className="p-8">Unauthorized. Please log in as a Waste Generator.</div>;
  }

  // Get user's requests
  const userRequests = MOCK_REQUESTS.filter(r => r.generatorId === user.id);
  const completedRequests = userRequests.filter(r => r.status === "completed");
  const activeRequests = userRequests.filter(r => r.status !== "completed");

  // Calculate Metrics
  const totalPickups = completedRequests.length;
  const totalWaste = completedRequests.reduce((acc, req) => acc + (req.finalWeight || req.estimatedWeight || 0), 0);
  
  // Try to find matching impact records, fallback to an estimate
  const totalCo2Saved = completedRequests.reduce((acc, req) => {
    const impact = MOCK_IMPACTS.find(i => i.pickupId === req.id);
    return acc + (impact ? impact.co2Saved : (req.estimatedWeight * 2));
  }, 0);

  const fairIncomeGenerated = completedRequests.reduce((acc, req) => {
    const impact = MOCK_IMPACTS.find(i => i.pickupId === req.id);
    return acc + (impact ? impact.incomeGenerated : req.payoutAmount);
  }, 0);

  // Mock data for impact chart
  const impactData = [
    { name: lang === "hi" ? "सप्ताह 1" : 'Week 1', waste: 4, co2: 8 },
    { name: lang === "hi" ? "सप्ताह 2" : 'Week 2', waste: 7, co2: 14 },
    { name: lang === "hi" ? "सप्ताह 3" : 'Week 3', waste: 3, co2: 6 },
    { name: lang === "hi" ? "सप्ताह 4" : 'Week 4', waste: totalWaste > 0 ? totalWaste : 10, co2: totalCo2Saved > 0 ? totalCo2Saved : 20 },
  ];

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {lang === "hi" ? `स्वागत है, ${user.name.split(' ')[0]}` : `Welcome back, ${user.name.split(' ')[0]}`}
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {lang === "hi" ? "यहाँ आपकी रीसाइक्लिंग प्रगति और पर्यावरण प्रभाव का विवरण है।" : "Here is your recycling impact and pickup status."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/generator/leaderboard">
            <Button size="sm" variant="outline" className="rounded-xl border-amber-300 text-amber-800 hover:bg-amber-50 text-xs font-semibold gap-1.5">
              <Trophy className="h-3.5 w-3.5 text-amber-600" />
              {lang === "hi" ? "लीडरबोर्ड #1" : "Leaderboard #1"}
            </Button>
          </Link>
          <Link href="/generator/schedule-pickup">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs rounded-xl text-xs font-semibold gap-1.5">
              <CalendarCheck className="h-3.5 w-3.5" />
              {lang === "hi" ? "नया पिकअप बुक करें" : "Schedule Pickup"}
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="border-slate-200 shadow-xs rounded-2xl border-t-4 border-t-blue-500 bg-white">
          <CardContent className="p-5 sm:p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-500 mb-1">
                  {lang === "hi" ? "पूरे किए गए पिकअप" : "Pickups Completed"}
                </p>
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">{totalPickups}</h3>
              </div>
              <div className="p-2.5 sm:p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <CalendarCheck className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>
            <div className="mt-4">
              <Link href="/generator/my-pickups" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                {lang === "hi" ? "इतिहास देखें" : "View History"} <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs rounded-2xl border-t-4 border-t-emerald-500 bg-white">
          <CardContent className="p-5 sm:p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-500 mb-1">
                  {lang === "hi" ? "रीसायकल किया कचरा" : "Waste Recycled"}
                </p>
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">{totalWaste.toFixed(1)} <span className="text-sm text-slate-500 font-normal">kg</span></h3>
              </div>
              <div className="p-2.5 sm:p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                <Recycle className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>
            <div className="mt-4 text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> {lang === "hi" ? "100% लैंडफिल से बचाया" : "100% Diverted from Landfill"}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs rounded-2xl border-t-4 border-t-teal-500 bg-white">
          <CardContent className="p-5 sm:p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-500 mb-1">
                  {lang === "hi" ? "CO₂ उत्सर्जन बचत" : "CO₂ Saved"}
                </p>
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">{totalCo2Saved.toFixed(1)} <span className="text-sm text-slate-500 font-normal">kg</span></h3>
              </div>
              <div className="p-2.5 sm:p-3 bg-teal-50 text-teal-600 rounded-2xl">
                <Leaf className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>
            <div className="mt-4">
              <Link href="/generator/impact" className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1">
                {lang === "hi" ? "ESG प्रभाव रिपोर्ट" : "ESG Impact Report"} <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs rounded-2xl border-t-4 border-t-amber-500 bg-white">
          <CardContent className="p-5 sm:p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-500 mb-1">
                  {lang === "hi" ? "सफाई मित्रों को सीधी आय" : "Direct Worker Pay"}
                </p>
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">₹{fairIncomeGenerated.toFixed(0)}</h3>
              </div>
              <div className="p-2.5 sm:p-3 bg-amber-50 text-amber-600 rounded-2xl">
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>
            <div className="mt-4">
              <Link href="/generator/payments" className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1">
                {lang === "hi" ? "रसीदें व वॉलेट" : "Receipts & Wallet"} <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Main Left Column (Impact Chart + Recent Pickups) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white border-slate-200/80 rounded-2xl shadow-xs">
            <CardHeader className="p-5 pb-2">
              <CardTitle className="text-base font-bold text-slate-900">
                {lang === "hi" ? "आपका पर्यावरण व रीसाइक्लिंग प्रभाव" : "Your Environmental Impact"}
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                {lang === "hi" ? "पिछले 4 हफ्तों में बचाया गया कचरा और कम किया गया कार्बन उत्सर्जन" : "Waste recycled and CO₂ emissions saved over the last 4 weeks"}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-72 p-5 pt-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={impactData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="waste" name={lang === "hi" ? "कचरा (kg)" : "Waste (kg)"} fill="#10b981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="co2" name={lang === "hi" ? "CO₂ बचत (kg)" : "CO₂ Saved (kg)"} fill="#0d9488" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {lang === "hi" ? "हाल के पूरे किए गए पिकअप" : "Recent Pickups"}
              </h3>
              <Link href="/generator/my-pickups" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                {lang === "hi" ? "सभी देखें" : "View all"} <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            
            <div className="space-y-3">
              {completedRequests.length === 0 ? (
                <Card className="border-dashed border-2 rounded-2xl bg-white">
                  <CardContent className="p-8 text-center text-slate-500">
                    <p className="text-sm">{lang === "hi" ? "आपने अभी तक कोई पिकअप पूरा नहीं किया है।" : "You haven't completed any pickups yet. Schedule one today!"}</p>
                    <Link href="/generator/schedule-pickup">
                      <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold">
                        {lang === "hi" ? "पहला पिकअप बुक करें" : "Schedule First Pickup"}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                completedRequests.slice(0, 3).map(req => (
                  <Card key={req.id} className="border-slate-200 bg-white hover:border-emerald-300 transition-colors shadow-xs rounded-2xl">
                    <CardContent className="p-4 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold text-sm">
                          ♻️
                        </div>
                        <div>
                          <div className="font-bold text-sm text-slate-900">{req.wasteType}</div>
                          <div className="text-xs text-slate-500">
                            {new Date(req.createdAt).toLocaleDateString()} • {req.finalWeight || req.estimatedWeight} kg
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-emerald-600 text-base">₹{req.finalPrice || req.payoutAmount}</div>
                        <div className="text-[11px] text-slate-400">{lang === "hi" ? "सफाई मित्र को भुगतान" : "Paid to Worker"}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar (Active Pickups & Eco Tip) */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl shadow-md overflow-hidden relative border-0">
            <CardHeader className="relative z-10 pb-2 p-5">
              <CardTitle className="text-base flex items-center gap-2 text-emerald-400">
                <Activity className="h-4 w-4" />
                {lang === "hi" ? "सक्रिय पिकअप स्थिति" : "Active Pickups"}
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 p-5 pt-0">
              {activeRequests.length === 0 ? (
                <div className="text-slate-400 text-xs py-4 text-center">
                  {lang === "hi" ? "फिलहाल कोई सक्रिय पिकअप नहीं है।" : "No active pickups at the moment."}
                </div>
              ) : (
                <div className="space-y-3">
                  {activeRequests.map(req => (
                    <div key={req.id} className="bg-slate-800/90 rounded-xl p-3.5 border border-slate-700/80">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant={req.status === "accepted" ? "success" : "warning"} className="text-[10px] px-2 py-0.5 font-bold">
                          {req.status === "accepted" 
                            ? (lang === "hi" ? "रास्ते में" : "En Route") 
                            : (lang === "hi" ? "सफाई मित्र की तलाश" : "Matching")}
                        </Badge>
                        <span className="text-[11px] text-slate-400">{req.preferredTime}</span>
                      </div>
                      <div className="font-semibold text-sm text-slate-100 mb-1">{req.wasteType}</div>
                      <div className="text-xs text-slate-400 flex items-center mb-2.5">
                        <MapPin className="h-3 w-3 mr-1 text-slate-500 shrink-0" /> {req.address}
                      </div>
                      
                      {req.matchedPickerId && req.pickerName ? (
                        <div className="pt-2.5 border-t border-slate-700/60 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-5 w-5 rounded-full bg-emerald-600 flex items-center justify-center text-[10px] font-bold text-white">
                              {req.pickerName.charAt(0)}
                            </div>
                            <span className="text-xs text-slate-300 font-medium">{req.pickerName}</span>
                          </div>
                          <span className="text-xs text-emerald-400 hover:underline cursor-pointer">
                            {lang === "hi" ? "संपर्क करें" : "Contact"}
                          </span>
                        </div>
                      ) : (
                        <div className="pt-2.5 border-t border-slate-700/60 text-[11px] text-amber-300/90 flex items-center gap-1.5 animate-pulse">
                          <Sparkles className="h-3 w-3" />
                          {lang === "hi" ? "नजदीकी सफाई मित्र से मिलान हो रहा है..." : "Matching with nearby workers..."}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Eco Tip Card */}
          <Card className="bg-emerald-50 border-emerald-200 rounded-2xl shadow-xs">
            <CardContent className="p-5">
              <div className="flex gap-3">
                <div className="p-2 bg-emerald-100 rounded-xl text-emerald-700 shrink-0 h-fit">
                  <Leaf className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-emerald-950 mb-1">
                    {lang === "hi" ? "पर्यावरण टिप (Eco Tip)" : "Ethical Recycling Tip"}
                  </h4>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    {lang === "hi" 
                      ? "प्लास्टिक कंटेनर को रीसायकल करने से पहले धोकर अलग रखने से उनकी कीमत 20% तक बढ़ जाती है और सफाई मित्र को उचित मूल्य मिलता है।"
                      : "Rinsing and pre-sorting recyclables increases their market floor price by 20%, directly putting more money into the waste-picker's hands."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
