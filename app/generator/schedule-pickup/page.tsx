"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { usePlatformData } from "@/lib/platform-data-context";
import { MOCK_REQUESTS, PickupRequest, MOCK_PICKERS, MOCK_USERS } from "@/lib/mock-data";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  ArrowRight, 
  UploadCloud, 
  Sparkles, 
  MapPin, 
  Banknote, 
  CalendarClock, 
  Leaf, 
  UserCheck, 
  ShieldCheck, 
  Star, 
  Map, 
  CheckCircle2, 
  X, 
  Image as ImageIcon,
  Check,
  Info,
  Scale,
  HeartHandshake
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { calculateFairPrice, FairPriceBreakdown } from "@/lib/fair-price";
import { findFairMatch, MatchScoreDetails } from "@/lib/fair-match";

export default function SchedulePickup() {
  const { user } = useAuth();
  const { lang, t } = useLanguage();
  const { addPickupRequest } = usePlatformData();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Multi-step state
  const [step, setStep] = useState<"form" | "analyzing" | "result" | "matched">("form");

  // Form State
  const [wasteType, setWasteType] = useState("Plastic");
  const [weight, setWeight] = useState(5);
  const [address, setAddress] = useState(user?.address || "12, MG Road, Bengaluru");
  const [date, setDate] = useState("");
  const [todayMin, setTodayMin] = useState("");
  const [time, setTime] = useState("08:00 AM - 12:00 PM");

  useEffect(() => {
    try {
      const today = new Date().toISOString().split("T")[0];
      setDate(today);
      setTodayMin(today);
    } catch {
      setDate("2026-10-10");
      setTodayMin("2026-10-10");
    }
  }, []);

  const [urgency, setUrgency] = useState<"normal" | "urgent">("normal");
  const [sortingDifficulty, setSortingDifficulty] = useState<"low" | "medium" | "high">("medium");
  const [notes, setNotes] = useState("");
  const [paymentMode, setPaymentMode] = useState<"upi" | "cash">("upi");
  const [roundUpForHealth, setRoundUpForHealth] = useState(true);

  // Image Upload & AI Detection State
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string>("");
  const [imageFileSize, setImageFileSize] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [isScanningImage, setIsScanningImage] = useState(false);
  const [aiConfidence, setAiConfidence] = useState<number>(96);
  const [aiDetectedMaterial, setAiDetectedMaterial] = useState<string>("Plastic (PET Containers)");
  
  // AI Mock & Real Groq Results
  const [detectedType, setDetectedType] = useState("Plastic (PET Bottles)");
  const [priceBreakdown, setPriceBreakdown] = useState<FairPriceBreakdown | null>(null);
  const [matchDetails, setMatchDetails] = useState<MatchScoreDetails | null>(null);
  const [isUsingGroq, setIsUsingGroq] = useState(false);
  const [recyclabilityScore, setRecyclabilityScore] = useState(94);

  if (!user || user.role !== "generator") {
    return <div className="p-8 text-center text-slate-900 font-bold">Unauthorized</div>;
  }

  // Pre-calculate fair price for live form preview
  const livePriceCalculation = calculateFairPrice(
    wasteType, 
    weight, 
    4.5, 
    sortingDifficulty, 
    urgency
  );
  const healthBonus = roundUpForHealth ? 10 : 0;
  const livePricePreview = livePriceCalculation.finalFairPrice + healthBonus;

  // File Handling & Instant Auto AI Categorization
  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert(lang === "hi" ? "कृपया एक मान्य इमेज फाइल चुनें (PNG, JPG, WEBP)" : "Please select a valid image file (PNG, JPG, WEBP)");
      return;
    }
    
    setImageFileName(file.name);
    setImageFileSize(`${(file.size / (1024 * 1024)).toFixed(2)} MB`);

    const reader = new FileReader();
    reader.onload = async (e) => {
      if (e.target?.result) {
        const base64Image = e.target.result as string;
        setUploadedImage(base64Image);
        setIsScanningImage(true);

        try {
          // Immediately scan photo with AI API
          const res = await fetch("/api/analyze-waste", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              image: base64Image,
              fileName: file.name,
              weightHint: weight,
            }),
          });

          const json = await res.json();
          if (json.success && json.data) {
            const data = json.data;
            const detectedCategory = data.categoryKey || "Plastic";
            setWasteType(detectedCategory);
            setAiDetectedMaterial(data.materialType || "Plastic");
            setAiConfidence(data.confidenceScore || 96);
            setDetectedType(lang === "hi" ? data.materialTypeHi : data.materialType);
            setIsUsingGroq(data.usingRealGroq);
            setRecyclabilityScore(data.recyclabilityScore || 94);
            if (data.sortingDifficulty) {
              setSortingDifficulty(data.sortingDifficulty);
            }
          }
        } catch (err) {
          console.warn("Auto-detect image error:", err);
          setWasteType("Plastic");
          setAiDetectedMaterial("Plastic (High Density Polyethylene)");
          setAiConfidence(94);
        } finally {
          setIsScanningImage(false);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadedImage(null);
    setImageFileName("");
    setImageFileSize("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep("analyzing");
    
    try {
      const res = await fetch("/api/analyze-waste", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: uploadedImage,
          fileName: imageFileName,
          wasteTypeHint: wasteType,
          weightHint: weight,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        const data = json.data;
        setDetectedType(lang === "hi" ? data.materialTypeHi : data.materialType);
        setIsUsingGroq(data.usingRealGroq);
        setRecyclabilityScore(data.recyclabilityScore || 94);

        const breakdown = calculateFairPrice(
          wasteType,
          data.estimatedWeightKg || weight,
          4.5,
          data.sortingDifficulty || sortingDifficulty,
          urgency
        );
        
        if (data.explanation) {
          breakdown.explanation = lang === "hi" ? data.explanationHi : data.explanation;
        }

        setPriceBreakdown(breakdown);
        setStep("result");
        return;
      }
    } catch (err) {
      console.warn("API fallback error:", err);
    }

    // Heuristic fallback
    const breakdown = calculateFairPrice(
      wasteType,
      weight,
      4.5,
      sortingDifficulty,
      urgency
    );
    setPriceBreakdown(breakdown);
    setDetectedType(wasteType);
    setStep("result");
  };

  const handleFindMatch = () => {
    const totalPayout = (priceBreakdown?.finalFairPrice || 0) + healthBonus;
    const mockReq: PickupRequest = {
      id: "temp",
      generatorId: user.id,
      generatorName: user.name,
      status: "pending",
      items: [{ type: detectedType, weight }],
      wasteType: detectedType,
      estimatedWeight: weight,
      location: user.location || { lat: 12.9716, lng: 77.5946 },
      preferredTime: `${date} ${time}`,
      urgency: urgency as "low" | "medium" | "high",
      paymentMode: "upi",
      address,
      createdAt: new Date().toISOString(),
      estimatedPrice: totalPayout,
      payoutAmount: totalPayout,
    };

    const match = findFairMatch(mockReq, MOCK_PICKERS, MOCK_USERS);
    setMatchDetails(match);
    setStep("matched");
  };

  const handleFinalizePickup = () => {
    if (!matchDetails) return;

    const totalPayout = (priceBreakdown?.finalFairPrice || 0) + healthBonus;
    const newReq: PickupRequest = {
      id: `req${Date.now()}`,
      generatorId: user.id,
      generatorName: user.name,
      status: "accepted",
      items: [{ type: detectedType, weight }],
      wasteType: detectedType,
      estimatedWeight: weight,
      location: user.location || { lat: 12.9716, lng: 77.5946 },
      preferredTime: `${date} ${time}`,
      urgency: urgency as "low" | "medium" | "high",
      paymentMode: "upi",
      address,
      createdAt: new Date().toISOString(),
      estimatedPrice: totalPayout,
      payoutAmount: totalPayout,
      matchedPickerId: matchDetails.pickerId,
      pickerName: matchDetails.pickerName,
    };
    
    addPickupRequest(newReq);
    router.push("/generator/dashboard");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      
      {/* Header (visible in form & result steps) */}
      {(step === "form" || step === "result") && (
        <div className="flex items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 rounded-xl hover:bg-slate-100 text-slate-800"
            onClick={() => step === "result" ? setStep("form") : router.push("/generator/dashboard")}
          >
            <ArrowLeft className="h-5 w-5 text-slate-900" />
          </Button>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {step === "form" ? (lang === "hi" ? "रीसाइक्लिंग पिकअप शेड्यूल करें" : "Schedule a Waste Pickup") : (lang === "hi" ? "AI कचरा विश्लेषण व मूल्य निर्धारण" : "AI Waste Assessment")}
            </h2>
            <p className="text-xs font-semibold text-slate-600">
              {step === "form" ? (lang === "hi" ? "अपने कचरे और पते का विवरण दर्ज करें" : "Enter details for your eco-friendly waste pickup") : (lang === "hi" ? "कचरे का प्रकार और उचित मूल्य की समीक्षा करें" : "Review our AI waste estimation and verified fair pricing")}
            </p>
          </div>
        </div>
      )}

      {/* Step 1: The Form */}
      {step === "form" && (
        <Card className="shadow-md border border-slate-200/90 rounded-2xl bg-white overflow-hidden">
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleFormSubmit} className="space-y-6">
              
              {/* Hidden Real File Input */}
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/png,image/jpeg,image/webp,image/jpg"
                onChange={handleFileChange}
                className="hidden"
                id="waste-file-upload"
              />

              {/* Interactive Image Upload / Dropzone */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="waste-file-upload" className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                    {lang === "hi" ? "कचरे की फोटो अपलोड करें" : "Upload Waste Image"}
                  </label>
                  {uploadedImage && (
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-300">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" /> {lang === "hi" ? "फोटो संलग्न है" : "Image Attached"}
                    </span>
                  )}
                </div>

                {!uploadedImage ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer select-none ${
                      isDragging 
                        ? "border-emerald-600 bg-emerald-50/80 scale-[1.01]" 
                        : "border-slate-300 bg-slate-50/80 hover:bg-slate-100/90 hover:border-slate-400"
                    }`}
                  >
                    <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 shadow-xs">
                      <UploadCloud className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-900 text-center">
                      {isDragging 
                        ? (lang === "hi" ? "फोटो यहाँ छोड़ें..." : "Drop your image here...")
                        : (lang === "hi" ? "फोटो अपलोड करने के लिए क्लिक करें या यहाँ ड्रैग करें" : "Click to upload or drag & drop image here")}
                    </p>
                    <p className="text-xs font-semibold text-slate-600 mt-1 text-center">
                      {lang === "hi" ? "PNG, JPG, WEBP (अधिकतम 10MB)" : "PNG, JPG, WEBP (max. 10MB)"}
                    </p>
                    <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-300 rounded-lg text-[11px] font-bold text-slate-800 shadow-xs">
                      <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                      {lang === "hi" ? "AI ऑटो-पहचान व श्रेणी निर्धारण" : "AI Category & Purity Detection"}
                    </div>
                  </div>
                ) : (
                  /* Editable AI Detection Result preview */
                  <div className="relative border-2 border-emerald-500 bg-emerald-50/50 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-sm">
                    <div className="relative h-24 w-24 rounded-xl overflow-hidden bg-slate-900 border border-slate-300 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={uploadedImage} 
                        alt="Uploaded waste preview" 
                        className="h-full w-full object-cover"
                      />
                      {isScanningImage && (
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center">
                          <div className="h-6 w-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {isScanningImage ? (
                          <Badge className="bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[10px] animate-pulse">
                            ⚡ Scanning with AI Vision...
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-100 text-emerald-950 border border-emerald-300 font-black text-[11px]">
                            {aiConfidence}% Confidence • {aiDetectedMaterial}
                          </Badge>
                        )}
                        <span className="text-xs font-bold text-slate-600">{imageFileSize}</span>
                      </div>

                      {/* Editable Detection Details */}
                      <div className="mt-2 space-y-1">
                        <div className="text-xs font-bold text-slate-700">
                          {lang === "hi" ? "AI ने श्रेणी खोजी (संपादनीय):" : "AI Detected Category (Editable):"}
                        </div>
                        <div className="flex items-center gap-2">
                          <select 
                            value={wasteType}
                            onChange={(e) => setWasteType(e.target.value)}
                            className="h-9 rounded-lg border border-emerald-300 bg-white px-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          >
                            <option value="Plastic">Plastic (PET Bottles)</option>
                            <option value="Cardboard">Cardboard & Paper</option>
                            <option value="Glass">Glass Bottles</option>
                            <option value="Metal">Metal & Scrap</option>
                            <option value="Electronics">E-Waste</option>
                            <option value="Mixed Recyclables">Mixed Recyclables</option>
                          </select>
                          <span className="text-[11px] text-emerald-800 font-semibold">({recyclabilityScore}% recyclable)</span>
                        </div>
                      </div>

                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs font-bold text-emerald-800 hover:text-emerald-900 hover:underline mt-1.5 inline-block"
                      >
                        {lang === "hi" ? "दूसरी फोटो अपलोड करें" : "Change / Replace photo"}
                      </button>
                    </div>
                    <button 
                      type="button"
                      onClick={removeImage}
                      className="h-8 w-8 rounded-full bg-slate-200 hover:bg-rose-100 hover:text-rose-600 text-slate-700 flex items-center justify-center transition-colors shrink-0 self-end sm:self-center"
                      title="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Core Details */}
              <div className="grid sm:grid-cols-2 gap-5 pt-2">
                <div>
                  <label className="text-xs font-black text-slate-900 uppercase tracking-wider block mb-1.5">
                    {lang === "hi" ? "कचरे का प्रकार" : "Waste Category"}
                  </label>
                  <select 
                    className="flex h-11 w-full rounded-xl border-2 border-slate-300 bg-white px-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-xs"
                    value={wasteType}
                    onChange={(e) => setWasteType(e.target.value)}
                  >
                    <option value="Plastic">{lang === "hi" ? "प्लास्टिक की बोतलें व जार (Plastic)" : "Plastic (Bottles & Containers)"}</option>
                    <option value="Cardboard">{lang === "hi" ? "गत्ता व अखबार (Cardboard)" : "Cardboard & Paper"}</option>
                    <option value="Glass">{lang === "hi" ? "कांच की बोतलें (Glass)" : "Glass Bottles"}</option>
                    <option value="Metal">{lang === "hi" ? "लोहा व धातु कबाड़ (Metal)" : "Metal & Scrap Iron"}</option>
                    <option value="Electronics">{lang === "hi" ? "ई-कचरा (E-Waste)" : "Electronics & E-Waste"}</option>
                    <option value="Mixed Recyclables">{lang === "hi" ? "मिक्स्ड सूखा कचरा (Mixed Recyclables)" : "Mixed Recyclables"}</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black text-slate-900 uppercase tracking-wider mb-1.5 block">
                    {lang === "hi" ? "अनुमानित वजन (kg)" : "Estimated Weight (kg)"}
                  </label>
                  <Input 
                    type="number" 
                    min="0.5" 
                    step="0.5" 
                    value={weight || ""}
                    onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                    required
                    className="rounded-xl h-11 text-sm font-bold text-slate-900 border-2 border-slate-300 bg-white"
                  />
                </div>
              </div>

              {/* Location & Time */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  {lang === "hi" ? "पिकअप का पता व समय" : "Pickup Details"}
                </h3>
                <div>
                  <label className="text-xs font-bold text-slate-900 mb-1.5 block">
                    {lang === "hi" ? "पिकअप का पूरा पता" : "Pickup Address"}
                  </label>
                  <Input 
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)} 
                    placeholder={lang === "hi" ? "उदा: फ्लैट 402, शांति निकेतन, एमजी रोड, बेंगलुरु" : "E.g., Flat 402, Shanti Niketan, MG Road, Bengaluru"}
                    required 
                    className="rounded-xl h-11 text-sm font-bold text-slate-900 border-2 border-slate-300 bg-white" 
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-900 mb-1.5 block">
                      {lang === "hi" ? "पिकअप तारीख" : "Pickup Date"}
                    </label>
                    <Input 
                      type="date" 
                      value={date} 
                      min={todayMin}
                      onChange={(e) => setDate(e.target.value)} 
                      required 
                      className="rounded-xl h-11 text-sm font-bold text-slate-900 border-2 border-slate-300 bg-white cursor-pointer" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-900 mb-1.5 block">
                      {lang === "hi" ? "समय स्लॉट" : "Time Slot"}
                    </label>
                    <select 
                      className="flex h-11 w-full rounded-xl border-2 border-slate-300 bg-white px-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-xs"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      required
                    >
                      <option value="08:00 AM - 12:00 PM">{lang === "hi" ? "सुबह (8:00 AM - 12:00 PM)" : "Morning (8:00 AM - 12:00 PM)"}</option>
                      <option value="12:00 PM - 04:00 PM">{lang === "hi" ? "दोपहर (12:00 PM - 04:00 PM)" : "Afternoon (12:00 PM - 04:00 PM)"}</option>
                      <option value="04:00 PM - 08:00 PM">{lang === "hi" ? "शाम (04:00 PM - 08:00 PM)" : "Evening (04:00 PM - 08:00 PM)"}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Logistics & Fairness Options */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  {lang === "hi" ? "लॉजिस्टिक्स व उचित मूल्य विकल्प" : "Logistics & Options"}
                </h3>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-900 mb-1.5 block">
                      {lang === "hi" ? "छंटाई कठिनाई स्तर" : "Sorting Difficulty"}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['low', 'medium', 'high'] as const).map(lvl => (
                        <button
                          type="button"
                          key={lvl}
                          onClick={() => setSortingDifficulty(lvl)}
                          className={`py-2.5 px-2 border-2 rounded-xl text-xs font-black capitalize transition-all ${
                            sortingDifficulty === lvl 
                              ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                              : 'bg-white text-slate-800 hover:bg-slate-50 border-slate-300'
                          }`}
                        >
                          {lang === "hi" ? (lvl === "low" ? "आसान" : lvl === "medium" ? "मध्यम" : "कठिन") : lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-900 mb-1.5 block">
                      {lang === "hi" ? "प्राथमिकता (Urgency)" : "Urgency"}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setUrgency("normal")}
                        className={`py-2.5 px-3 border-2 rounded-xl text-xs font-black transition-all ${
                          urgency === "normal"
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-white text-slate-800 hover:bg-slate-50 border-slate-300'
                        }`}
                      >
                        {lang === "hi" ? "सामान्य (Normal)" : "Normal"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setUrgency("urgent")}
                        className={`py-2.5 px-3 border-2 rounded-xl text-xs font-black transition-all ${
                          urgency === "urgent"
                            ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                            : 'bg-white text-slate-800 hover:bg-slate-50 border-slate-300'
                        }`}
                      >
                        {lang === "hi" ? "तत्काल (+₹20)" : "Urgent (+₹20)"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Suraksha Health Pool Round-Up */}
                <div className="p-4 bg-rose-50/70 border-2 border-rose-200 rounded-2xl">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={roundUpForHealth}
                      onChange={(e) => setRoundUpForHealth(e.target.checked)}
                      className="h-5 w-5 rounded mt-0.5 text-rose-600 focus:ring-rose-500 border-slate-400"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-900">
                          {lang === "hi" ? "❤️ सुरक्षा कवच स्वास्थ्य कोष के लिए +₹10 जोड़ें" : "❤️ Round up +₹10 for Suraksha Kawach Health Pool"}
                        </span>
                        <Badge variant="outline" className="border-rose-300 text-rose-800 bg-rose-100 font-bold text-[10px]">
                          Worker Dignity
                        </Badge>
                      </div>
                      <p className="text-xs font-semibold text-rose-800 mt-1">
                        {lang === "hi" 
                          ? "इस राशि का 100% सफाई मित्रों के आपातकालीन क्लिनिक और सुरक्षा उपकरणों में जाता है।" 
                          : "100% of this tip goes into the emergency clinic fund protecting waste-pickers from occupational injuries."}
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Explicit Estimated Price Breakdown Before Submitting */}
              <div className="pt-4 border-t border-slate-200 space-y-4">
                <div className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-200 space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <div>
                      <span className="font-black text-slate-900 text-sm">{lang === "hi" ? "अनुमानित उचित पारिश्रमिक विवरण" : "Estimated Fair Payout Breakdown"}</span>
                      <div className="text-xs text-slate-500">{lang === "hi" ? "100% सीधे सफाई मित्र को जाता है" : "100% of this payout goes directly to the worker"}</div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-emerald-600">
                      ₹{livePricePreview.toFixed(0)}
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>{wasteType} Base Fair Price ({weight} kg):</span>
                      <strong className="text-slate-800">₹{livePriceCalculation.basePrice.toFixed(0)}</strong>
                    </div>
                    {urgency === "urgent" && (
                      <div className="flex justify-between text-amber-700">
                        <span>Urgent Dispatch Surcharge:</span>
                        <strong>+₹20</strong>
                      </div>
                    )}
                    {roundUpForHealth && (
                      <div className="flex justify-between text-rose-700">
                        <span>Suraksha Kawach Health Contribution:</span>
                        <strong>+₹10</strong>
                      </div>
                    )}
                    <div className="flex justify-between text-emerald-700 font-bold pt-1 border-t border-slate-200">
                      <span>Platform Commission Fee:</span>
                      <span>₹0 (0% Commission)</span>
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full bg-slate-900 hover:bg-emerald-700 text-white rounded-xl text-sm font-black h-12 shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  {lang === "hi" ? "AI विश्लेषण करें व उचित मूल्य तय करें" : "Analyze Waste & Compute Fair Price"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 2: AI Loading State */}
      {step === "analyzing" && (
        <div className="min-h-[45vh] flex flex-col items-center justify-center space-y-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center">
          <div className="relative">
            <div className="h-20 w-20 border-4 border-slate-100 rounded-full"></div>
            <div className="absolute top-0 left-0 h-20 w-20 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-7 w-7 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 mb-1">
              {lang === "hi" ? "ReCircle AI आपके कचरे का विश्लेषण कर रहा है..." : "ReCircle AI is assessing your upload..."}
            </h3>
            <p className="text-xs font-bold text-slate-600 max-w-md mx-auto">
              {lang === "hi" ? "सामग्री की पहचान और उचित मूल्य गणना जारी है..." : "Estimating material density, recyclable purity, and fair worker remuneration..."}
            </p>
          </div>
        </div>
      )}

      {/* Step 3: AI Results Review */}
      {step === "result" && (
        <div className="space-y-6">
          <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="h-7 w-7 text-emerald-600" />
              {isUsingGroq && (
                <Badge className="bg-orange-100 text-orange-900 border-orange-300 text-[10px] font-black tracking-wider uppercase">
                  ⚡ Powered by Groq LLaMA 3.2 Vision
                </Badge>
              )}
            </div>
            <h3 className="text-xl font-black text-emerald-950 mb-1">{lang === "hi" ? "AI विश्लेषण पूर्ण हुआ" : "AI Assessment Complete"}</h3>
            <p className="text-xs font-bold text-emerald-800">{lang === "hi" ? "हमने कचरे की पहचान कर ली है और न्यूनतम फेयर मूल्य तय किया है।" : "We've analyzed your waste, verified recyclable purity, and computed fair picker pay."}</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Card className="shadow-xs border-2 border-slate-200 rounded-2xl bg-white">
              <CardContent className="p-5">
                <div className="flex justify-between items-center mb-3">
                  <div className="text-xs font-black text-slate-900 uppercase tracking-wider">{lang === "hi" ? "पहचान परिणाम" : "Detection Results"}</div>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-300 font-bold text-[10px]">
                    {recyclabilityScore}% {lang === "hi" ? "रीसाइक्लेबल" : "Recyclable"}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {uploadedImage && (
                    <div className="h-28 w-full rounded-xl overflow-hidden bg-slate-100 mb-2 border border-slate-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={uploadedImage} alt="Analyzed waste" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div>
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">{lang === "hi" ? "सामग्री का प्रकार" : "Material Type"}</div>
                    <div className="font-black text-base text-slate-900">{detectedType}</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">{lang === "hi" ? "अनुमानित वजन" : "Estimated Weight"}</div>
                    <div className="font-black text-base text-slate-900">{weight} kg (~{Math.max(0.5, weight - 0.5)} kg - {weight + 1.5} kg)</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 text-white shadow-md border-0 rounded-2xl">
              <CardContent className="p-5 flex flex-col justify-between h-full">
                <div>
                  <div className="text-xs font-black text-slate-300 uppercase tracking-wider mb-2 flex justify-between items-center">
                    <span>{lang === "hi" ? "उचित बाजार मूल्य" : "Fair Guaranteed Price"}</span>
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-0 text-[10px] font-bold">{lang === "hi" ? "100% सफाई मित्र को" : "100% Direct to Worker"}</Badge>
                  </div>
                  <div className="text-4xl font-black text-emerald-400">₹{(priceBreakdown?.finalFairPrice || 0) + healthBonus}</div>
                  {roundUpForHealth && (
                    <div className="text-[11px] font-bold text-rose-300 mt-1 flex items-center gap-1">
                      <span>✓ ₹10 Health Pool Contribution Included</span>
                    </div>
                  )}
                </div>
                <div className="mt-4 text-xs font-medium text-slate-300 bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  {priceBreakdown?.explanation || "Calculated using benchmark floor rates with zero middleman exploitation."}
                </div>
              </CardContent>
            </Card>
          </div>

          <Button size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 rounded-xl text-sm font-black shadow-md" onClick={handleFindMatch}>
            {lang === "hi" ? "सफाई मित्र से मिलान करें" : "Find Available Match"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Step 4: Matched Screen with "Why This Picker" Fair-Match Explanation */}
      {step === "matched" && (
        <div className="py-2 space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-black text-slate-900">{lang === "hi" ? "सफाई मित्र से मिलान सफल!" : "It's a Fair Match!"}</h2>
            <p className="text-xs font-bold text-slate-600 max-w-lg mx-auto">
              {lang === "hi" ? "हमारे एंटी-मोनोपोली फेयर मैच एल्गोरिदम ने आपके लिए निकटतम सत्यापित सफाई मित्र चुना है।" : "Our Anti-Monopoly Fair Match Algorithm assigned your pickup based on proximity & income balance."}
            </p>
          </div>

          <Card className="overflow-hidden border-2 border-slate-200 shadow-md rounded-3xl bg-white max-w-lg mx-auto">
            <div className="bg-emerald-700 p-3.5 text-center text-white font-black text-xs flex items-center justify-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-300" />
              {lang === "hi" ? "सत्यापित रीसाइक्लिंग पार्टनर" : "Verified Recycler Partner"}
            </div>
            <CardContent className="p-6 space-y-5">
              
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-2xl font-black text-emerald-900 border-2 border-emerald-300 shrink-0">
                  {matchDetails?.pickerName?.charAt(0) || "S"}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-1.5">
                    {matchDetails?.pickerName || "Suresh (Picker)"}
                    <ShieldCheck className="h-4 w-4 text-blue-600" />
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-600">
                    <span className="flex items-center font-bold text-slate-800">
                      <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500 mr-1" />
                      4.8 / 5.0
                    </span>
                    <span>•</span>
                    <span className="font-bold text-amber-600">782 Karma Score</span>
                  </div>
                </div>
              </div>

              {/* WHY THIS PICKER EXPLANATION CARD */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                <div className="font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  {lang === "hi" ? "यह सफाई मित्र क्यों चुना गया? (Fair-Match Reason)" : "Why This Worker Was Matched:"}
                </div>
                <div className="space-y-1.5 text-slate-600 leading-relaxed text-[12px]">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span><strong>Fair Income Distribution:</strong> Suresh's daily earnings were below target (₹450/₹800), giving him priority under anti-monopoly fair-match rules.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span><strong>Proximity & Downhill Route:</strong> Located 0.4 km away on your ward's natural downhill transit route.</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">{lang === "hi" ? "दूरी" : "Distance"}</div>
                  <div className="font-black text-slate-900 text-base mt-0.5">0.4 km</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">{lang === "hi" ? "सीधा पारिश्रमिक" : "Guaranteed Payout"}</div>
                  <div className="font-black text-emerald-600 text-base mt-0.5">₹{(priceBreakdown?.finalFairPrice || 0) + healthBonus}</div>
                </div>
              </div>

              <Button onClick={handleFinalizePickup} className="w-full bg-slate-900 hover:bg-emerald-700 text-white rounded-xl text-xs font-black h-12 shadow-md">
                {lang === "hi" ? "पिकअप बुक करें व पुष्टि करें" : "Confirm & Schedule Pickup"}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}