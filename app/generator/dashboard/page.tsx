"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { usePlatformData } from "@/lib/platform-data-context";
import { MOCK_IMPACTS, CO2_PER_KG_RECYCLED, PickupRequest } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Recycle, 
  Leaf, 
  DollarSign, 
  CalendarCheck, 
  ArrowRight, 
  Activity, 
  MapPin, 
  Sparkles, 
  Trophy, 
  Clock, 
  CheckCircle2, 
  Star, 
  Heart,
  AlertTriangle,
  RotateCcw,
  Calendar,
  X
} from "lucide-react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency, formatDate } from "@/lib/formatters";
import { toast } from "sonner";

export default function GeneratorDashboard() {
  const { user } = useAuth();
  const { lang, t } = useLanguage();
  const { requests, cancelPickup, reschedulePickup, ratePicker } = usePlatformData();

  // Modal states for rating/tip & cancel/reschedule
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedPickupForRating, setSelectedPickupForRating] = useState<PickupRequest | null>(null);
  const [ratingStars, setRatingStars] = useState(5);
  const [tipAmount, setTipAmount] = useState(10);
  const [ratingComment, setRatingComment] = useState("");

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [activePickupForAction, setActivePickupForAction] = useState<PickupRequest | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("2026-10-12");
  const [rescheduleSlot, setRescheduleSlot] = useState("12:00 PM - 04:00 PM");

  if (!user || user.role !== "generator") {
    return <div className="p-8 text-sm">Unauthorized. Please log in as a Waste Generator.</div>;
  }

  // Get user's requests from real-time context
  const userRequests = requests.filter(r => r.generatorId === user.id);
  const completedRequests = userRequests.filter(r => r.status === "completed");
  const activeRequests = userRequests.filter(r => r.status !== "completed" && r.status !== "cancelled");

  // Calculate Metrics
  const totalPickups = completedRequests.length;
  const totalWaste = completedRequests.reduce((acc, req) => acc + (req.finalWeight || req.estimatedWeight || 0), 0);
  
  const totalCo2Saved = completedRequests.reduce((acc, req) => {
    const impact = MOCK_IMPACTS.find(i => i.pickupId === req.id);
    return acc + (impact ? impact.co2Saved : ((req.finalWeight || req.estimatedWeight) * CO2_PER_KG_RECYCLED));
  }, 0);

  const fairIncomeGenerated = completedRequests.reduce((acc, req) => {
    const impact = MOCK_IMPACTS.find(i => i.pickupId === req.id);
    return acc + (impact ? impact.incomeGenerated : (req.finalPrice || req.payoutAmount || 0));
  }, 0);

  // Mock data for impact chart
  const impactData = [
    { name: lang === "hi" ? "सप्ताह 1" : 'Week 1', waste: 4, co2: 6 },
    { name: lang === "hi" ? "सप्ताह 2" : 'Week 2', waste: 7, co2: 10.5 },
    { name: lang === "hi" ? "सप्ताह 3" : 'Week 3', waste: 3, co2: 4.5 },
    { name: lang === "hi" ? "सप्ताह 4" : 'Week 4', waste: totalWaste > 0 ? totalWaste : 8.5, co2: totalCo2Saved > 0 ? totalCo2Saved : (8.5 * CO2_PER_KG_RECYCLED) },
  ];

  const handleOpenRating = (pickup: PickupRequest) => {
    setSelectedPickupForRating(pickup);
    setRatingStars(5);
    setTipAmount(10);
    setRatingComment("");
    setRatingModalOpen(true);
  };

  const handleSubmitRating = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPickupForRating) {
      ratePicker(selectedPickupForRating.id, ratingStars, tipAmount);
    }
    setRatingModalOpen(false);
  };

  const handleCancelPickup = () => {
    if (activePickupForAction) {
      cancelPickup(activePickupForAction.id, "Cancelled by user");
      setCancelModalOpen(false);
    }
  };

  const handleReschedulePickup = (e: React.FormEvent) => {
    e.preventDefault();
    if (activePickupForAction) {
      reschedulePickup(activePickupForAction.id, `${rescheduleDate} (${rescheduleSlot})`);
      setRescheduleModalOpen(false);
    }
  };

  // Timeline Step calculation
  const getTimelineStepIndex = (status: PickupRequest["status"]) => {
    switch (status) {
      case "pending": return 0; // Requested
      case "accepted": return 1; // Matched
      case "on_the_way": return 2; // On the way
      case "picked_up": return 3; // Weighed
      case "completed": return 4; // Paid
      default: return 0;
    }
  };

  const timelineSteps = [
    { key: "requested", label: lang === "hi" ? "अनुरोध दर्ज" : "Requested" },
    { key: "matched", label: lang === "hi" ? "मित्र मिला" : "Matched" },
    { key: "on_the_way", label: lang === "hi" ? "रास्ते में" : "On the way" },
    { key: "weighed", label: lang === "hi" ? "वजन सत्यापित" : "Weighed" },
    { key: "paid", label: lang === "hi" ? "भुगतान पूर्ण" : "Paid" },
  ];

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {lang === "hi" ? `स्वागत है, ${user.name.split(' ')[0]}` : lang === "kn" ? `ಸ್ವಾಗತ, ${user.name.split(' ')[0]}` : `Welcome back, ${user.name.split(' ')[0]}`}
          </h2>
          <p className="text-sm text-slate-600 mt-0.5">
            {lang === "hi" ? "यहाँ आपकी रीसाइक्लिंग प्रगति और पर्यावरण प्रभाव का विवरण है।" : "Here is your circular recycling progress and verified worker payouts."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/generator/leaderboard">
            <Button size="sm" variant="outline" className="rounded-xl border-amber-300 text-amber-900 bg-amber-50 hover:bg-amber-100 text-xs font-bold gap-1.5 min-h-[40px] px-3.5">
              <Trophy className="h-4 w-4 text-amber-600" />
              {lang === "hi" ? "लीडरबोर्ड #1" : "Leaderboard #1"}
            </Button>
          </Link>
          <Link href="/generator/schedule-pickup">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs rounded-xl text-xs font-bold gap-1.5 min-h-[40px] px-4">
              <CalendarCheck className="h-4 w-4" />
              {lang === "hi" ? "नया पिकअप बुक करें" : "Schedule Pickup"}
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="border-slate-200 shadow-xs rounded-2xl border-t-4 border-t-blue-500 bg-white">
          <CardContent className="p-4 sm:p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">
                  {lang === "hi" ? "पूरे किए गए पिकअप" : "Pickups Completed"}
                </p>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900">{totalPickups}</h3>
              </div>
              <div className="p-2.5 bg-blue-50 text-blue-700 rounded-2xl">
                <CalendarCheck className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>
            <div className="mt-3">
              <Link href="/generator/my-pickups" className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1">
                {lang === "hi" ? "इतिहास देखें" : "View History"} <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs rounded-2xl border-t-4 border-t-emerald-500 bg-white">
          <CardContent className="p-4 sm:p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">
                  {lang === "hi" ? "रीसायकल किया कचरा" : "Waste Recycled"}
                </p>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900">{totalWaste.toFixed(1)} <span className="text-sm text-slate-500 font-bold">kg</span></h3>
              </div>
              <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl">
                <Recycle className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>
            <div className="mt-3 text-xs text-emerald-800 font-bold flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" /> {lang === "hi" ? "100% लैंडफिल से बचाया" : "Diverted from Landfill"}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs rounded-2xl border-t-4 border-t-teal-500 bg-white">
          <CardContent className="p-4 sm:p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">
                  {lang === "hi" ? "CO₂ उत्सर्जन बचत" : "CO₂ Saved"}
                </p>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900">{totalCo2Saved.toFixed(1)} <span className="text-sm text-slate-500 font-bold">kg</span></h3>
              </div>
              <div className="p-2.5 bg-teal-50 text-teal-700 rounded-2xl">
                <Leaf className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>
            <div className="mt-3">
              <Link href="/generator/impact" className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1">
                {lang === "hi" ? "ESG प्रभाव रिपोर्ट" : "ESG Impact Report"} <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Relabeled: "You paid to workers / आपने सफाई मित्रों को चुकाया" */}
        <Card className="border-slate-200 shadow-xs rounded-2xl border-t-4 border-t-amber-500 bg-white">
          <CardContent className="p-4 sm:p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">
                  {lang === "hi" ? "सफाई मित्रों को चुकाया" : "You paid to workers"}
                </p>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900">₹{fairIncomeGenerated.toFixed(0)}</h3>
              </div>
              <div className="p-2.5 bg-amber-50 text-amber-700 rounded-2xl">
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>
            <div className="mt-3">
              <Link href="/generator/payments" className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1">
                {lang === "hi" ? "रसीदें व विवरण" : "Receipts & Ledger"} <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Main Left Column (Impact Chart + Recent Pickups) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white border-slate-200/90 rounded-2xl shadow-xs">
            <CardHeader className="p-5 pb-2">
              <CardTitle className="text-base font-bold text-slate-900">
                {lang === "hi" ? "आपका पर्यावरण व रीसाइक्लिंग प्रभाव" : "Your Environmental Impact"}
              </CardTitle>
              <CardDescription className="text-xs text-slate-600">
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

          {/* Recent Completed Pickups with Rating/Tip Trigger */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-bold text-slate-900">
                {lang === "hi" ? "हाल के पूरे किए गए पिकअप" : "Recent Pickups"}
              </h3>
              <Link href="/generator/my-pickups" className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1">
                {lang === "hi" ? "सभी देखें" : "View all"} <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            
            <div className="space-y-3">
              {completedRequests.length === 0 ? (
                <Card className="border-dashed border-2 rounded-2xl bg-white">
                  <CardContent className="p-8 text-center text-slate-600">
                    <p className="text-sm font-medium">{lang === "hi" ? "आपने अभी तक कोई पिकअप पूरा नहीं किया है।" : "You haven't completed any pickups yet. Schedule one today!"}</p>
                    <Link href="/generator/schedule-pickup">
                      <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold min-h-[44px]">
                        {lang === "hi" ? "पहला पिकअप बुक करें" : "Schedule First Pickup"}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                completedRequests.slice(0, 3).map(req => (
                  <Card key={req.id} className="border-slate-200 bg-white hover:border-emerald-300 transition-colors shadow-xs rounded-2xl">
                    <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold text-base shrink-0">
                          ♻️
                        </div>
                        <div>
                          <div className="font-bold text-sm text-slate-900">{req.wasteType}</div>
                          <div className="text-xs text-slate-600">
                            {formatDate(req.createdAt)} • {req.finalWeight || req.estimatedWeight} kg • {req.pickerName || "Suresh"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <div className="text-right">
                          <div className="font-black text-emerald-700 text-base">{formatCurrency(req.finalPrice || req.payoutAmount || 0)}</div>
                          <div className="text-[11px] text-slate-500 font-medium">{lang === "hi" ? "सफाई मित्र को चुकाया" : "Paid to Worker"}</div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenRating(req)}
                          className="rounded-xl border-amber-300 bg-amber-50/80 hover:bg-amber-100 text-amber-900 text-xs font-bold gap-1 min-h-[36px]"
                        >
                          <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                          {lang === "hi" ? "रेटिंग व टिप" : "Rate & Tip"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Active Pickups with 5-Step Status Timeline & Cancel/Reschedule */}
        <div className="space-y-6">
          <Card className="bg-slate-900 text-white rounded-2xl shadow-md overflow-hidden relative border-0">
            <CardHeader className="relative z-10 pb-3 p-5 border-b border-slate-800">
              <CardTitle className="text-base flex items-center gap-2 text-emerald-400 font-bold">
                <Activity className="h-4 w-4" />
                {lang === "hi" ? "सक्रिय पिकअप स्थिति" : "Active Pickups"}
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 p-5 space-y-4">
              {activeRequests.length === 0 ? (
                <div className="text-slate-400 text-xs py-4 text-center">
                  {lang === "hi" ? "फिलहाल कोई सक्रिय पिकअप नहीं है।" : "No active pickups at the moment."}
                </div>
              ) : (
                activeRequests.map(req => {
                  const stepIndex = getTimelineStepIndex(req.status);
                  return (
                    <div key={req.id} className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700/80 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-bold text-sm text-white">{req.wasteType}</span>
                          <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-slate-500 shrink-0" />
                            <span className="truncate max-w-[180px]">{req.address}</span>
                          </div>
                        </div>
                        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] font-bold">
                          ₹{(req.finalPrice || req.estimatedPrice || 174).toFixed(0)}
                        </Badge>
                      </div>

                      {/* 5-Step Status Timeline */}
                      <div className="py-2">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                          {lang === "hi" ? "पिकअप प्रगति टाइमलाइन" : "Pickup Progress Timeline"}
                        </div>
                        
                        <div className="grid grid-cols-5 gap-1 text-center">
                          {timelineSteps.map((s, idx) => {
                            const isDone = idx <= stepIndex;
                            const isCurrent = idx === stepIndex;
                            return (
                              <div key={s.key} className="flex flex-col items-center">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mb-1 transition-all ${
                                  isDone 
                                    ? "bg-emerald-500 text-slate-950 shadow-xs" 
                                    : "bg-slate-700 text-slate-400"
                                } ${isCurrent ? "ring-2 ring-emerald-300 animate-pulse" : ""}`}>
                                  {isDone ? "✓" : idx + 1}
                                </div>
                                <span className={`text-[9px] leading-tight ${isDone ? "text-emerald-300 font-bold" : "text-slate-500"}`}>
                                  {s.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Assigned Worker Info */}
                      <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-emerald-600 flex items-center justify-center text-[11px] font-bold text-white">
                            {req.pickerName?.charAt(0) || "S"}
                          </div>
                          <span className="text-slate-300 font-medium">{req.pickerName || (lang === "hi" ? "सफाई मित्र खोज रहे हैं..." : "Matching worker...")}</span>
                        </div>
                        <span className="text-slate-400 text-[11px]">{req.preferredTime}</span>
                      </div>

                      {/* Cancel / Reschedule Action Buttons */}
                      <div className="pt-2 flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setActivePickupForAction(req);
                            setRescheduleModalOpen(true);
                          }}
                          className="flex-1 h-9 bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 rounded-xl text-xs font-bold gap-1"
                        >
                          <Calendar className="h-3.5 w-3.5" />
                          {lang === "hi" ? "समय बदलें" : "Reschedule"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setActivePickupForAction(req);
                            setCancelModalOpen(true);
                          }}
                          className="flex-1 h-9 bg-slate-800 hover:bg-rose-950/40 text-rose-300 border-slate-700 hover:border-rose-500 rounded-xl text-xs font-bold gap-1"
                        >
                          <X className="h-3.5 w-3.5 text-rose-400" />
                          {lang === "hi" ? "रद्द करें" : "Cancel"}
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
          
          {/* Eco Tip Card */}
          <Card className="bg-emerald-50 border-emerald-200 rounded-2xl shadow-xs">
            <CardContent className="p-4 sm:p-5">
              <div className="flex gap-3">
                <div className="p-2 bg-emerald-100 rounded-xl text-emerald-800 shrink-0 h-fit">
                  <Leaf className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-emerald-950 mb-1">
                    {lang === "hi" ? "पर्यावरण टिप (Eco Tip)" : "Ethical Recycling Tip"}
                  </h4>
                  <p className="text-xs text-emerald-900 leading-relaxed">
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

      {/* Post-Pickup Rating & Tip Modal */}
      {ratingModalOpen && selectedPickupForRating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <Card className="w-full max-w-md shadow-2xl rounded-3xl bg-white border-2 border-emerald-500">
            <div className="p-5 pb-3 border-b bg-emerald-50/60 flex justify-between items-center">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {lang === "hi" ? "सफाई मित्र को रेटिंग व सम्मान टिप" : "Rate & Tip Waste Worker"}
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  {selectedPickupForRating.pickerName || "Suresh"} • {selectedPickupForRating.wasteType}
                </p>
              </div>
              <button onClick={() => setRatingModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <CardContent className="p-5">
              <form onSubmit={handleSubmitRating} className="space-y-4">
                
                {/* 1. Star Rating */}
                <div className="text-center py-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    {lang === "hi" ? "सेवा का अनुभव चुनें" : "Rate Your Experience"}
                  </div>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRatingStars(star)}
                        className="p-1.5 transition-transform hover:scale-125 focus:outline-none"
                      >
                        <Star className={`h-8 w-8 ${
                          star <= ratingStars ? "text-amber-400 fill-amber-400" : "text-slate-300"
                        }`} />
                      </button>
                    ))}
                  </div>
                  <div className="text-xs font-bold text-slate-700 mt-1">
                    {ratingStars === 5 ? (lang === "hi" ? "उत्कृष्ट सेवा ⭐⭐⭐⭐⭐" : "Excellent Service ⭐⭐⭐⭐⭐") : `${ratingStars} / 5 Stars`}
                  </div>
                </div>

                {/* 2. Optional Tip Selection */}
                <div className="bg-rose-50/70 p-3.5 rounded-2xl border border-rose-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-rose-950 flex items-center gap-1.5">
                      <Heart className="h-4 w-4 text-rose-600" />
                      {lang === "hi" ? "सुरक्षा कवच हेल्थ फंड टिप जोड़ें" : "Worker Dignity & Health Tip"}
                    </span>
                    <Badge variant="outline" className="text-[10px] bg-rose-100 text-rose-800 border-rose-300 font-bold">
                      100% to Worker
                    </Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[0, 10, 20, 50].map((amt) => (
                      <button
                        type="button"
                        key={amt}
                        onClick={() => setTipAmount(amt)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          tipAmount === amt
                            ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                            : "bg-white text-slate-800 border-rose-200 hover:bg-rose-100/50"
                        }`}
                      >
                        {amt === 0 ? (lang === "hi" ? "कोई नहीं" : "No tip") : `+₹${amt}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Feedback comment */}
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">
                    {lang === "hi" ? "सफाई मित्र के लिए टिप्पणी (वैकल्पिक)" : "Appreciation Feedback (Optional)"}
                  </label>
                  <textarea
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                    placeholder={lang === "hi" ? "उदा: समय पर पहुंचे, तराजू का सटीक वजन किया..." : "E.g. Punctual, accurate digital scale weight, polite..."}
                    className="w-full min-h-[70px] rounded-xl border border-slate-300 p-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setRatingModalOpen(false)}
                    className="flex-1 rounded-xl text-xs font-bold min-h-[44px]"
                  >
                    {lang === "hi" ? "रद्द करें" : "Cancel"}
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold min-h-[44px]"
                  >
                    {lang === "hi" ? "रेटिंग भेजें" : "Submit Rating & Tip"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelModalOpen && activePickupForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <Card className="w-full max-w-sm shadow-2xl rounded-3xl bg-white p-5 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 bg-rose-100 rounded-xl">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-900">{lang === "hi" ? "पिकअप रद्द करें?" : "Cancel Pickup?"}</h4>
                <p className="text-xs text-slate-500">{activePickupForAction.wasteType}</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {lang === "hi"
                ? "क्या आप निश्चित रूप से यह पिकअप अनुरोध रद्द करना चाहते हैं? आवंटित सफाई मित्र को सूचित कर दिया जाएगा।"
                : "Are you sure you want to cancel this pickup request? The assigned worker will be notified."}
            </p>
            <div className="flex gap-2 pt-2">
              <Button 
                variant="outline" 
                onClick={() => setCancelModalOpen(false)} 
                className="flex-1 rounded-xl text-xs font-bold min-h-[44px]"
              >
                {lang === "hi" ? "नहीं, रखें" : "Keep Pickup"}
              </Button>
              <Button 
                onClick={handleCancelPickup} 
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold min-h-[44px]"
              >
                {lang === "hi" ? "हाँ, रद्द करें" : "Yes, Cancel"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleModalOpen && activePickupForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <Card className="w-full max-w-md shadow-2xl rounded-3xl bg-white p-5 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2 text-slate-900">
                <RotateCcw className="h-5 w-5 text-emerald-600" />
                <h4 className="font-bold text-base">{lang === "hi" ? "पिकअप का समय बदलें" : "Reschedule Pickup"}</h4>
              </div>
              <button onClick={() => setRescheduleModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleReschedulePickup} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">
                  {lang === "hi" ? "नई तारीख चुनें" : "Select New Date"}
                </label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  required
                  className="w-full h-11 px-3 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">
                  {lang === "hi" ? "समय स्लॉट चुनें" : "Select Time Slot"}
                </label>
                <select
                  value={rescheduleSlot}
                  onChange={(e) => setRescheduleSlot(e.target.value)}
                  className="w-full h-11 px-3 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 bg-white"
                >
                  <option value="08:00 AM - 12:00 PM">Morning (08:00 AM - 12:00 PM)</option>
                  <option value="12:00 PM - 04:00 PM">Afternoon (12:00 PM - 04:00 PM)</option>
                  <option value="04:00 PM - 08:00 PM">Evening (04:00 PM - 08:00 PM)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRescheduleModalOpen(false)}
                  className="flex-1 rounded-xl text-xs font-bold min-h-[44px]"
                >
                  {lang === "hi" ? "रद्द करें" : "Cancel"}
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold min-h-[44px]"
                >
                  {lang === "hi" ? "नया समय सुरक्षित करें" : "Confirm New Slot"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

    </div>
  );
}
