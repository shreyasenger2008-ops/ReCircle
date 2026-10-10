"use client";

import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { usePlatformData } from "@/lib/platform-data-context";
import { PickupRequest } from "@/lib/mock-data";
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
  Mic, 
  Scale, 
  Compass, 
  TrendingUp, 
  AlertCircle,
  X,
  Camera,
  Upload
} from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { toast } from "sonner";
import { useState } from "react";
import SOSFloatingButton from "@/components/SOSFloatingButton";
import WhatsAppSimulatorModal from "@/components/WhatsAppSimulatorModal";
import { speakText, getPickupVoicePrompt, LanguageCode } from "@/lib/voice-assistant";

export default function PickerDashboard() {
  const { user } = useAuth();
  const { lang, t, speak } = useLanguage();
  const { requests, pickers, acceptPickupRequest, startPickupRoute, confirmPickupWeighed } = usePlatformData();
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [activeWhatsAppPickup, setActiveWhatsAppPickup] = useState<PickupRequest | null>(null);
  
  // Weigh & Complete Modal State
  const [completionModalOpen, setCompletionModalOpen] = useState(false);
  const [activeCompletionPickup, setActiveCompletionPickup] = useState<PickupRequest | null>(null);
  const [finalWeight, setFinalWeight] = useState<number>(12);
  const [scalePhotoUrl, setScalePhotoUrl] = useState<string | null>(null);
  const [paymentConfirmed, setPaymentConfirmed] = useState(true);

  if (!user || user.role !== "picker") {
    return <div className="p-8 text-sm">Unauthorized. Please log in as a Waste-Picker.</div>;
  }

  // Get specific picker profile from reactive store
  const pickerProfile = pickers.find(p => p.userId === user.id || p.id === user.id) || pickers[0];

  // Active Requests from reactive store
  const acceptedPickups = requests.filter(r => (r.matchedPickerId === user.id || r.pickerName === user.name) && (r.status === "accepted" || r.status === "on_the_way" || r.status === "picked_up"));
  const nearbyRequests = requests.filter(r => r.status === "pending");

  // Determine top priority pickup
  const nextPickup = acceptedPickups[0] || nearbyRequests[0] || null;
  const isNextAssigned = nextPickup && (nextPickup.status === "accepted" || nextPickup.status === "on_the_way" || nextPickup.status === "picked_up");

  const openCompletionModal = (pickup: PickupRequest) => {
    setActiveCompletionPickup(pickup);
    setFinalWeight(pickup.estimatedWeight || 12);
    setScalePhotoUrl(null);
    setPaymentConfirmed(true);
    setCompletionModalOpen(true);
  };

  const handleSimulatePhotoUpload = () => {
    setScalePhotoUrl("https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60");
    toast.success(lang === "hi" ? "तराजू की फोटो सफलतापूर्वक अपलोड हुई!" : "Scale photo uploaded successfully!");
  };

  const handleCompletePickup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCompletionPickup) return;
    if (!paymentConfirmed) {
      toast.error(lang === "hi" ? "कृपया काम पूरा करने के लिए पुष्टि करें।" : "Please confirm payment release.");
      return;
    }

    const weightRatio = Number(finalWeight) / (activeCompletionPickup.estimatedWeight || 1);
    const calcPrice = Math.round((activeCompletionPickup.estimatedPrice || activeCompletionPickup.payoutAmount || 150) * weightRatio);
    
    confirmPickupWeighed(activeCompletionPickup.id, Number(finalWeight), calcPrice);

    const msg = lang === "hi" 
      ? `पिकअप पूरा हुआ! ₹${calcPrice} का भुगतान सीधे आपके UPI खाते में जमा कर दिया गया है।` 
      : lang === "kn"
      ? `ಪಿಕಪ್ ಪೂರ್ಣಗೊಂಡಿದೆ! ₹${calcPrice} ಯುಪಿಐಗೆ ಜಮೆಯಾಗಿದೆ.`
      : `Pickup completed! ₹${calcPrice} transferred instantly to your UPI account.`;
    speak(msg);
    setCompletionModalOpen(false);
  };

  const handleNextPickupAction = (pickup: PickupRequest) => {
    if (pickup.status === "accepted") {
      startPickupRoute(pickup.id);
      const msg = lang === "hi" 
        ? "रास्ते पर निकल रहे हैं! नागरिक को सूचना भेज दी गई है।" 
        : lang === "kn"
        ? "ಮಾರ್ಗದಲ್ಲಿ ಹೊರಟಿದ್ದೀರಿ! ನಾಗರಿಕರಿಗೆ ಸೂಚನೆ ಕಳುಹಿಸಲಾಗಿದೆ."
        : "Started navigation! Generator has been notified.";
      speak(msg);
    } else if (pickup.status === "on_the_way" || pickup.status === "picked_up") {
      openCompletionModal(pickup);
    } else if (pickup.status === "pending") {
      acceptPickupRequest(pickup.id, user.id, user.name);
      const msg = lang === "hi" 
        ? "पिकअप स्वीकार कर लिया गया! काम शुरू करें।" 
        : lang === "kn"
        ? "ಪಿಕಪ್ ಸ್ವೀಕರಿಸಲಾಗಿದೆ! ಕೆಲಸ ಆರಂಭಿಸಿ."
        : "Pickup accepted! Start your route.";
      speak(msg);
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
      distanceKm: 0.4,
    }, langCode);

    speakText(prompt, langCode);
    toast.info(lang === "hi" ? "🔊 ऑडियो विवरण चल रहा है..." : lang === "kn" ? "🔊 ಆಡಿಯೋ ವಿವರಣೆ ಪ್ಲೇ ಆಗುತ್ತಿದೆ..." : "🔊 Playing audio description...");
  };

  const openWhatsAppModal = (req: PickupRequest) => {
    setActiveWhatsAppPickup(req);
    setWhatsAppModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-24 md:pb-16 max-w-6xl mx-auto">
      
      {/* Header Profile Greeting */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span>{t("dash.greeting")}, {user.name.split(' ')[0]}</span>
            {user.verificationStatus === 'verified' && (
              <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-bold border border-blue-200">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                {lang === "hi" ? "सत्यापित रीसायकलर" : lang === "kn" ? "ದೃಢೀಕೃತ ರಿಸೈಕ್ಲರ್" : "Verified Recycler"}
              </span>
            )}
          </h2>
          <p className="text-sm text-slate-600 mt-0.5">{t("dash.subtitle")}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={pickerProfile.availability === 'online' ? 'success' : 'warning'} className="px-3.5 py-1.5 text-xs font-bold rounded-xl min-h-[36px] flex items-center">
            {pickerProfile.availability === 'online' ? t("dash.online") : t("dash.busy")}
          </Badge>
          <Link href="/picker/route-planner">
            <Button size="sm" variant="outline" className="rounded-xl text-xs font-bold gap-1.5 border-emerald-600 text-emerald-800 hover:bg-emerald-50 min-h-[40px] px-3.5">
              <Compass className="h-4 w-4 text-emerald-600" />
              {lang === "hi" ? "ढलान रूट नक्शा" : lang === "kn" ? "ಮಾರ್ಗ ನಕ್ಷೆ" : "Route Map"}
            </Button>
          </Link>
        </div>
      </div>

      {/* #1 PRIMARY HERO BLOCK: "Your Next Pickup" with big 52px CTA */}
      <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-7 border-2 border-emerald-500/50 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-emerald-500 text-slate-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                {lang === "hi" ? "⭐ आपका अगला पिकअप" : lang === "kn" ? "⭐ ನಿಮ್ಮ ಮುಂದಿನ ಪಿಕಪ್" : "⭐ Your Next Pickup"}
              </span>
              {isNextAssigned ? (
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/40 text-xs font-mono">
                  {nextPickup?.status === "on_the_way" 
                    ? (lang === "hi" ? "रास्ते में हैं 🚀" : lang === "kn" ? "ಮಾರ್ಗದಲ್ಲಿದೆ 🚀" : "En Route 🚀") 
                    : nextPickup?.status === "picked_up"
                    ? (lang === "hi" ? "पहुंच गए - वजन बाकी ⚖️" : lang === "kn" ? "ತಲುಪಿದೆ - ತೂಕ ಬಾಕಿ ⚖️" : "Arrived - Confirm Weight ⚖️")
                    : (lang === "hi" ? "स्वीकृत - शुरू करें 🟢" : lang === "kn" ? "ಸ್ವೀಕರಿಸಲಾಗಿದೆ 🟢" : "Accepted - Start Now 🟢")}
                </Badge>
              ) : (
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-400/40 text-xs">
                  {lang === "hi" ? "नजदीकी उपलब्ध अवसर" : lang === "kn" ? "ಹತ್ತಿರದ ಅವಕಾಶ" : "Nearby Opportunity"}
                </Badge>
              )}

              {nextPickup && (
                <button
                  onClick={() => handleSpeakCard(nextPickup)}
                  className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 transition-colors ml-auto md:ml-0"
                  title="Listen pickup details"
                >
                  <Volume2 className="h-4 w-4" />
                </button>
              )}
            </div>

            {nextPickup ? (
              <>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {nextPickup.generatorName}
                  </h3>
                  <div className="flex items-center text-sm text-slate-300 mt-1 gap-1.5">
                    <MapPin className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>{nextPickup.address}</span>
                    <span className="text-emerald-400 font-bold">• ~0.4 km</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2.5 pt-1">
                  <div className="bg-slate-800/90 border border-slate-700 px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-2">
                    <span className="text-slate-400">{lang === "hi" ? "कचरा प्रकार:" : lang === "kn" ? "ತ್ಯಾಜ್ಯ ವಿಧ:" : "Waste:"}</span>
                    <strong className="text-emerald-300 font-bold">{nextPickup.wasteType}</strong>
                  </div>
                  <div className="bg-slate-800/90 border border-slate-700 px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-2">
                    <Scale className="h-3.5 w-3.5 text-blue-400" />
                    <span className="text-slate-400">{lang === "hi" ? "वजन:" : lang === "kn" ? "ತೂಕ:" : "Est:"}</span>
                    <strong className="text-white font-bold">{nextPickup.estimatedWeight} kg</strong>
                  </div>
                  <div className="bg-slate-800/90 border border-slate-700 px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-amber-400" />
                    <span className="text-slate-400">{lang === "hi" ? "समय:" : lang === "kn" ? "ಸಮಯ:" : "Slot:"}</span>
                    <strong className="text-white font-bold">{nextPickup.preferredTime || "10:00 AM - 12:00 PM"}</strong>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-4">
                <h3 className="text-xl font-bold text-white">
                  {lang === "hi" ? "फिलहाल कोई सक्रिय पिकअप नहीं है" : lang === "kn" ? "ಯಾವುದೇ ಸಕ್ರಿಯ ಪಿಕಪ್ ಇಲ್ಲ" : "No active pickup assigned"}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {lang === "hi" ? "नजदीकी कबाड़ रडार पर जाएं और नया काम स्वीकार करें।" : "Explore Nearby Radar to pick up recyclable collections near you."}
                </p>
              </div>
            )}
          </div>

          {/* Right Hero Payout + Big Action Button */}
          <div className="w-full md:w-auto flex flex-col items-stretch md:items-end justify-between gap-4 border-t md:border-t-0 border-slate-800 pt-4 md:pt-0 shrink-0">
            {nextPickup && (
              <div className="text-left md:text-right">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {lang === "hi" ? "गारंटीकृत शुद्ध पारिश्रमिक" : lang === "kn" ? "ಖಾತರಿ ವೇತನ" : "Guaranteed Payout"}
                </div>
                <div className="text-3xl sm:text-4xl font-black text-emerald-400">
                  ₹{(nextPickup.finalPrice || nextPickup.estimatedPrice || nextPickup.payoutAmount || 174).toFixed(0)}
                </div>
                <div className="text-[11px] text-emerald-300/80 font-medium">
                  {lang === "hi" ? "100% सीधा बैंक UPI सेटलमेंट" : "100% Direct Escrow UPI"}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full">
              {nextPickup ? (
                <>
                  <Button
                    onClick={() => handleNextPickupAction(nextPickup)}
                    className="h-[52px] px-8 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-base rounded-2xl shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 active:scale-98"
                  >
                    <Navigation className="h-5 w-5 fill-slate-950" />
                    <span>
                      {nextPickup.status === "accepted"
                        ? (lang === "hi" ? "रास्ते पर निकलें (Start)" : lang === "kn" ? "ಮಾರ್ಗ ಆರಂಭಿಸಿ (Start)" : "Start Navigation")
                        : nextPickup.status === "on_the_way"
                        ? (lang === "hi" ? "पहुंच गए (Mark Arrived)" : lang === "kn" ? "ತಲುಪಿದೆವು (Arrived)" : "Mark Arrived & Collect")
                        : nextPickup.status === "picked_up"
                        ? (lang === "hi" ? "वजन व फोटो दर्ज करें" : lang === "kn" ? "ತೂಕ ನಮೂದಿಸಿ" : "Complete & Confirm Weight")
                        : (lang === "hi" ? "स्वीकार करें व शुरू करें" : lang === "kn" ? "ಸ್ವೀಕರಿಸಿ ಮತ್ತು ಆರಂಭಿಸಿ" : "Accept & Start Job")}
                    </span>
                  </Button>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openWhatsAppModal(nextPickup)}
                      className="flex-1 h-11 bg-slate-800/80 hover:bg-slate-700 text-emerald-300 border-slate-700 rounded-xl text-xs font-bold gap-1.5"
                    >
                      <MessageCircle className="h-4 w-4 text-emerald-400" />
                      WhatsApp
                    </Button>
                    <Link href="/picker/my-pickups" className="flex-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-11 bg-slate-800/80 hover:bg-slate-700 text-white border-slate-700 rounded-xl text-xs font-bold"
                      >
                        {lang === "hi" ? "विवरण देखें" : "View Details"}
                      </Button>
                    </Link>
                  </div>
                </>
              ) : (
                <Link href="/picker/nearby-requests" className="w-full">
                  <Button className="h-[52px] w-full px-8 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-2xl shadow-lg">
                    <Compass className="h-5 w-5 mr-2" />
                    {lang === "hi" ? "नजदीकी कबाड़ खोजें" : lang === "kn" ? "ಹತ್ತಿರದ ತ್ಯಾಜ್ಯ ಹುಡುಕಿ" : "Explore Nearby Radar"}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Safai Saathi Audio Co-Pilot Hero Banner */}
      <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-md">
            <Mic className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base text-white">
                {lang === "hi" ? "सफाई साथी वॉइस असिस्टेंट" : lang === "kn" ? "ಸಫಾಯಿ ಸಾಥಿ ಧ್ವನಿ ಸಹಾಯಕ" : "Safai Saathi Audio Co-Pilot"}
              </h3>
              <Badge className="bg-emerald-500/20 text-emerald-300 border-0 text-[10px] font-mono">
                {lang === "hi" ? "आवाज चालू 🟢" : "Audio Active 🟢"}
              </Badge>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {lang === "hi"
                ? "बिना पढ़े बोलकर चलाएं - कमाई, अगला पिकअप और कबाड़ के ताज़ा भाव सुनें।"
                : lang === "kn"
                ? "ಓದದೆ ಮಾತನಾಡಿ - ಆದಾಯ, ಮುಂದಿನ ಪಿಕಪ್ ವಿವರಗಳನ್ನು ಕೇಳಿ."
                : "Listen to earnings, next pickup details, or speak your voice commands."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          <Button
            size="sm"
            onClick={() => {
              speak(lang === "hi" ? "सुरेश जी, आज आपकी कुल कमाई 450 रुपये है। आज 3 पिकअप पूरे किए हैं।" : "Suresh, your earnings today are 450 rupees from 3 pickups.");
            }}
            className="h-10 px-3.5 bg-slate-800 hover:bg-slate-750 text-emerald-400 border border-slate-700 text-xs font-bold rounded-xl gap-1.5 shadow-xs"
          >
            <Volume2 className="h-4 w-4 text-emerald-400" />
            {lang === "hi" ? "कमाई सुनें 🔊" : lang === "kn" ? "ಗಳಿಕೆ ಕೇಳಿ 🔊" : "Listen Earnings 🔊"}
          </Button>

          <Button
            size="sm"
            onClick={() => {
              speak(lang === "hi" ? "अगला पिकअप 0.4 किलोमीटर दूर कोरमंगला में है, 12 किलो गत्ता व कागज़, अनुमानित कमाई 174 रुपये।" : "Next pickup is 0.4 km away at Koramangala, 12 kg cardboard, payout 174 rupees.");
            }}
            className="h-10 px-3.5 bg-slate-800 hover:bg-slate-750 text-amber-300 border border-slate-700 text-xs font-bold rounded-xl gap-1.5 shadow-xs"
          >
            <Volume2 className="h-4 w-4 text-amber-300" />
            {lang === "hi" ? "अगला काम सुनें 🔊" : lang === "kn" ? "ಮುಂದಿನ ಕೆಲಸ 🔊" : "Listen Next Job 🔊"}
          </Button>

          <Button
            size="sm"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("open-safai-saathi"));
              }
            }}
            className="h-10 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl gap-1.5 shadow-md"
          >
            <Mic className="h-4 w-4" />
            {lang === "hi" ? "बोलें 🎙️" : lang === "kn" ? "ಮಾತನಾಡಿ 🎙️" : "Speak 🎙️"}
          </Button>
        </div>
      </div>

      {/* Secondary Metrics / Income Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900 text-white shadow-md border-0 rounded-2xl">
          <CardContent className="p-4 sm:p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-medium text-slate-400 mb-1">{t("dash.todayEarnings")}</p>
                <h3 className="text-2xl font-bold text-emerald-400">₹{pickerProfile.dailyEarnings}</h3>
              </div>
              <div className="p-2.5 bg-slate-800 text-emerald-400 rounded-2xl">
                <Banknote className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
              <span>{t("dash.goal")}</span>
              <span className="font-bold text-emerald-400">{Math.round((pickerProfile.dailyEarnings / 800) * 100)}%</span>
            </div>
            <div className="mt-1.5 h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all duration-500 rounded-full" style={{ width: `${Math.min(100, (pickerProfile.dailyEarnings / 800) * 100)}%` }}></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs rounded-2xl border-t-4 border-t-blue-500 bg-white">
          <CardContent className="p-4 sm:p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-600 mb-1">{t("dash.weeklyEarnings")}</p>
                <h3 className="text-2xl font-bold text-slate-900">₹{pickerProfile.weeklyEarnings.toLocaleString("en-IN")}</h3>
              </div>
              <div className="p-2.5 bg-blue-50 text-blue-700 rounded-2xl">
                <Wallet className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <Link href="/picker/wallet" className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1">
                {lang === "hi" ? "वॉलेट देखें (₹1,450)" : lang === "kn" ? "ವಾಲೆಟ್ ವೀಕ್ಷಿಸಿ" : "View Wallet (₹1,450)"} <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs rounded-2xl border-t-4 border-t-amber-500 bg-white">
          <CardContent className="p-4 sm:p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-600 mb-1">{t("dash.pendingPayouts")}</p>
                <h3 className="text-2xl font-bold text-emerald-700">₹0</h3>
              </div>
              <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 text-xs text-slate-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              {lang === "hi" ? "100% तुरंत UPI सेटलमेंट" : "100% Direct Escrow UPI"}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs rounded-2xl border-t-4 border-t-purple-500 bg-white">
          <CardContent className="p-4 sm:p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-600 mb-1">{t("dash.jobsCompleted")}</p>
                <h3 className="text-2xl font-bold text-slate-900">{pickerProfile.completedJobsToday}</h3>
              </div>
              <div className="p-2.5 bg-purple-50 text-purple-700 rounded-2xl">
                <CalendarCheck className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <Link href="/picker/benefits" className="text-xs font-bold text-purple-700 hover:text-purple-800 flex items-center gap-1">
                {lang === "hi" ? "कर्मा स्कोर: 782" : lang === "kn" ? "ಕರ್ಮ ಸ್ಕೋರ್: 782" : "Karma Score: 782"} <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Route and Radar previews */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Left: Active Jobs & Downhill Loop */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-900">{t("dash.acceptedPickups")}</h3>
              <p className="text-xs text-slate-600">{lang === "hi" ? "सक्रिय कार्य जो आपको पूरे करने हैं" : "Active tasks assigned to you"}</p>
            </div>
            <Link href="/picker/my-pickups">
              <Button variant="outline" size="sm" className="rounded-xl text-xs font-bold border-slate-300">
                {lang === "hi" ? "सभी कार्य देखें" : "View All"} <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {acceptedPickups.length === 0 ? (
              <Card className="border-dashed border-2 rounded-2xl bg-white">
                <CardContent className="p-8 text-center text-slate-600">
                  <p className="text-sm font-medium">{t("dash.noJobs")}</p>
                  <Link href="/picker/nearby-requests">
                    <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold min-h-[44px]">
                      {lang === "hi" ? "नजदीकी पिकअप खोजें" : "Explore Nearby Radar"}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              acceptedPickups.map(req => (
                <Card key={req.id} className="border-slate-200 border-l-4 border-l-emerald-600 bg-white shadow-xs rounded-2xl">
                  <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-base text-slate-900">{req.generatorName}</h4>
                        <Badge className="bg-emerald-50 text-emerald-800 border-emerald-300 text-[11px] font-bold">
                          {req.wasteType}
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-600 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>{req.address}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>{req.preferredTime || "Today"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-start sm:items-end justify-between gap-3 border-t sm:border-t-0 pt-3 sm:pt-0">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">{t("dash.expectedPayout")}</span>
                        <div className="text-xl font-black text-emerald-700">₹{(req.finalPrice || req.estimatedPrice || req.payoutAmount || 0).toFixed(0)}</div>
                      </div>
                      <Link href="/picker/my-pickups">
                        <Button size="sm" className="bg-slate-900 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold min-h-[40px]">
                          {lang === "hi" ? "कार्य स्थिति देखें" : "View Status"}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Right: Fairness Score & Nearby Radar Preview */}
        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-slate-900 via-slate-850 to-emerald-950 text-white shadow-md rounded-2xl relative overflow-hidden border-0">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <Sparkles className="h-32 w-32" />
            </div>
            <CardContent className="p-5 relative z-10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-sm flex items-center gap-2 text-amber-300">
                  <Sparkles className="h-4 w-4 fill-amber-300" /> 
                  {t("dash.opportunityScore")}
                </h3>
                <span className="text-2xl font-black text-amber-400">{pickerProfile.fairnessPriorityScore}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t("dash.opportunityDesc")}
              </p>
              <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
                <span>{lang === "hi" ? "अल्गोरिदम स्थिति: सक्रिय" : "Fair Algorithm: Active"}</span>
                <span className="text-emerald-400 font-bold">{lang === "hi" ? "प्राथमिकता प्राप्त ✅" : "High Priority ✅"}</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick link to Nearby Requests */}
          <Card className="border-slate-200 rounded-2xl bg-white shadow-xs p-5">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-bold text-sm text-slate-900">{t("dash.recommendedNearby")}</h4>
              <Link href="/picker/nearby-requests" className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1">
                {t("dash.viewMap")} <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              {lang === "hi" ? "आपके 3 किमी दायरे में 4 नए रीसाइक्लेबल पिकअप उपलब्ध हैं।" : "4 recyclable pickups available within your 3 km work zone."}
            </p>
            <Link href="/picker/nearby-requests">
              <Button className="w-full bg-slate-900 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold min-h-[44px]">
                <Compass className="h-4 w-4 mr-1.5 text-emerald-400" />
                {lang === "hi" ? "लाइव रडार नक्शा खोलें" : "Open Radar Map"}
              </Button>
            </Link>
          </Card>
        </div>

      </div>

      {/* Floating Emergency SOS Button with 2s hold-to-confirm */}
      <SOSFloatingButton />

      {/* Weigh & Complete Modal directly on Dashboard */}
      {completionModalOpen && activeCompletionPickup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Scale className="h-5 w-5 text-emerald-600" />
                  {lang === "hi" ? "वजन दर्ज करें व काम पूरा करें" : "Weigh & Confirm Completion"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {activeCompletionPickup.wasteType} • {activeCompletionPickup.generatorName}
                </p>
              </div>
              <button 
                onClick={() => setCompletionModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCompletePickup} className="space-y-4">
              {/* Weight input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex justify-between">
                  <span>{lang === "hi" ? "वास्तविक तराजू का वजन (kg)" : "Actual Scale Weight (kg)"}</span>
                  <span className="text-emerald-700 font-bold text-xs">{lang === "hi" ? "अनुमानित:" : "Est:"} {activeCompletionPickup.estimatedWeight} kg</span>
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.5"
                    min="0.5"
                    required
                    value={finalWeight}
                    onChange={(e) => setFinalWeight(Number(e.target.value))}
                    className="h-12 text-lg font-black text-slate-900 pl-10 border-slate-300 rounded-xl"
                  />
                  <Scale className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                </div>
              </div>

              {/* Photo Upload Section */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  {lang === "hi" ? "तराजू की लाइव फोटो (विवाद से बचाव के लिए)" : "Scale / Material Photo Proof (Anti-Fraud)"}
                </label>
                
                {scalePhotoUrl ? (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500 h-32 bg-slate-100">
                    <img src={scalePhotoUrl} alt="Scale Proof" className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> {lang === "hi" ? "अपलोड हो गया" : "Verified"}
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={handleSimulatePhotoUpload}
                    className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-4 text-center cursor-pointer bg-slate-50 hover:bg-emerald-50/50 transition-colors flex flex-col items-center justify-center gap-1 min-h-[90px]"
                  >
                    <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Camera className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      {lang === "hi" ? "कैमरा खोलें या तराजू की फोटो अपलोड करें" : "Take Photo of Scale Reading"}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {lang === "hi" ? "क्लिक करके फोटो सिम्युलेट करें" : "Click to simulate instant capture"}
                    </span>
                  </div>
                )}
              </div>

              {/* Price Calculation Box */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                <div className="flex justify-between items-center text-xs text-emerald-900">
                  <span>{lang === "hi" ? "उचित बेंचमार्क दर:" : "Fair Benchmark Rate:"}</span>
                  <span className="font-bold">₹{Math.round(((activeCompletionPickup.estimatedPrice || 150) / (activeCompletionPickup.estimatedWeight || 10)) * 10) / 10}/kg</span>
                </div>
                <div className="flex justify-between items-center text-xs text-emerald-900">
                  <span>{lang === "hi" ? "अंतिम वजन:" : "Verified Weight:"}</span>
                  <span className="font-bold">{finalWeight} kg</span>
                </div>
                <div className="pt-2 border-t border-emerald-200/80 flex justify-between items-center">
                  <span className="font-bold text-slate-900 text-sm">{lang === "hi" ? "सीधा UPI भुगतान:" : "Instant UPI Payout:"}</span>
                  <span className="font-black text-2xl text-emerald-700">
                    ₹{Math.round(Number(finalWeight || 0) * (Math.round(((activeCompletionPickup.estimatedPrice || 150) / (activeCompletionPickup.estimatedWeight || 10)) * 10) / 10))}
                  </span>
                </div>
              </div>

              {/* Instant UPI Confirmation checkbox */}
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <input 
                  type="checkbox" 
                  id="dashConfirmPayment" 
                  checked={paymentConfirmed} 
                  onChange={(e) => setPaymentConfirmed(e.target.checked)}
                  className="rounded h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="dashConfirmPayment" className="text-slate-700 font-medium">
                  {lang === "hi" 
                    ? "नागरिक से सामग्री प्राप्त हुई और 100% UPI ट्रांसफर शुरू करें।" 
                    : "I have weighed and collected materials; release direct UPI payout."}
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setCompletionModalOpen(false)}
                  className="flex-1 rounded-xl h-11 text-xs font-bold"
                >
                  {lang === "hi" ? "वापस जाएं" : "Back"}
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11 text-xs font-black shadow-md flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {lang === "hi" ? "वजन व भुगतान पूरा करें" : "Confirm Weight & Receive UPI"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

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
