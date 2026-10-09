"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { MOCK_REQUESTS, PickupRequest } from "@/lib/mock-data";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, UploadCloud, Sparkles, MapPin, Banknote, CalendarClock, Leaf, UserCheck, ShieldCheck, Star, Map, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { calculateFairPrice, FairPriceBreakdown } from "@/lib/fair-price";
import { findFairMatch, MatchScoreDetails } from "@/lib/fair-match";
import { MOCK_PICKERS, MOCK_USERS } from "@/lib/mock-data";

export default function SchedulePickup() {
  const { user } = useAuth();
  const router = useRouter();

  // Multi-step state
  const [step, setStep] = useState<"form" | "analyzing" | "result" | "matched">("form");

  // Form State
  const [wasteType, setWasteType] = useState("Mixed Recyclables");
  const [weight, setWeight] = useState(5);
  const [address, setAddress] = useState(user?.address || "");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [urgency, setUrgency] = useState("normal");
  const [sortingDifficulty, setSortingDifficulty] = useState("medium");
  const [notes, setNotes] = useState("");
  const [paymentMode, setPaymentMode] = useState("upi");
  
  // AI Mock Results
  const [detectedType, setDetectedType] = useState("");
  const [priceBreakdown, setPriceBreakdown] = useState<FairPriceBreakdown | null>(null);
  const [matchDetails, setMatchDetails] = useState<MatchScoreDetails | null>(null);

  if (!user || user.role !== "generator") {
    return <div>Unauthorized</div>;
  }

  // Pre-calculate fair price for live form preview
  const livePricePreview = calculateFairPrice(
    wasteType, 
    weight, 
    4.5, // Mock distance
    sortingDifficulty as 'low'|'medium'|'high', 
    urgency as 'normal'|'urgent'
  ).finalFairPrice;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("analyzing");
    
    // Simulate AI delay
    setTimeout(() => {
      const finalMaterialType = wasteType === "Mixed Recyclables" ? "Plastic & Cardboard (Mixed)" : wasteType;
      setDetectedType(finalMaterialType);
      
      const breakdown = calculateFairPrice(
        finalMaterialType,
        weight,
        4.5, // Mock distance
        sortingDifficulty as 'low'|'medium'|'high',
        urgency as 'normal'|'urgent'
      );
      
      setPriceBreakdown(breakdown);
      setStep("result");
    }, 2500);
  };

  const handleFindMatch = () => {
    // Determine the match using the algorithm
    const matchRequest: PickupRequest = {
      id: `req${Date.now()}`,
      generatorId: user.id,
      generatorName: user.name,
      status: "pending",
      items: [{ type: detectedType, weight }],
      wasteType: detectedType,
      estimatedWeight: weight,
      location: user.location || { lat: 12.9716, lng: 77.5946 },
      preferredTime: `${date} ${time}`,
      urgency: urgency as "low" | "medium" | "high",
      address,
      createdAt: new Date().toISOString(),
      estimatedPrice: priceBreakdown?.finalFairPrice || 0,
      payoutAmount: priceBreakdown?.finalFairPrice || 0,
    };

    const bestMatch = findFairMatch(matchRequest, MOCK_PICKERS, MOCK_USERS);
    
    if (bestMatch) {
      setMatchDetails(bestMatch);
    }
    
    setStep("matched");
  };

  const handleFinalizePickup = () => {
    if (!matchDetails) return;

    // Create actual mock request
    const newReq: PickupRequest = {
      id: `req${Date.now()}`,
      generatorId: user.id,
      generatorName: user.name,
      status: "accepted", // Auto-matched for demo
      items: [{ type: detectedType, weight }],
      wasteType: detectedType,
      estimatedWeight: weight,
      location: user.location || { lat: 12.9716, lng: 77.5946 },
      preferredTime: `${date} ${time}`,
      urgency: urgency as "low" | "medium" | "high",
      address,
      createdAt: new Date().toISOString(),
      estimatedPrice: priceBreakdown?.finalFairPrice || 0,
      payoutAmount: priceBreakdown?.finalFairPrice || 0,
      matchedPickerId: matchDetails.pickerId,
      pickerName: matchDetails.pickerName,
    };
    
    MOCK_REQUESTS.unshift(newReq);
    router.push("/generator/dashboard");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      
      {/* Header (visible in form & result steps) */}
      {(step === "form" || step === "result") && (
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 rounded-full"
            onClick={() => step === "result" ? setStep("form") : router.push("/generator/dashboard")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {step === "form" ? "Schedule a Pickup" : "AI Assessment"}
            </h2>
            <p className="text-slate-500">
              {step === "form" ? "Enter details for your waste pickup" : "Review our AI waste estimation"}
            </p>
          </div>
        </div>
      )}

      {/* Step 1: The Form */}
      {step === "form" && (
        <Card>
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleFormSubmit} className="space-y-8">
              
              {/* Image Upload */}
              <div className="space-y-2">
                <label className="text-sm font-semibold block">Upload Waste Image</label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-10 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer text-slate-500">
                  <UploadCloud className="h-10 w-10 mb-3 text-slate-400" />
                  <p className="text-sm font-medium">Click to upload or drag & drop</p>
                  <p className="text-xs mt-1">PNG, JPG, or HEIC (max. 10MB)</p>
                </div>
              </div>

              {/* Core Details */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-semibold mb-1 block">Waste Type</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                    value={wasteType}
                    onChange={(e) => setWasteType(e.target.value)}
                  >
                    <option value="Mixed Recyclables">Mixed Recyclables</option>
                    <option value="Plastic">Plastic</option>
                    <option value="Cardboard">Cardboard</option>
                    <option value="Glass">Glass</option>
                    <option value="Metal">Metal</option>
                    <option value="Electronics">E-Waste</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold mb-1 block">Estimated Weight (kg)</label>
                  <Input 
                    type="number" 
                    min="0.5" 
                    step="0.5" 
                    value={weight || ""}
                    onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
              </div>

              {/* Location & Time */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 border-b pb-1">Pickup Details</h3>
                <div>
                  <label className="text-sm font-medium mb-1 block">Pickup Address</label>
                  <Input value={address} onChange={(e) => setAddress(e.target.value)} required />
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Date</label>
                    <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Time Slot</label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      required
                    >
                      <option value="">Select time</option>
                      <option value="08:00 AM - 12:00 PM">Morning (8AM - 12PM)</option>
                      <option value="12:00 PM - 04:00 PM">Afternoon (12PM - 4PM)</option>
                      <option value="04:00 PM - 08:00 PM">Evening (4PM - 8PM)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Sorting & Urgency */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 border-b pb-1">Logistics & Fairness</h3>
                
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Sorting Difficulty</label>
                    <div className="flex gap-2">
                      {['low', 'medium', 'high'].map(lvl => (
                        <div 
                          key={lvl}
                          onClick={() => setSortingDifficulty(lvl)}
                          className={`flex-1 text-center py-2 px-3 border rounded-md cursor-pointer text-sm font-medium capitalize transition-colors ${sortingDifficulty === lvl ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
                        >
                          {lvl}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Urgency</label>
                    <div className="flex gap-2">
                      {['normal', 'urgent'].map(urg => (
                        <div 
                          key={urg}
                          onClick={() => setUrgency(urg)}
                          className={`flex-1 text-center py-2 px-3 border rounded-md cursor-pointer text-sm font-medium capitalize transition-colors ${urgency === urg ? (urg === 'urgent' ? 'bg-red-500 text-white border-red-500' : 'bg-blue-500 text-white border-blue-500') : 'bg-white text-slate-700 hover:bg-slate-50'}`}
                        >
                          {urg}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Payment Mode</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="radio" name="payment" value="upi" checked={paymentMode === "upi"} onChange={(e) => setPaymentMode(e.target.value)} />
                      UPI (Preferred)
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="radio" name="payment" value="cash" checked={paymentMode === "cash"} onChange={(e) => setPaymentMode(e.target.value)} />
                      Cash
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Additional Notes for Picker</label>
                  <textarea 
                    className="flex min-h-[80px] w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                    placeholder="E.g., Call upon arrival, items are in the basement..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="bg-slate-50 p-4 rounded-lg flex justify-between items-center mb-6 border border-slate-200">
                  <div>
                    <div className="font-semibold text-slate-900">Estimated Fair Price</div>
                    <div className="text-sm text-slate-500">100% of this goes to the waste-picker</div>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    ₹{livePricePreview.toFixed(0)}
                  </div>
                </div>
                <Button type="submit" size="lg" className="w-full bg-slate-900 hover:bg-slate-800">
                  <Sparkles className="mr-2 h-4 w-4 text-yellow-400" />
                  Analyze Waste & Estimate Price
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 2: AI Loading State */}
      {step === "analyzing" && (
        <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-6">
          <div className="relative">
            <div className="h-24 w-24 border-4 border-slate-100 rounded-full"></div>
            <div className="absolute top-0 left-0 h-24 w-24 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-green-500" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-slate-900 mb-2">ReCircle AI is analyzing your upload...</h3>
            <div className="text-sm text-slate-500 space-y-1">
              <p className="animate-pulse">Identifying material types...</p>
              <p className="animate-pulse delay-75">Estimating volume and weight...</p>
              <p className="animate-pulse delay-150">Calculating fair worker compensation...</p>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: AI Results */}
      {step === "result" && (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <Sparkles className="h-10 w-10 text-green-500 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-green-900 mb-1">Analysis Complete</h3>
            <p className="text-green-700">We've identified your waste and calculated a fair market price.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-sm font-medium text-slate-500 mb-4">Detection Results</div>
                <div className="space-y-4">
                  <div>
                    <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Material Type</div>
                    <div className="font-semibold text-lg">{detectedType}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Estimated Weight</div>
                    <div className="font-semibold text-lg">{Math.max(0.5, weight - 0.5)} kg - {weight + 1.5} kg</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 text-white">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <div>
                  <div className="text-sm font-medium text-slate-400 mb-4 flex justify-between items-center">
                    Fair Market Price
                    <Badge variant="success" className="bg-green-500/20 text-green-400 border-none">100% to picker</Badge>
                  </div>
                  <div className="text-4xl font-bold text-green-400">₹{priceBreakdown?.finalFairPrice.toFixed(0)}</div>
                </div>
                <div className="mt-4 text-xs text-slate-400">
                  {priceBreakdown?.explanation}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-blue-100 bg-blue-50/50">
            <CardContent className="p-5 flex gap-4">
              <Leaf className="h-6 w-6 text-blue-600 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Sorting Instructions</h4>
                <p className="text-sm text-blue-800">
                  Since you marked sorting difficulty as <strong>{sortingDifficulty}</strong>, please ensure any wet waste is strictly separated from the {wasteType.toLowerCase()} to prevent contamination and maintain the fair wage value for the waste-picker.
                </p>
              </div>
            </CardContent>
          </Card>

          <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 h-14 text-lg" onClick={handleFindMatch}>
            Find Available Match
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Step 4: Matched Screen */}
      {step === "matched" && (
        <div className="py-2 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-extrabold text-slate-900">It's a Match!</h2>
            <p className="text-slate-500 max-w-lg mx-auto">
              Our Fair Match Algorithm connected you with the best available waste-picker.
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-6">
            {/* Picker Profile Column */}
            <div className="md:col-span-2 space-y-4">
              <Card className="overflow-hidden border-green-200 shadow-md h-full">
                <div className="bg-green-600 p-4 text-center text-white">
                  <div className="font-medium text-green-100 text-sm mb-1">Your Pickup Partner</div>
                </div>
                <CardContent className="p-6 text-center space-y-4">
                  <div className="h-24 w-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto shadow-inner text-2xl font-bold text-slate-400 border-4 border-white">
                    {matchDetails?.pickerName?.charAt(0) || "P"}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 flex items-center justify-center gap-2">
                      {matchDetails?.pickerName || "Searching..."}
                      {matchDetails?.verificationStatus === "verified" && (
                        <ShieldCheck className="h-5 w-5 text-blue-500" title="Verified Background" />
                      )}
                    </h3>
                    <div className="flex items-center justify-center mt-1 text-slate-500 text-sm">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                      {matchDetails?.rating.toFixed(1)} / 5.0 Rating
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-4 border-t">
                    <div className="bg-slate-50 p-2 rounded-md">
                      <div className="text-xs text-slate-400 uppercase">Distance</div>
                      <div className="font-semibold text-slate-700 flex items-center justify-center gap-1">
                        <Map className="h-3 w-3" />
                        {matchDetails?.distanceKm.toFixed(1)} km
                      </div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-md">
                      <div className="text-xs text-slate-400 uppercase">ETA</div>
                      <div className="font-semibold text-slate-700 flex items-center justify-center gap-1">
                        <CalendarClock className="h-3 w-3" />
                        {Math.max(5, Math.round((matchDetails?.distanceKm || 0) * 8))} mins
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Fair Match Score Breakdown Column */}
            <div className="md:col-span-3 space-y-4">
              <Card className="h-full">
                <CardHeader className="pb-3 border-b">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Fair Match Score</CardTitle>
                    <div className="text-2xl font-black text-green-600">
                      {matchDetails?.finalFairMatchScore.toFixed(0)}<span className="text-sm text-slate-400">/100</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  
                  {/* Explanation box */}
                  <div className="bg-green-50 p-4 rounded-lg border border-green-100 text-sm text-green-900 leading-relaxed">
                    <strong>Algorithm Explanation:</strong> {matchDetails?.explanation}
                  </div>

                  {/* Breakdown bars */}
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-slate-700 mb-1">Score Breakdown</div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Income Balancing (20%)</span>
                        <span className="font-medium">{matchDetails?.incomeBalanceScore.toFixed(0)}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: `${matchDetails?.incomeBalanceScore}%` }}></div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Expertise / Wage Alignment (25%)</span>
                        <span className="font-medium">{matchDetails?.wageScore.toFixed(0)}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500" style={{ width: `${matchDetails?.wageScore}%` }}></div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Proximity (25%)</span>
                        <span className="font-medium">{matchDetails?.distanceScore.toFixed(0)}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-500" style={{ width: `${matchDetails?.distanceScore}%` }}></div>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Reliability & Trust (15%)</span>
                        <span className="font-medium">{matchDetails?.reliabilityScore.toFixed(0)}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-500" style={{ width: `${matchDetails?.reliabilityScore}%` }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <Card className="border-slate-200 shadow-sm bg-slate-900 text-white">
            <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <div className="text-slate-400 text-sm mb-1">Estimated Fair Payment</div>
                <div className="text-2xl font-bold flex items-center gap-2">
                  ₹{priceBreakdown?.finalFairPrice.toFixed(0)} 
                  <Badge variant="outline" className="border-slate-600 text-slate-300 font-normal">
                    {paymentMode.toUpperCase()}
                  </Badge>
                </div>
              </div>
              <Button size="lg" className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white text-lg px-8 h-14" onClick={handleFinalizePickup}>
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Confirm Pickup
              </Button>
            </CardContent>
          </Card>

        </div>
      )}

    </div>
  );
}