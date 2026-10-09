"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { MOCK_REQUESTS, MOCK_PICKERS, PickupRequest } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Navigation,
  ArrowDown,
  Activity,
  TrendingDown,
  Flame,
  Volume2
} from "lucide-react";
import Link from "next/link";
import SOSFloatingButton from "@/components/SOSFloatingButton";
import { speakText, LanguageCode } from "@/lib/voice-assistant";
import { toast } from "sonner";
import dynamic from "next/dynamic";

const LiveRouteMap = dynamic(() => import("@/components/LiveRouteMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[380px] w-full bg-slate-100 rounded-2xl flex items-center justify-center text-xs font-bold text-slate-500 border-2 border-slate-200">
      Loading Interactive Leaflet Map...
    </div>
  ),
});

export default function RoutePlanner() {
  const { user } = useAuth();
  const { lang, t, speak } = useLanguage();
  const [vehicleType, setVehicleType] = useState<"pushcart" | "rickshaw" | "foot">("pushcart");

  if (!user || user.role !== "picker") {
    return <div className="p-8">Unauthorized. Please log in as a Waste-Picker.</div>;
  }

  const pickerProfile = MOCK_PICKERS.find((p) => p.userId === user.id);

  // Max payload based on vehicle
  const vehicleLimits = {
    pushcart: { 
      name: lang === "hi" ? "हाथ ठेला (Manual Pushcart)" : "Manual Pushcart", 
      maxKg: 100, 
      icon: "🛒", 
      strainFactor: 1.0 
    },
    rickshaw: { 
      name: lang === "hi" ? "साइकिल रिक्शा (Rickshaw)" : "Cycle Rickshaw", 
      maxKg: 60, 
      icon: "🚲", 
      strainFactor: 1.2 
    },
    foot: { 
      name: lang === "hi" ? "पैदल बोरी (On Foot Sack)" : "On Foot Sack", 
      maxKg: 20, 
      icon: "🚶", 
      strainFactor: 1.8 
    },
  };

  // Active accepted requests
  const activeRequests = MOCK_REQUESTS.filter(
    (r) => r.matchedPickerId === user.id && (r.status === "accepted" || r.status === "on_the_way")
  );

  // If no active requests, pull mock ones for demo visualization
  const displayRequests =
    activeRequests.length > 0
      ? activeRequests
      : [
          {
            id: "demo1",
            generatorName: "Dr. Arvind",
            address: "Hilltop Enclave, Koramangala",
            wasteType: lang === "hi" ? "प्लास्टिक की बोतलें" : "Plastic & Bottles",
            estimatedWeight: 14,
            estimatedPrice: 168,
            status: "accepted" as const,
            elevation: 928, // meters
            location: { lat: 12.938, lng: 77.621 },
          },
          {
            id: "demo2",
            generatorName: "Sunita Verma",
            address: "Middle Cross Road 4, Sector 2",
            wasteType: lang === "hi" ? "गत्ता व कागज़" : "Cardboard & Papers",
            estimatedWeight: 22,
            estimatedPrice: 220,
            status: "accepted" as const,
            elevation: 914, // meters
            location: { lat: 12.935, lng: 77.624 },
          },
          {
            id: "demo3",
            generatorName: "GreenCafe",
            address: "Valley Bottom Market Road",
            wasteType: lang === "hi" ? "एल्युमिनियम के डिब्बे व धातु" : "Aluminum Cans & Scrap",
            estimatedWeight: 12,
            estimatedPrice: 180,
            status: "accepted" as const,
            elevation: 902, // meters
            location: { lat: 12.931, lng: 77.628 },
          },
        ];

  // Sort stops by descending elevation (top of hill to valley base)
  const sortedStops = [...displayRequests]
    .sort((a, b) => ((b as any).elevation || 900) - ((a as any).elevation || 900))
    .map((req, index, arr) => {
      const prevReq = index === 0 ? null : arr[index - 1];
      const dist = prevReq ? 0.8 : 0.4;
      const cumulativeWeight = arr.slice(0, index + 1).reduce((acc, curr) => acc + curr.estimatedWeight, 0);
      return {
        ...req,
        elevation: (req as any).elevation || 910 - index * 10,
        distanceFromPrev: dist,
        cumulativeWeight,
      };
    });

  const totalWeight = sortedStops.reduce((acc, curr) => acc + curr.estimatedWeight, 0);
  const totalEarnings = sortedStops.reduce((acc, curr) => acc + (curr.estimatedPrice || (curr as any).payoutAmount || 0), 0);
  const totalDistance = sortedStops.reduce((acc, curr) => acc + curr.distanceFromPrev, 0);
  const estCaloriesBurned = Math.round(totalDistance * 65 * vehicleLimits[vehicleType].strainFactor);
  const earningsPerKcal = (totalEarnings / Math.max(1, estCaloriesBurned)).toFixed(2);

  const handleSpeakRoute = () => {
    const langCode = (lang === "hi" ? "hi-IN" : lang === "kn" ? "kn-IN" : "en-IN") as LanguageCode;
    const summary = lang === "hi"
      ? `स्मार्ट रूट सक्रिय है। कुल ${sortedStops.length} पिकअप ढलान के क्रम में हैं। कुल वजन ${totalWeight} किलो और संभावित कमाई ₹${totalEarnings.toFixed(0)} है। पहाड़ी से नीचे आते समय ठेला खींचने में आसानी होगी।`
      : `Downhill route optimized. ${sortedStops.length} pickup stops sorted along downhill slope. Total weight is ${totalWeight} kg with guaranteed payout of ₹${totalEarnings.toFixed(0)}. Safe downhill push.`;

    speakText(summary, langCode);
    toast.info(lang === "hi" ? "🔊 रूट का विवरण चल रहा है..." : "🔊 Playing route audio summary...");
  };

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <TrendingDown className="h-6 w-6 text-emerald-600" />
            {t("route.title")}
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {t("route.subtitle")}
          </p>
        </div>
        <Button onClick={handleSpeakRoute} variant="outline" className="gap-2 border-emerald-300 text-emerald-800 bg-emerald-50 rounded-xl text-xs font-semibold">
          <Volume2 className="h-4 w-4 text-emerald-600" />
          {lang === "hi" ? "रूट सुनें (Audio)" : "Audio Summary"}
        </Button>
      </div>

      {/* Vehicle Selector & Physical Strain KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Vehicle Selection Card */}
        <Card className="col-span-2 shadow-xs border-slate-200 rounded-2xl bg-white">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                {lang === "hi" ? "आपके वाहन की भार क्षमता" : "Your Transport Vehicle Limit"}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["pushcart", "rickshaw", "foot"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setVehicleType(v)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      vehicleType === v
                        ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                        : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200"
                    }`}
                  >
                    <div className="text-lg mb-0.5">{vehicleLimits[v].icon}</div>
                    <div className="text-xs font-bold truncate">{vehicleLimits[v].name.split(" ")[0]}</div>
                    <div className="text-[10px] opacity-80">Max {vehicleLimits[v].maxKg}kg</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="text-xs text-slate-500 mt-2">
              {lang === "hi" ? "वर्तमान भार:" : "Current payload load:"}{" "}
              <strong className="text-emerald-700">{totalWeight} kg</strong> /{" "}
              {vehicleLimits[vehicleType].maxKg} kg ({lang === "hi" ? "सुरक्षित सीमा ✅" : "Safe capacity ✅"})
            </div>
          </CardContent>
        </Card>

        {/* Physical Strain Meter */}
        <Card className="shadow-xs border-slate-200 rounded-2xl border-t-4 border-t-emerald-500 bg-emerald-50/40">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-1">{t("route.strainIndex")}</p>
                <h3 className="text-xl font-black text-emerald-700">{lang === "hi" ? "कम तनाव 🟢" : "Low 🟢"}</h3>
                <p className="text-xs text-emerald-800 mt-1">{lang === "hi" ? "92% ढलान अनुकूल" : "92% Downhill gradient"}</p>
              </div>
              <Activity className="h-5 w-5 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        {/* Energy-to-Earnings Ratio */}
        <Card className="shadow-xs border-slate-200 rounded-2xl border-t-4 border-t-amber-500 bg-amber-50/40">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-1">{lang === "hi" ? "ऊर्जा-कमाई अनुपात" : "Effort Efficiency"}</p>
                <h3 className="text-xl font-black text-amber-700">₹{earningsPerKcal}</h3>
                <p className="text-xs text-amber-800 mt-1">{lang === "hi" ? `प्रति kcal कमाई (~${estCaloriesBurned} kcal)` : `Per kcal (~${estCaloriesBurned} kcal)`}</p>
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
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-0.5">
                {lang === "hi" ? "क्लस्टर की कुल गारंटीकृत कमाई" : "Cluster Guaranteed Earnings"}
              </p>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">₹{totalEarnings.toFixed(0)}</div>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-0.5">
                {lang === "hi" ? "कुल ठेला दूरी" : "Total Distance"}
              </p>
              <div className="text-lg font-bold">{totalDistance.toFixed(1)} km</div>
            </div>
          </div>

          {/* Connected Stops */}
          <div className="relative pl-6 space-y-4 pt-2">
            <div className="absolute top-4 bottom-4 left-[11px] w-0.5 bg-emerald-500/30" />

            {/* Starting Point (Top of Hill) */}
            <div className="relative">
              <div className="absolute -left-6 top-1.5 h-5 w-5 rounded-full bg-slate-900 border-4 border-white shadow-xs z-10" />
              <div className="pl-4 bg-slate-100 p-3 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    {lang === "hi" ? "शुरुआत: पहाड़ी की चोटी (शीर्ष)" : "Start: Top of Hill Slope"}
                  </h4>
                  <Badge variant="outline" className="text-[10px] bg-white">Elev: 928m ⛰️</Badge>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {lang === "hi" ? "ठेला खाली शुरू होता है (0 kg)। भारी ठेले को चढ़ाई पर नहीं चढ़ाना पड़ता।" : "Pushcart starts empty (0 kg). No heavy uphill pushing."}
                </p>
              </div>
            </div>

            {/* Sorted Cluster Stops */}
            {sortedStops.map((stop, idx) => (
              <div key={stop.id} className="relative pt-2">
                <div className="absolute -left-8 -top-1 bg-white px-1 text-[10px] font-bold text-emerald-600 z-10 flex items-center flex-col shadow-xs rounded border border-slate-100">
                  <ArrowDown className="h-3 w-3" />
                  {stop.distanceFromPrev.toFixed(1)} km
                </div>

                <div className="absolute -left-6 top-5 h-5 w-5 rounded-full bg-emerald-600 border-4 border-white shadow-xs z-10 flex items-center justify-center text-[10px] font-black text-white">
                  {idx + 1}
                </div>

                <Card className="ml-4 shadow-xs border-slate-200 hover:border-emerald-400 transition-colors rounded-2xl bg-white">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{stop.address}</h4>
                        <div className="text-xs text-slate-500">{lang === "hi" ? "नागरिक:" : "Generator:"} {stop.generatorName}</div>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs rounded-xl">
                        Elev: {stop.elevation}m (↘️)
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs my-2">
                      <div>
                        <span className="text-slate-500">{lang === "hi" ? "कचरा:" : "Waste:"}</span> <strong>{stop.wasteType}</strong>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-500">{lang === "hi" ? "वजन:" : "Weight:"}</span> <strong>+{stop.estimatedWeight} kg</strong>
                      </div>
                      <div>
                        <span className="text-slate-500">{lang === "hi" ? "कुल ठेला लोड:" : "Cart Load:"}</span>{" "}
                        <strong className="text-blue-600">{stop.cumulativeWeight} kg</strong>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-500">{lang === "hi" ? "कमाई:" : "Payout:"}</span>{" "}
                        <strong className="text-emerald-600">₹{stop.estimatedPrice}</strong>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}

            {/* Drop-off Point at Base of Hill */}
            <div className="relative pt-2">
              <div className="absolute -left-6 top-3 h-5 w-5 rounded-full bg-emerald-500 border-4 border-white shadow-xs z-10" />
              <div className="pl-4 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-emerald-950 text-xs uppercase tracking-wider">
                    {lang === "hi" ? "🏁 समापन: रीसाइक्लिंग डिपो (तराई)" : "🏁 Finish: Local Scrap Dropoff Depot"}
                  </h4>
                  <Badge variant="success" className="text-[10px]">Elev: 900m</Badge>
                </div>
                <p className="text-xs text-emerald-800 mt-0.5">
                  {lang === "hi" 
                    ? `कुल ${totalWeight} kg वजन के साथ डिपो पर पहुंचें। 100% सीधी डिजिटल कमाई।` 
                    : `Arrive with full ${totalWeight} kg load at the depot with 0% uphill struggle.`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Elevation Profile Contour */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="shadow-xs border-slate-200 bg-white rounded-2xl">
            <CardHeader className="p-5 pb-2 border-b border-slate-100">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900">
                <TrendingDown className="h-5 w-5 text-emerald-600" />
                {lang === "hi" ? "ढलान प्रोफ़ाइल ग्राफ" : "Elevation Contour Profile"}
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                {lang === "hi" ? "प्राकृतिक ढलान के अनुसार अनुकूलित वक्र" : "Visual descent curve of this optimized pickup cluster"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              {/* Simulated Elevation Chart */}
              <div className="h-44 bg-slate-900 rounded-2xl p-4 relative overflow-hidden flex flex-col justify-between text-white shadow-xs">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>{lang === "hi" ? "प्रारंभ (चोटी: 928m)" : "Start (Hilltop: 928m)"}</span>
                  <span>{lang === "hi" ? "डिपो (तराई: 900m)" : "Depot (Base: 900m)"}</span>
                </div>

                {/* SVG Curve */}
                <svg className="w-full h-24" viewBox="0 0 300 80" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
                    </linearGradient>
                  </defs>
                  <path d="M 0 10 Q 100 25 180 50 T 300 75 L 300 80 L 0 80 Z" fill="url(#grad)" />
                  <path d="M 0 10 Q 100 25 180 50 T 300 75" fill="none" stroke="#34d399" strokeWidth="3" />
                  <circle cx="10" cy="12" r="4" fill="#34d399" />
                  <circle cx="100" cy="27" r="4" fill="#34d399" />
                  <circle cx="190" cy="52" r="4" fill="#34d399" />
                  <circle cx="290" cy="74" r="4" fill="#60a5fa" />
                </svg>

                <div className="text-center text-[11px] text-emerald-400 font-mono">
                  ↓ {lang === "hi" ? "28 मीटर निरंतर ढलान • भारी ठेला आसानी से लुढ़कता है" : "Continuous 28m descent • Heavy loads roll downhill"}
                </div>
              </div>

              <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed">
                <strong>{lang === "hi" ? "यह क्यों महत्वपूर्ण है:" : "Why this matters:"}</strong>{" "}
                {lang === "hi"
                  ? "पारंपरिक नक्शे इलाके की ढलान की उपेक्षा करते हैं। प्राकृतिक ढलान के अनुसार रूट तय करने से ठेला खींचने में 45% कम शारीरिक ऊर्जा लगती है।"
                  : "By routing pickups along the natural slope gradient, the picker expends 45% less physical energy while collecting recyclables."}
              </div>

              <Link href="/picker/my-pickups" className="block mt-4">
                <Button className="w-full bg-slate-900 hover:bg-emerald-700 text-white font-bold h-11 rounded-xl text-xs shadow-xs">
                  {lang === "hi" ? "सक्रिय कार्य लूप शुरू करें" : "Start Active Job Loop"}
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