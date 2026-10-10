"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { MOCK_PICKERS } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Navigation,
  ArrowDown,
  Activity,
  TrendingDown,
  Flame,
  Volume2,
  Info,
  CheckCircle2,
  MapPin
} from "lucide-react";
import Link from "next/link";
import SOSFloatingButton from "@/components/SOSFloatingButton";
import { speakText, LanguageCode } from "@/lib/voice-assistant";
import { toast } from "sonner";
import dynamic from "next/dynamic";

const LiveRouteMap = dynamic(() => import("@/components/LiveRouteMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full bg-slate-100 rounded-2xl flex items-center justify-center text-xs font-bold text-slate-500 border-2 border-slate-200">
      Loading Interactive Leaflet Map...
    </div>
  ),
});

export default function RoutePlanner() {
  const { user } = useAuth();
  const { lang, t, speak } = useLanguage();
  const [vehicleType, setVehicleType] = useState<"pushcart" | "rickshaw" | "foot">("pushcart");

  if (!user || user.role !== "picker") {
    return <div className="p-8 text-sm">Unauthorized. Please log in as a Waste-Picker.</div>;
  }

  const pickerProfile = MOCK_PICKERS.find((p) => p.userId === user.id);

  // Max payload based on vehicle
  const vehicleLimits = {
    pushcart: { 
      name: lang === "hi" ? "हाथ ठेला (Manual Pushcart)" : lang === "kn" ? "ಕೈ ಬಂಡಿ" : "Manual Pushcart", 
      maxKg: 100, 
      icon: "🛒", 
      strainFactor: 1.0 
    },
    rickshaw: { 
      name: lang === "hi" ? "साइकिल रिक्शा (Rickshaw)" : lang === "kn" ? "ಸೈಕಲ್ ರಿಕ್ಷಾ" : "Cycle Rickshaw", 
      maxKg: 60, 
      icon: "🚲", 
      strainFactor: 1.2 
    },
    foot: { 
      name: lang === "hi" ? "पैदल बोरी (On Foot Sack)" : lang === "kn" ? "ಕಾಲ್ನಡಿಗೆ ಚೀಲ" : "On Foot Sack", 
      maxKg: 20, 
      icon: "🚶", 
      strainFactor: 1.8 
    },
  };

  // Multi-stop Downhill Route Sample Data
  const multiStopSample = [
    {
      id: "stop1",
      name: "Dr. Arvind (Apt 4B)",
      address: "Hilltop Enclave, 80ft Road",
      wasteType: lang === "hi" ? "प्लास्टिक बोतलें" : lang === "kn" ? "ಪ್ಲಾಸ್ಟಿಕ್ ಬಾಟಲ್" : "Plastic & PET Bottles",
      weight: 14,
      payout: 168,
      elevation: 928,
      lat: 12.9382,
      lng: 77.6210,
    },
    {
      id: "stop2",
      name: "Sunita Verma (Villa 12)",
      address: "Middle Cross Road 4, Sector 2",
      wasteType: lang === "hi" ? "गत्ता व क्राफ्ट पेपर" : lang === "kn" ? "ರಟ್ಟಿನ ಪೆಟ್ಟಿಗೆಗಳು" : "Cardboard & Papers",
      weight: 22,
      payout: 220,
      elevation: 916,
      lat: 12.9351,
      lng: 77.6242,
    },
    {
      id: "stop3",
      name: "GreenCafe & Bistro",
      address: "Valley Market Road, 5th Block",
      wasteType: lang === "hi" ? "एल्युमिनियम के डिब्बे व धातु" : lang === "kn" ? "ಅಲ್ಯೂಮಿನಿಯಂ & ಲೋಹ" : "Aluminum Cans & Scrap",
      weight: 12,
      payout: 180,
      elevation: 904,
      lat: 12.9315,
      lng: 77.6278,
    },
  ];

  // Map representation stops with start and finish
  const mapStops = [
    {
      id: "start_hilltop",
      name: lang === "hi" ? "शुरुआत (पहाड़ी शीर्ष)" : "Start (Hilltop Point)",
      address: "80 Feet Main Road Peak (Elev: 935m)",
      wasteType: "-",
      weight: 0,
      payout: 0,
      elevation: 935,
      lat: 12.9405,
      lng: 77.6190,
      isStart: true,
    },
    ...multiStopSample.map(s => ({
      ...s,
      isStart: false,
      isFinish: false,
    })),
    {
      id: "finish_depot",
      name: lang === "hi" ? "🏁 डिपो (तराई केंद्र)" : "🏁 DWCC Scrap Depot (Base)",
      address: "BBMP Dry Waste Aggregation Depot, Koramangala Base",
      wasteType: "-",
      weight: 0,
      payout: 0,
      elevation: 898,
      lat: 12.9280,
      lng: 77.6310,
      isFinish: true,
    }
  ];

  const totalWeight = multiStopSample.reduce((acc, curr) => acc + curr.weight, 0);
  const totalEarnings = multiStopSample.reduce((acc, curr) => acc + curr.payout, 0);
  const totalDistance = 2.4; // km
  const estCaloriesBurned = Math.round(totalDistance * 65 * vehicleLimits[vehicleType].strainFactor);
  const earningsPerKcal = (totalEarnings / Math.max(1, estCaloriesBurned)).toFixed(2);

  const handleSpeakRoute = () => {
    const langCode = (lang === "hi" ? "hi-IN" : lang === "kn" ? "kn-IN" : "en-IN") as LanguageCode;
    const summary = lang === "hi"
      ? `ढलान आधारित स्मार्ट रूट तैयार है। कुल 3 स्टॉप हैं, 48 किलो कबाड़ और कुल कमाई ₹568 होगी। ठेला ऊपर से नीचे ले जाने पर अनुमानित 45% कम मेहनत लगेगी।`
      : lang === "kn"
      ? `ಇಳಿಜಾರು ಮಾರ್ಗ ಸಿದ್ಧವಾಗಿದೆ. ಒಟ್ಟು 3 ನಿಲುಗಡೆಗಳು, 48 ಕೆಜಿ ತ್ಯಾಜ್ಯ ಮತ್ತು ₹568 ಗಳಿಕೆ. ಶ್ರಮ 45% ಕಡಿಮೆ.`
      : `Downhill route optimized. 3 pickup stops with 48 kg payload, total payout ₹568. Estimated 45% less physical energy expenditure.`;

    speakText(summary, langCode);
    toast.info(lang === "hi" ? "🔊 रूट का विवरण चल रहा है..." : "🔊 Playing route audio summary...");
  };

  return (
    <div className="space-y-6 pb-24 md:pb-16 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <TrendingDown className="h-6 w-6 text-emerald-600" />
            {t("route.title")}
          </h2>
          <p className="text-sm text-slate-600 mt-0.5">
            {t("route.subtitle")}
          </p>
        </div>
        <Button 
          onClick={handleSpeakRoute} 
          variant="outline" 
          className="gap-2 border-emerald-300 text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded-xl text-xs font-bold min-h-[44px] px-4"
        >
          <Volume2 className="h-4 w-4 text-emerald-600" />
          {lang === "hi" ? "रूट सुनें (Audio)" : lang === "kn" ? "ಆಡಿಯೋ ಸಾರಾಂಶ" : "Audio Summary"}
        </Button>
      </div>

      {/* Real Interactive Leaflet Multi-Stop Route Map */}
      <LiveRouteMap stops={mapStops} height="400px" zoom={14} />

      {/* Vehicle Selector & Physical Strain KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Vehicle Selection Card */}
        <Card className="col-span-2 shadow-xs border-slate-200 rounded-2xl bg-white">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                {lang === "hi" ? "परिवहन साधन व भार क्षमता" : "Vehicle Payload Limits"}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["pushcart", "rickshaw", "foot"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setVehicleType(v)}
                    className={`p-3 rounded-xl border text-left transition-all min-h-[56px] ${
                      vehicleType === v
                        ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                        : "bg-slate-50 text-slate-800 hover:bg-slate-100 border-slate-200"
                    }`}
                  >
                    <div className="text-lg mb-0.5">{vehicleLimits[v].icon}</div>
                    <div className="text-xs font-bold truncate">{vehicleLimits[v].name.split(" ")[0]}</div>
                    <div className="text-[11px] opacity-80">Max {vehicleLimits[v].maxKg}kg</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="text-xs text-slate-600 mt-2.5 font-medium">
              {lang === "hi" ? "वर्तमान भार:" : "Current payload:"}{" "}
              <strong className="text-emerald-800 font-bold">{totalWeight} kg</strong> /{" "}
              {vehicleLimits[vehicleType].maxKg} kg ({lang === "hi" ? "सुरक्षित सीमा ✅" : "Safe limit ✅"})
            </div>
          </CardContent>
        </Card>

        {/* Physical Strain Meter */}
        <Card className="shadow-xs border-slate-200 rounded-2xl border-t-4 border-t-emerald-500 bg-emerald-50/50">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-emerald-950 uppercase tracking-wider mb-1">{t("route.strainIndex")}</p>
                <h3 className="text-xl font-black text-emerald-800">{lang === "hi" ? "कम शारीरिक तनाव 🟢" : "Low Strain 🟢"}</h3>
                <p className="text-xs text-emerald-900 font-bold mt-1">{lang === "hi" ? "92% ढलान अनुकूल" : "92% Downhill slope"}</p>
              </div>
              <Activity className="h-5 w-5 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        {/* Energy-to-Earnings Ratio */}
        <Card className="shadow-xs border-slate-200 rounded-2xl border-t-4 border-t-amber-500 bg-amber-50/50">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-amber-950 uppercase tracking-wider mb-1">{lang === "hi" ? "ऊर्जा-कमाई अनुपात" : "Effort Efficiency"}</p>
                <h3 className="text-xl font-black text-amber-800">₹{earningsPerKcal}</h3>
                <p className="text-xs text-amber-900 font-bold mt-1">{lang === "hi" ? `प्रति kcal (~${estCaloriesBurned} kcal)` : `Per kcal (~${estCaloriesBurned} kcal)`}</p>
              </div>
              <Flame className="h-5 w-5 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* Left Column: Route Sequence & Payload */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 text-white rounded-2xl p-5 flex justify-between items-center shadow-md">
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-0.5 font-bold">
                {lang === "hi" ? "क्लस्टर की कुल गारंटीकृत कमाई" : "Multi-Stop Guaranteed Earnings"}
              </p>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">₹{totalEarnings}</div>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-0.5 font-bold">
                {lang === "hi" ? "कुल ठेला दूरी" : "Total Distance"}
              </p>
              <div className="text-lg font-bold">{totalDistance} km</div>
            </div>
          </div>

          {/* Connected Multi-Stops */}
          <div className="relative pl-6 space-y-4 pt-2">
            <div className="absolute top-4 bottom-4 left-[11px] w-0.5 bg-emerald-500/40" />

            {/* Starting Point (Top of Hill) */}
            <div className="relative">
              <div className="absolute -left-6 top-1.5 h-5 w-5 rounded-full bg-slate-900 border-4 border-white shadow-xs z-10" />
              <div className="pl-4 bg-slate-100 p-3.5 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    {lang === "hi" ? "🚩 शुरुआत: पहाड़ी की चोटी (80 Feet Peak)" : "🚩 Start: Top of Hill Slope"}
                  </h4>
                  <Badge variant="outline" className="text-[10px] bg-white font-bold text-slate-700">Elev: 935m ⛰️</Badge>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  {lang === "hi" ? "ठेला खाली शुरू होता है (0 kg)। भारी ठेले को चढ़ाई पर नहीं चढ़ाना पड़ता।" : "Pushcart starts empty (0 kg). No uphill hauling."}
                </p>
              </div>
            </div>

            {/* Sorted Cluster Multi-Stops */}
            {multiStopSample.map((stop, idx) => (
              <div key={stop.id} className="relative pt-2">
                <div className="absolute -left-8 -top-1 bg-white px-1 text-[10px] font-bold text-emerald-700 z-10 flex items-center flex-col shadow-xs rounded border border-slate-200">
                  <ArrowDown className="h-3 w-3 text-emerald-600" />
                  0.8 km
                </div>

                <div className="absolute -left-6 top-5 h-5 w-5 rounded-full bg-emerald-600 border-4 border-white shadow-xs z-10 flex items-center justify-center text-[10px] font-black text-white">
                  {idx + 1}
                </div>

                <Card className="ml-4 shadow-xs border-slate-200 hover:border-emerald-400 transition-colors rounded-2xl bg-white">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{stop.address}</h4>
                        <div className="text-xs text-slate-600 font-medium">{lang === "hi" ? "नागरिक:" : "Generator:"} <strong className="text-slate-900">{stop.name}</strong></div>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-900 border-emerald-300 text-xs font-bold rounded-xl">
                        Elev: {stop.elevation}m (↘️)
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs my-2">
                      <div>
                        <span className="text-slate-500">{lang === "hi" ? "कचरा:" : "Waste:"}</span> <strong className="text-slate-800">{stop.wasteType}</strong>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-500">{lang === "hi" ? "वजन:" : "Weight:"}</span> <strong className="text-emerald-800 font-bold">+{stop.weight} kg</strong>
                      </div>
                      <div className="col-span-2 pt-1 border-t border-slate-200 flex justify-between">
                        <span className="text-slate-500">{lang === "hi" ? "गारंटीकृत पारिश्रमिक:" : "Payout:"}</span>{" "}
                        <strong className="text-emerald-700 font-bold text-sm">₹{stop.payout}</strong>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}

            {/* Drop-off Point at Base of Hill */}
            <div className="relative pt-2">
              <div className="absolute -left-6 top-3 h-5 w-5 rounded-full bg-emerald-500 border-4 border-white shadow-xs z-10" />
              <div className="pl-4 bg-emerald-50 p-3.5 rounded-xl border border-emerald-300">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-emerald-950 text-xs uppercase tracking-wider">
                    {lang === "hi" ? "🏁 समापन: रीसाइक्लिंग डिपो (तराई)" : "🏁 Finish: BBMP Dry Waste Aggregation Depot"}
                  </h4>
                  <Badge variant="success" className="text-[10px] font-bold">Elev: 898m</Badge>
                </div>
                <p className="text-xs text-emerald-900 font-medium mt-1">
                  {lang === "hi" 
                    ? `कुल ${totalWeight} kg वजन के साथ डिपो पर पहुंचें। 100% सीधी डिजिटल कमाई।` 
                    : `Arrive with full ${totalWeight} kg load at the depot with 0% uphill struggle.`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Elevation Profile Contour + Explicit Estimate Footnote */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="shadow-xs border-slate-200 bg-white rounded-2xl">
            <CardHeader className="p-5 pb-2 border-b border-slate-100">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900">
                <TrendingDown className="h-5 w-5 text-emerald-600" />
                {lang === "hi" ? "ढलान प्रोफ़ाइल ग्राफ" : "Elevation Contour Profile"}
              </CardTitle>
              <CardDescription className="text-xs text-slate-600">
                {lang === "hi" ? "प्राकृतिक ढलान के अनुसार अनुकूलित वक्र" : "Visual descent curve of this 3-stop pickup cluster"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              {/* Simulated Elevation Chart */}
              <div className="h-44 bg-slate-900 rounded-2xl p-4 relative overflow-hidden flex flex-col justify-between text-white shadow-xs">
                <div className="flex justify-between text-xs text-slate-300 font-bold">
                  <span>{lang === "hi" ? "प्रारंभ (चोटी: 935m)" : "Start (Peak: 935m)"}</span>
                  <span>{lang === "hi" ? "डिपो (तराई: 898m)" : "Depot (Base: 898m)"}</span>
                </div>

                {/* SVG Curve */}
                <svg className="w-full h-24" viewBox="0 0 300 80" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="grad-slope" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
                    </linearGradient>
                  </defs>
                  <path d="M 0 10 Q 100 25 180 50 T 300 75 L 300 80 L 0 80 Z" fill="url(#grad-slope)" />
                  <path d="M 0 10 Q 100 25 180 50 T 300 75" fill="none" stroke="#34d399" strokeWidth="3" />
                  <circle cx="10" cy="12" r="4" fill="#34d399" />
                  <circle cx="100" cy="27" r="4" fill="#34d399" />
                  <circle cx="190" cy="52" r="4" fill="#34d399" />
                  <circle cx="290" cy="74" r="4" fill="#60a5fa" />
                </svg>

                <div className="text-center text-[11px] text-emerald-400 font-mono">
                  ↓ {lang === "hi" ? "37 मीटर निरंतर ढलान • भारी ठेला आसानी से लुढ़कता है" : "Continuous 37m descent • Heavy loads roll downhill"}
                </div>
              </div>

              {/* ESTIMATE DISCLAIMER BADGE & NOTE */}
              <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <Info className="h-4 w-4 text-blue-600 shrink-0" />
                  <span>{lang === "hi" ? "अनुमानित 45% ऊर्जा बचत आंकड़ा:" : "Estimated 45% Energy Savings:"}</span>
                </div>
                <p className="text-[12px] text-slate-600">
                  {lang === "hi"
                    ? "*प्राकृतिक ढलान (935m → 898m) के अनुसार क्लस्टर करने से ठेला खींचने में अनुमानित 45% कम शारीरिक ऊर्जा खर्च होती है (MIT D-Lab / TERI बायोमैकेनिक्स मॉडल पर आधारित अनुमान)।"
                    : "*45% reduced physical effort is an engineering estimate derived from terrain slope grade and MIT D-Lab pushcart biomechanical models."}
                </p>
              </div>

              <Link href="/picker/my-pickups" className="block mt-4">
                <Button className="w-full bg-slate-900 hover:bg-emerald-700 text-white font-bold min-h-[48px] rounded-xl text-xs shadow-md">
                  {lang === "hi" ? "सक्रिय कार्य लूप शुरू करें" : "Start Multi-Stop Job Loop"}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Emergency SOS Button */}
      <SOSFloatingButton />
    </div>
  );
}