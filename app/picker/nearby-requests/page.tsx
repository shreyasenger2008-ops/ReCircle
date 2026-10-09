"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { MOCK_REQUESTS, MOCK_PICKERS, PickupRequest } from "@/lib/mock-data";
import { getDistance } from "@/lib/fair-match";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MapPin, Clock, Scale, Filter, CheckCircle2, Navigation, Volume2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import WhatsAppSimulatorModal from "@/components/WhatsAppSimulatorModal";
import SOSFloatingButton from "@/components/SOSFloatingButton";
import { speakText, getPickupVoicePrompt, LanguageCode } from "@/lib/voice-assistant";

export default function NearbyRequests() {
  const { user } = useAuth();
  const { lang, t, speak } = useLanguage();

  const [wasteTypeFilter, setWasteTypeFilter] = useState("all");
  const [distanceFilter, setDistanceFilter] = useState<number>(15); // Max km
  const [paymentFilter, setPaymentFilter] = useState<number>(0); // Min payment
  const [urgencyFilter, setUrgencyFilter] = useState("all");

  // WhatsApp Simulator Modal State
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [activeWhatsAppPickup, setActiveWhatsAppPickup] = useState<PickupRequest | null>(null);

  if (!user || user.role !== "picker") {
    return <div className="p-8">Unauthorized. Please log in as a Waste-Picker.</div>;
  }

  const pickerProfile = MOCK_PICKERS.find(p => p.userId === user.id);
  const pickerLoc = pickerProfile?.currentLocation || { lat: 12.9716, lng: 77.5946 };

  const pendingRequests = MOCK_REQUESTS.filter(r => r.status === "pending").map(req => {
    const dist = getDistance(pickerLoc.lat, pickerLoc.lng, req.location.lat, req.location.lng);
    return { ...req, distanceKm: dist };
  });

  const filteredRequests = pendingRequests.filter(req => {
    if (wasteTypeFilter !== "all" && !req.wasteType.toLowerCase().includes(wasteTypeFilter.toLowerCase())) return false;
    if (req.distanceKm > distanceFilter) return false;
    if (req.estimatedPrice < paymentFilter) return false;
    if (urgencyFilter !== "all" && req.urgency !== urgencyFilter) return false;
    return true;
  }).sort((a, b) => a.distanceKm - b.distanceKm); // Sort by closest first

  const acceptPickup = (id: string) => {
    const req = MOCK_REQUESTS.find(r => r.id === id);
    if (req) {
      req.status = "accepted";
      req.matchedPickerId = user.id;
      req.pickerName = user.name;
      
      const successMsg = lang === "hi" 
        ? `पिकअप स्वीकार कर लिया गया! ₹${req.estimatedPrice.toFixed(0)} का काम आपके रूट में जुड़ गया है।`
        : `Pickup accepted! ₹${req.estimatedPrice.toFixed(0)} job added to your downhill route.`;

      speak(successMsg);
      toast.success(successMsg);
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
      earnings: req.estimatedPrice,
      distanceKm: req.distanceKm,
    }, langCode);

    speakText(prompt, langCode);
    toast.info(lang === "hi" ? "🔊 ऑडियो विवरण चल रहा है..." : "🔊 Playing audio description...");
  };

  const openWhatsAppSimulator = (req: PickupRequest) => {
    setActiveWhatsAppPickup(req);
    setWhatsAppModalOpen(true);
  };

  const getWasteEmoji = (type: string) => {
    const l = type.toLowerCase();
    if (l.includes("plastic")) return "🧴";
    if (l.includes("cardboard") || l.includes("paper")) return "📦";
    if (l.includes("metal") || l.includes("scrap")) return "🔩";
    if (l.includes("e-waste") || l.includes("electronic")) return "🔌";
    if (l.includes("glass")) return "🍾";
    return "♻️";
  };

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{t("radar.title")}</h2>
          <p className="text-sm text-slate-500 mt-0.5">{t("radar.subtitle")}</p>
        </div>
        <div className="bg-emerald-50 text-emerald-800 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center border border-emerald-200">
          <Navigation className="mr-2 h-4 w-4 text-emerald-600" />
          {lang === "hi" ? "सक्रिय क्षेत्र:" : "Active Zone:"} {pickerProfile?.serviceAreas.join(", ") || "Central Area"}
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-white shadow-xs border-slate-200 rounded-2xl">
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-4 w-4 text-slate-500" />
            <h3 className="font-bold text-sm text-slate-800">{t("radar.filterTitle")}</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">{t("radar.category")}</label>
              <select 
                className="flex h-10 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={wasteTypeFilter}
                onChange={(e) => setWasteTypeFilter(e.target.value)}
              >
                <option value="all">{t("radar.allRecyclables")}</option>
                <option value="Plastic">🧴 {t("radar.plastic")}</option>
                <option value="Cardboard">📦 {t("radar.cardboard")}</option>
                <option value="Metal">🔩 {t("radar.metal")}</option>
                <option value="Electronics">🔌 {t("radar.ewaste")}</option>
                <option value="Glass">🍾 {t("radar.glass")}</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">
                {t("radar.maxDistance")}: {distanceFilter} km
              </label>
              <input 
                type="range" 
                min="1" 
                max="30" 
                value={distanceFilter} 
                onChange={(e) => setDistanceFilter(parseInt(e.target.value))}
                className="w-full h-9 accent-emerald-600 cursor-pointer"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">{t("radar.minPayout")}</label>
              <Input 
                type="number" 
                min="0" 
                step="50" 
                value={paymentFilter || ""}
                onChange={(e) => setPaymentFilter(parseInt(e.target.value) || 0)}
                placeholder="₹0"
                className="rounded-xl h-10 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">{t("radar.urgency")}</label>
              <select 
                className="flex h-10 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
              >
                <option value="all">{lang === "hi" ? "सभी प्राथमिकता" : "Any Urgency"}</option>
                <option value="normal">{lang === "hi" ? "सामान्य (Normal)" : "Normal"}</option>
                <option value="medium">{lang === "hi" ? "मध्यम (Medium)" : "Medium"}</option>
                <option value="high">{lang === "hi" ? "⚡ आपातकालीन (Urgent)" : "⚡ High / Urgent"}</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex justify-between items-center text-xs font-medium text-slate-500">
          <span>
            {lang === "hi" 
              ? `कुल ${filteredRequests.length} उपलब्ध पिकअप अनुरोध`
              : `Showing ${filteredRequests.length} available ${filteredRequests.length === 1 ? 'request' : 'requests'}`}
          </span>
          <span className="text-xs text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 font-semibold">
            ✅ {t("badge.directWorker")}
          </span>
        </div>

        {filteredRequests.length === 0 ? (
          <Card className="border-dashed border-2 rounded-2xl bg-white">
            <CardContent className="p-12 text-center flex flex-col items-center">
              <MapPin className="h-10 w-10 text-slate-300 mb-3" />
              <h3 className="text-base font-bold text-slate-700">{t("radar.noRequests")}</h3>
              <p className="text-xs text-slate-500 mt-1">
                {lang === "hi" ? "दूरी का दायरा बढ़ाकर देखें या फ़िल्टर रीसेट करें।" : "Try expanding your distance slider to see more nearby pickups."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-2 gap-4">
            {filteredRequests.map(req => (
              <Card key={req.id} className="hover:border-emerald-400 transition-all overflow-hidden flex flex-col shadow-xs border-slate-200 rounded-2xl bg-white">
                {req.urgency === "high" && (
                  <div className="bg-amber-500 text-slate-950 text-[11px] font-bold uppercase tracking-wider text-center py-1 flex items-center justify-center gap-1">
                    ⚡ {lang === "hi" ? "तत्काल पिकअप (+₹20 अतिरिक्त बोनस)" : "Urgent Pickup (+₹20 Bonus)"}
                  </div>
                )}
                <CardContent className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-start gap-3">
                        <span className="text-3xl p-2 bg-slate-100 rounded-2xl shrink-0">
                          {getWasteEmoji(req.wasteType)}
                        </span>
                        <div>
                          <div className="font-bold text-base text-slate-900 flex items-center gap-2">
                            <span>{req.wasteType}</span>
                            <button
                              onClick={() => handleSpeakCard(req)}
                              className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-full border border-emerald-200 transition-colors"
                              title="बोलकर सुनें"
                            >
                              <Volume2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {lang === "hi" ? "नागरिक:" : "Generator:"} {req.generatorName}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-black text-emerald-600">₹{req.estimatedPrice.toFixed(0)}</div>
                        <Badge variant="outline" className="mt-1 border-emerald-200 text-emerald-800 bg-emerald-50 text-[10px] font-bold">
                          {t("badge.fairFloor")}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 my-3 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                        <div>
                          <div className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">{t("radar.distance")}</div>
                          <div className="text-xs font-bold text-slate-800">{req.distanceKm.toFixed(1)} km away</div>
                          <div className="text-[11px] text-slate-500 line-clamp-1">{req.address}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <Scale className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                        <div>
                          <div className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">{t("radar.estWeight")}</div>
                          <div className="text-xs font-bold text-slate-800">~{req.estimatedWeight} kg</div>
                          <div className="text-[10px] text-slate-400">{lang === "hi" ? "अलग रखा कचरा" : "Pre-sorted"}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2 col-span-2 pt-2 border-t border-slate-200/80">
                        <Clock className="h-3.5 w-3.5 text-amber-600 mt-0.5 shrink-0" />
                        <div>
                          <div className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">{t("radar.timeSlot")}</div>
                          <div className="text-xs font-medium text-slate-700">{req.preferredTime || (lang === "hi" ? "आज कभी भी" : "Anytime today")}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-2 mt-auto flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => openWhatsAppSimulator(req)}
                      className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 gap-1.5 px-3 rounded-xl text-xs font-semibold"
                    >
                      <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                      WhatsApp
                    </Button>
                    <Button 
                      className="flex-1 bg-slate-900 hover:bg-emerald-700 text-white font-bold h-10 rounded-xl shadow-xs text-xs"
                      onClick={() => acceptPickup(req.id)}
                    >
                      <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-emerald-400" />
                      {t("radar.acceptPickup")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* WhatsApp Modal */}
      {whatsAppModalOpen && activeWhatsAppPickup && (
        <WhatsAppSimulatorModal
          isOpen={whatsAppModalOpen}
          onClose={() => setWhatsAppModalOpen(false)}
          recipientName={user.name}
          pickupAddress={activeWhatsAppPickup.address}
          wasteType={activeWhatsAppPickup.wasteType}
          weightKg={activeWhatsAppPickup.estimatedWeight}
          amount={activeWhatsAppPickup.estimatedPrice}
          pickupId={activeWhatsAppPickup.id}
        />
      )}

      {/* Emergency SOS Floating Button */}
      <SOSFloatingButton />
    </div>
  );
}