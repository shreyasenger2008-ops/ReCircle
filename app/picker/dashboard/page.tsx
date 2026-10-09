"use client";

import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { MOCK_REQUESTS, MOCK_PICKERS, MOCK_PAYMENTS, PickupRequest } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Wallet, 
  Banknote, 
  CalendarCheck, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Navigation, 
  ShieldCheck, 
  Volume2, 
  Sparkles,
  MessageCircle,
  ArrowRight,
  Mic
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useState } from "react";
import VoiceGuidanceBar from "@/components/VoiceGuidanceBar";
import SOSFloatingButton from "@/components/SOSFloatingButton";
import WhatsAppSimulatorModal from "@/components/WhatsAppSimulatorModal";
import { speakText, getPickupVoicePrompt, LanguageCode } from "@/lib/voice-assistant";

export default function PickerDashboard() {
  const { user } = useAuth();
  const { lang, t, speak } = useLanguage();
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [activeWhatsAppPickup, setActiveWhatsAppPickup] = useState<PickupRequest | null>(null);

  if (!user || user.role !== "picker") {
    return <div className="p-8">Unauthorized. Please log in as a Waste-Picker.</div>;
  }

  // Get specific picker profile
  const pickerProfile = MOCK_PICKERS.find(p => p.userId === user.id);
  
  if (!pickerProfile) {
    return <div className="p-8">Picker profile not found.</div>;
  }

  // Pending Payments Calculation
  const myCompletedRequests = MOCK_REQUESTS.filter(r => r.matchedPickerId === user.id && r.status === "completed");
  const myCompletedPaymentsTotal = MOCK_PAYMENTS
    .filter(p => p.receiverId === user.id && p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);
  
  const totalEarnedFromPickups = myCompletedRequests.reduce((sum, r) => sum + (r.finalPrice || r.payoutAmount), 0);
  const pendingPaymentsAmount = Math.max(0, totalEarnedFromPickups - myCompletedPaymentsTotal);

  // Active Data
  const acceptedPickups = MOCK_REQUESTS.filter(r => r.matchedPickerId === user.id && r.status === "accepted");
  const nearbyRequests = MOCK_REQUESTS.filter(r => r.status === "pending");

  const markCompleted = (id: string) => {
    const req = MOCK_REQUESTS.find(r => r.id === id);
    if (req) {
      req.status = "completed";
      const msg = lang === "hi" ? "पिकअप पूरा हुआ! कमाई आपके वॉलेट में जोड़ दी गई है।" : "Pickup marked as completed! Income credited to your wallet.";
      speak(msg);
      toast.success(msg);
      window.location.reload();
    }
  };

  const acceptPickup = (id: string) => {
    const req = MOCK_REQUESTS.find(r => r.id === id);
    if (req) {
      req.status = "accepted";
      req.matchedPickerId = user.id;
      req.pickerName = user.name;
      const msg = lang === "hi" ? "पिकअप स्वीकार कर लिया गया है। यह आपके रूट में जोड़ दिया गया है।" : "Pickup Accepted! Added to your downhill route.";
      speak(msg);
      toast.success(msg);
      window.location.reload();
    }
  };

  const handleSpeakCard = (req: any) => {
    const langCode = (lang === "hi" ? "hi-IN" : lang === "kn" ? "kn-IN" : "en-IN") as LanguageCode;
    const prompt = getPickupVoicePrompt({
      generatorName: req.generatorName || "Citizen",
      wasteType: req.wasteType,
      weight: req.estimatedWeight,
      address: req.address,
      earnings: req.estimatedPrice || req.payoutAmount,
      distanceKm: 2.5,
    }, langCode);

    speakText(prompt, langCode);
    toast.info(lang === "hi" ? "🔊 ऑडियो विवरण चल रहा है..." : "🔊 Playing audio description...");
  };

  const openWhatsAppModal = (req: PickupRequest) => {
    setActiveWhatsAppPickup(req);
    setWhatsAppModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      
      {/* Header Profile Greeting */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span>{t("dash.greeting")}, {user.name.split(' ')[0]}</span>
            {user.verificationStatus === 'verified' && (
              <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-blue-200">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                {lang === "hi" ? "सत्यापित रीसायकलर" : "Verified Recycler"}
              </span>
            )}
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">{t("dash.subtitle")}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={pickerProfile.availability === 'online' ? 'success' : 'warning'} className="px-3.5 py-1.5 text-xs font-bold rounded-xl">
            {pickerProfile.availability === 'online' ? t("dash.online") : t("dash.busy")}
          </Badge>
          <Link href="/picker/route-planner">
            <Button size="sm" variant="outline" className="rounded-xl text-xs font-semibold gap-1.5 border-emerald-600 text-emerald-700 hover:bg-emerald-50">
              <Navigation className="h-3.5 w-3.5" />
              {lang === "hi" ? "रूट मैप" : "Route Map"}
            </Button>
          </Link>
        </div>
      </div>

      {/* Safai Saathi Audio Co-Pilot Hero Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white p-4 sm:p-5 rounded-2xl border-2 border-emerald-500/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-lg shadow-emerald-500/30">
            <Mic className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-base text-white">
                {lang === "hi" ? "सफाई साथी वॉइस असिस्टेंट" : "Safai Saathi Audio Co-Pilot"}
              </h3>
              <Badge className="bg-emerald-500/30 text-emerald-300 border-0 text-[10px] font-mono">
                {lang === "hi" ? "आवाज चालू 🟢" : "Audio Active 🟢"}
              </Badge>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {lang === "hi"
                ? "बिना पढ़े बोलकर चलाएं - कमाई, अगला पिकअप और कबाड़ के ताज़ा भाव सुनें।"
                : "Listen to earnings, next pickup details, or speak your voice commands."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          <Button
            size="sm"
            onClick={() => {
              speak(lang === "hi" ? "सुरेश जी, आज आपकी कुल कमाई 450 रुपये है। आज 4 पिकअप पूरे किए हैं।" : "Suresh, your earnings today are 450 rupees from 4 pickups.");
            }}
            className="h-9 px-3.5 bg-slate-800 hover:bg-slate-750 text-emerald-400 border border-slate-700 text-xs font-bold rounded-xl gap-1.5 shadow-xs"
          >
            <Volume2 className="h-4 w-4 text-emerald-400" />
            {lang === "hi" ? "कमाई सुनें 🔊" : "Listen Earnings 🔊"}
          </Button>

          <Button
            size="sm"
            onClick={() => {
              speak(lang === "hi" ? "अगला पिकअप 1.2 किलोमीटर दूर कोरमंगला में है, 8 किलो प्लास्टिक, कमाई 144 रुपये।" : "Next pickup is 1.2 km away at Koramangala, 8 kg plastic, payout 144 rupees.");
            }}
            className="h-9 px-3.5 bg-slate-800 hover:bg-slate-750 text-amber-300 border border-slate-700 text-xs font-bold rounded-xl gap-1.5 shadow-xs"
          >
            <Volume2 className="h-4 w-4 text-amber-300" />
            {lang === "hi" ? "अगला पिकअप सुनें 🔊" : "Listen Next Job 🔊"}
          </Button>

          <Button
            size="sm"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("open-safai-saathi"));
              }
            }}
            className="h-9 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl gap-1.5 shadow-md"
          >
            <Mic className="h-4 w-4" />
            {lang === "hi" ? "बोलें 🎙️" : "Speak 🎙️"}
          </Button>
        </div>
      </div>

      {/* Primary Income Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="bg-slate-900 text-white shadow-md border-0 rounded-2xl">
          <CardContent className="p-5 sm:p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-400 mb-1">{t("dash.todayEarnings")}</p>
                <h3 className="text-2xl sm:text-3xl font-bold text-emerald-400">₹{pickerProfile.dailyEarnings}</h3>
              </div>
              <div className="p-2.5 sm:p-3 bg-slate-800 text-emerald-400 rounded-2xl">
                <Banknote className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
              <span>{t("dash.goal")}</span>
              <span className="font-semibold text-emerald-400">{Math.round((pickerProfile.dailyEarnings / 800) * 100)}%</span>
            </div>
            <div className="mt-1.5 h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all duration-500 rounded-full" style={{ width: `${Math.min(100, (pickerProfile.dailyEarnings / 800) * 100)}%` }}></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs rounded-2xl border-t-4 border-t-blue-500 bg-white">
          <CardContent className="p-5 sm:p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-500 mb-1">{t("dash.weeklyEarnings")}</p>
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">₹{pickerProfile.weeklyEarnings}</h3>
              </div>
              <div className="p-2.5 sm:p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <Wallet className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>
            <div className="mt-4">
              <Link href="/picker/wallet" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                {lang === "hi" ? "वॉलेट देखें" : "View Wallet"} <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs rounded-2xl border-t-4 border-t-amber-500 bg-white">
          <CardContent className="p-5 sm:p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-500 mb-1">{t("dash.pendingPayouts")}</p>
                <h3 className="text-2xl sm:text-3xl font-bold text-amber-600">₹{pendingPaymentsAmount}</h3>
              </div>
              <div className="p-2.5 sm:p-3 bg-amber-50 text-amber-600 rounded-2xl">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>
            <div className="mt-4 text-xs text-slate-400">
              {lang === "hi" ? "सत्यापन उपरांत स्वतः ट्रांसफर" : "Auto-settled after verification"}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs rounded-2xl border-t-4 border-t-purple-500 bg-white">
          <CardContent className="p-5 sm:p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-500 mb-1">{t("dash.jobsCompleted")}</p>
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">{pickerProfile.completedJobsToday}</h3>
              </div>
              <div className="p-2.5 sm:p-3 bg-purple-50 text-purple-600 rounded-2xl">
                <CalendarCheck className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>
            <div className="mt-4">
              <Link href="/picker/karma-credit" className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1">
                {lang === "hi" ? "कर्मा स्कोर: 782" : "Karma Score: 782"} <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Left Column: Route & Active Pickups */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Suggested Downhill Route Summary */}
          {acceptedPickups.length > 0 && (
            <Card className="bg-gradient-to-br from-blue-50/80 to-indigo-50/40 border-blue-200 rounded-2xl shadow-xs overflow-hidden">
              <CardContent className="p-5">
                <div className="flex gap-4">
                  <div className="mt-1 bg-blue-600 rounded-2xl p-2.5 h-11 w-11 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Navigation className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-blue-950">{t("dash.routeSummary")}</h3>
                      <Link href="/picker/route-planner" className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1">
                        {lang === "hi" ? "ढलान नक्शा देखें" : "Strain Map"} <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                    <p className="text-xs text-blue-800 mb-4">{t("dash.routeSubtitle")}</p>
                    
                    <div className="space-y-3 relative before:absolute before:inset-0 before:ml-3 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-blue-300 before:to-transparent">
                      {acceptedPickups.map((req, idx) => (
                        <div key={req.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white bg-blue-600 text-white text-xs font-bold shadow-xs shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 relative">
                            {idx + 1}
                          </div>
                          <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-xl border border-blue-200 bg-white shadow-xs ml-3 md:ml-0">
                            <div className="font-semibold text-slate-800 text-sm mb-1">{req.generatorName}</div>
                            <div className="text-xs text-slate-500 flex items-center">
                              <MapPin className="h-3 w-3 mr-1 text-slate-400" /> {req.address}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Active Pickups */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{t("dash.acceptedPickups")}</h3>
                <p className="text-xs text-slate-500">{lang === "hi" ? "सक्रिय कार्य जो आपको पूरे करने हैं" : "Active tasks assigned to you"}</p>
              </div>
              <Badge className="bg-emerald-100 text-emerald-800 font-semibold px-3 py-1 rounded-xl">
                {acceptedPickups.length} {lang === "hi" ? "सक्रिय काम" : "remaining"}
              </Badge>
            </div>

            <div className="space-y-4">
              {acceptedPickups.length === 0 ? (
                <Card className="border-dashed border-2 rounded-2xl bg-white">
                  <CardContent className="p-8 text-center text-slate-500">
                    <p className="text-sm">{t("dash.noJobs")}</p>
                    <Link href="/picker/nearby-requests">
                      <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold">
                        {lang === "hi" ? "नजदीकी पिकअप खोजें" : "Explore Nearby Radar"}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                acceptedPickups.map(req => (
                  <Card key={req.id} className="overflow-hidden border-slate-200 border-l-4 border-l-blue-600 bg-white shadow-xs rounded-2xl">
                    <CardContent className="p-5">
                      <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-base text-slate-900">{req.generatorName}</h4>
                            <Badge variant="outline" className="text-blue-700 border-blue-200 bg-blue-50 text-[11px] font-semibold">
                              {lang === "hi" ? "रास्ते में" : "En Route"}
                            </Badge>
                            <button
                              onClick={() => handleSpeakCard(req)}
                              className="p-1.5 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                              title="Listen details in Hindi"
                            >
                              <Volume2 className="h-4 w-4" />
                            </button>
                          </div>
                          
                          <div className="space-y-1 text-xs text-slate-600">
                            <div className="flex items-center">
                              <MapPin className="h-3.5 w-3.5 mr-1.5 text-slate-400 shrink-0" /> {req.address}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-3.5 w-3.5 mr-1.5 text-slate-400 shrink-0" /> {req.preferredTime}
                            </div>
                          </div>

                          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 inline-flex items-center gap-2">
                            <span className="text-[11px] font-bold text-slate-500 uppercase">{lang === "hi" ? "सामग्री:" : "Items:"}</span>
                            <span className="text-xs font-semibold text-slate-800">{req.wasteType} ({req.estimatedWeight} kg)</span>
                          </div>
                        </div>

                        <div className="flex flex-col items-start sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 gap-3">
                          <div className="text-left sm:text-right">
                            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t("dash.expectedPayout")}</div>
                            <div className="text-2xl font-black text-emerald-600">
                              ₹{(req.finalPrice || req.estimatedPrice || req.payoutAmount).toFixed(0)}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => openWhatsAppModal(req)}
                              className="rounded-xl border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-xs font-semibold"
                            >
                              <MessageCircle className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                              WhatsApp
                            </Button>
                            <Button 
                              onClick={() => markCompleted(req.id)} 
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs"
                            >
                              <CheckCircle2 className="mr-1.5 h-4 w-4" /> {t("dash.markCompleted")}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Opportunity Score & Nearby Requests */}
        <div className="space-y-6">
          
          {/* Fair Opportunity Score Card */}
          <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white shadow-md rounded-2xl relative overflow-hidden border-0">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <Sparkles className="h-32 w-32" />
            </div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-base flex items-center gap-2 text-amber-300">
                  <Sparkles className="h-4 w-4 fill-amber-300" /> 
                  {t("dash.opportunityScore")}
                </h3>
                <span className="text-2xl font-black text-amber-400">{pickerProfile.fairnessPriorityScore}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t("dash.opportunityDesc")}
              </p>
              <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                <span>{lang === "hi" ? "अल्गोरिदम स्थिति: सक्रिय" : "Fair Algorithm: Active"}</span>
                <span className="text-emerald-400 font-semibold">{lang === "hi" ? "प्राथमिकता प्राप्त" : "High Priority"}</span>
              </div>
            </CardContent>
          </Card>

          {/* Recommended Nearby Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-slate-900">{t("dash.recommendedNearby")}</h3>
              <Link href="/picker/nearby-requests" className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1">
                {t("dash.viewMap")} <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            
            <div className="space-y-3">
              {nearbyRequests.length === 0 ? (
                <div className="text-xs text-slate-500 p-4 border rounded-xl text-center bg-slate-50">
                  {lang === "hi" ? "फिलहाल आपके क्षेत्र में कोई लंबित अनुरोध नहीं है।" : "No pending requests in your area right now."}
                </div>
              ) : (
                nearbyRequests.slice(0, 3).map(req => (
                  <Card key={req.id} className="hover:border-emerald-400 transition-colors border-slate-200 rounded-xl shadow-none bg-slate-50/50">
                    <CardContent className="p-3.5">
                      <div className="flex justify-between items-start mb-1.5">
                        <div className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                          <span>{req.wasteType}</span>
                          <button
                            onClick={() => handleSpeakCard(req)}
                            className="p-1 rounded bg-white text-slate-600 hover:text-emerald-600 border border-slate-200"
                            title="Listen"
                          >
                            <Volume2 className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="font-bold text-emerald-600 text-sm">₹{req.estimatedPrice.toFixed(0)}</div>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center mb-1">
                        <MapPin className="h-3 w-3 mr-1 text-slate-400 shrink-0" /> {req.address}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center mb-3">
                        <Clock className="h-3 w-3 mr-1 text-slate-400 shrink-0" /> {req.preferredTime}
                      </div>
                      <Button 
                        size="sm" 
                        className="w-full bg-slate-900 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold h-8"
                        onClick={() => acceptPickup(req.id)}
                      >
                        {t("dash.accept")}
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Floating Emergency SOS Button */}
      <SOSFloatingButton />

      {/* WhatsApp Simulator Modal */}
      {whatsAppModalOpen && activeWhatsAppPickup && (
        <WhatsAppSimulatorModal
          isOpen={whatsAppModalOpen}
          onClose={() => setWhatsAppModalOpen(false)}
          pickupId={activeWhatsAppPickup.id}
          recipientName={activeWhatsAppPickup.generatorName || "Citizen"}
          recipientPhone="+91 98765 43210"
          pickupAddress={activeWhatsAppPickup.address}
          wasteType={activeWhatsAppPickup.wasteType}
          weightKg={activeWhatsAppPickup.estimatedWeight}
          amount={activeWhatsAppPickup.finalPrice || activeWhatsAppPickup.estimatedPrice || activeWhatsAppPickup.payoutAmount}
        />
      )}
    </div>
  );
}
