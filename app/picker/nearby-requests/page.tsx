"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { usePlatformData } from "@/lib/platform-data-context";
import { MOCK_PICKERS, PickupRequest } from "@/lib/mock-data";
import { getDistance } from "@/lib/fair-match";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  MapPin, 
  Clock, 
  Scale, 
  Filter, 
  CheckCircle2, 
  Navigation, 
  Volume2, 
  MessageCircle,
  Map as MapIcon,
  List as ListIcon,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import WhatsAppSimulatorModal from "@/components/WhatsAppSimulatorModal";
import SOSFloatingButton from "@/components/SOSFloatingButton";
import { speakText, getPickupVoicePrompt, LanguageCode } from "@/lib/voice-assistant";

const PickerPickupMap = dynamic(() => import("@/components/PickerPickupMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[480px] w-full bg-slate-100 rounded-2xl flex items-center justify-center text-xs font-bold text-slate-500 border-2 border-slate-200">
      Loading OpenStreetMap Radar...
    </div>
  ),
});

export default function NearbyRequests() {
  const { user } = useAuth();
  const { lang, t, speak } = useLanguage();
  const { requests, acceptPickupRequest } = usePlatformData();

  const [viewMode, setViewMode] = useState<"list" | "map">("map");
  const [wasteTypeFilter, setWasteTypeFilter] = useState("all");
  const [distanceFilter, setDistanceFilter] = useState<number>(15); // Max km
  const [paymentFilter, setPaymentFilter] = useState<number>(0); // Min payment
  const [urgencyFilter, setUrgencyFilter] = useState("all");

  // WhatsApp Simulator Modal State
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [activeWhatsAppPickup, setActiveWhatsAppPickup] = useState<PickupRequest | null>(null);

  if (!user || user.role !== "picker") {
    return <div className="p-8 text-sm">Unauthorized. Please log in as a Waste-Picker.</div>;
  }

  const pickerProfile = MOCK_PICKERS.find(p => p.userId === user.id);
  const pickerLoc = pickerProfile?.currentLocation || { lat: 12.9352, lng: 77.6245 };

  const pendingRequests = requests.filter(r => r.status === "pending").map(req => {
    const dist = req.distanceKm !== undefined ? req.distanceKm : Math.round(getDistance(pickerLoc.lat, pickerLoc.lng, req.location?.lat || 12.935, req.location?.lng || 77.624) * 10) / 10;
    return { ...req, distanceKm: dist };
  });

  const filteredRequests = pendingRequests.filter(req => {
    if (wasteTypeFilter !== "all" && !req.wasteType.toLowerCase().includes(wasteTypeFilter.toLowerCase())) return false;
    if (req.distanceKm > distanceFilter) return false;
    if (req.estimatedPrice < paymentFilter) return false;
    if (urgencyFilter !== "all" && req.urgency !== urgencyFilter) return false;
    return true;
  }).sort((a, b) => a.distanceKm - b.distanceKm); // Closest first

  const acceptPickup = (id: string) => {
    const req = requests.find(r => r.id === id);
    if (req) {
      acceptPickupRequest(id, user.id, user.name);
      
      const successMsg = lang === "hi" 
        ? `पिकअप स्वीकार कर लिया गया! ₹${req.estimatedPrice.toFixed(0)} का काम आपके रूट में जुड़ गया है।`
        : lang === "kn"
        ? `ಪಿಕಪ್ ಸ್ವೀಕರಿಸಲಾಗಿದೆ! ₹${req.estimatedPrice.toFixed(0)} ಕೆಲಸ ನಿಮ್ಮ ಮಾರ್ಗಕ್ಕೆ ಸೇರಿದೆ.`
        : `Pickup accepted! ₹${req.estimatedPrice.toFixed(0)} job added to your downhill route.`;

      speak(successMsg);
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
    toast.info(lang === "hi" ? "🔊 ऑडियो विवरण चल रहा है..." : lang === "kn" ? "🔊 ವಿವರಣೆ ಪ್ಲೇ ಆಗುತ್ತಿದೆ..." : "🔊 Playing audio description...");
  };

  const openWhatsAppSimulator = (req: PickupRequest) => {
    setActiveWhatsAppPickup(req);
    setWhatsAppModalOpen(true);
  };

  const getWasteEmoji = (type: string) => {
    const l = (type || "").toLowerCase();
    if (l.includes("plastic")) return "🧴";
    if (l.includes("cardboard") || l.includes("paper")) return "📦";
    if (l.includes("metal") || l.includes("scrap")) return "🔩";
    if (l.includes("e-waste") || l.includes("electronic")) return "🔌";
    if (l.includes("glass")) return "🍾";
    return "♻️";
  };

  const resetFilters = () => {
    setWasteTypeFilter("all");
    setDistanceFilter(25);
    setPaymentFilter(0);
    setUrgencyFilter("all");
    toast.info(lang === "hi" ? "फ़िल्टर रीसेट किए गए" : "Filters reset");
  };

  return (
    <div className="space-y-6 pb-24 md:pb-16 max-w-6xl mx-auto">
      
      {/* Page Title & View Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Navigation className="h-6 w-6 text-emerald-600" />
            {t("radar.title")}
          </h2>
          <p className="text-sm text-slate-600 mt-0.5">{t("radar.subtitle")}</p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* List / Map View Toggle */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200 w-full sm:w-auto">
            <button
              onClick={() => setViewMode("map")}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all min-h-[40px] ${
                viewMode === "map"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <MapIcon className="h-4 w-4 text-emerald-400" />
              <span>{lang === "hi" ? "नक्शा (Map)" : lang === "kn" ? "ನಕ್ಷೆ (Map)" : "Map Radar"}</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all min-h-[40px] ${
                viewMode === "list"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ListIcon className="h-4 w-4 text-emerald-400" />
              <span>{lang === "hi" ? "सूची (List)" : lang === "kn" ? "ಪಟ್ಟಿ (List)" : "List View"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <Card className="bg-white shadow-xs border-slate-200 rounded-2xl">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-600" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">{t("radar.filterTitle")}</h3>
            </div>
            {(wasteTypeFilter !== "all" || distanceFilter !== 15 || paymentFilter !== 0 || urgencyFilter !== "all") && (
              <button onClick={resetFilters} className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1">
                <RefreshCw className="h-3 w-3" /> {lang === "hi" ? "फ़िल्टर हटाएं" : "Reset"}
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1.5 block uppercase tracking-wider">{t("radar.category")}</label>
              <select 
                className="flex h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
              <label className="text-xs font-bold text-slate-600 mb-1.5 block uppercase tracking-wider">
                {t("radar.maxDistance")}: {distanceFilter} km
              </label>
              <input 
                type="range" 
                min="1" 
                max="30" 
                value={distanceFilter} 
                onChange={(e) => setDistanceFilter(parseInt(e.target.value))}
                className="w-full h-10 accent-emerald-600 cursor-pointer"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1.5 block uppercase tracking-wider">{t("radar.minPayout")}</label>
              <Input 
                type="number" 
                min="0" 
                step="50" 
                value={paymentFilter || ""}
                onChange={(e) => setPaymentFilter(parseInt(e.target.value) || 0)}
                placeholder="₹0"
                className="rounded-xl h-11 text-xs font-bold text-slate-800"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1.5 block uppercase tracking-wider">{t("radar.urgency")}</label>
              <select 
                className="flex h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
              >
                <option value="all">{lang === "hi" ? "सभी प्राथमिकता" : "Any Urgency"}</option>
                <option value="normal">{lang === "hi" ? "सामान्य (Normal)" : "Normal"}</option>
                <option value="medium">{lang === "hi" ? "मध्यम (Medium)" : "Medium"}</option>
                <option value="high">{lang === "hi" ? "⚡ तत्काल (Urgent)" : "⚡ High / Urgent"}</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content: Map or List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center text-xs font-bold text-slate-600">
          <span>
            {lang === "hi" 
              ? `कुल ${filteredRequests.length} उपलब्ध पिकअप अनुरोध`
              : lang === "kn"
              ? `ಒಟ್ಟು ${filteredRequests.length} ಲಭ್ಯವಿರುವ ಪಿಕಪ್‌ಗಳು`
              : `Showing ${filteredRequests.length} available ${filteredRequests.length === 1 ? 'request' : 'requests'}`}
          </span>
          <span className="text-xs text-emerald-900 bg-emerald-100/90 px-3 py-1 rounded-full border border-emerald-300 font-bold">
            ✅ {t("badge.directWorker")}
          </span>
        </div>

        {/* Empty State */}
        {filteredRequests.length === 0 ? (
          <Card className="border-dashed border-2 rounded-3xl bg-white shadow-xs">
            <CardContent className="p-12 text-center flex flex-col items-center max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                <MapPin className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">{t("radar.noRequests")}</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                {lang === "hi" 
                  ? "वर्तमान फ़िल्टर के अनुसार कोई पिकअप नहीं मिला। दूरी का दायरा बढ़ाकर देखें या फ़िल्टर रीसेट करें।" 
                  : lang === "kn"
                  ? "ಈ ಫಿಲ್ಟರ್‌ಗಳಲ್ಲಿ ಯಾವುದೇ ಪಿಕಪ್ ಕಂಡುಬಂದಿಲ್ಲ. ದೂರದ ಮಿತಿಯನ್ನು ವಿಸ್ತರಿಸಿ."
                  : "No pickups match your current filters. Expand your distance range slider to explore more wards."}
              </p>
              <Button 
                onClick={resetFilters}
                className="mt-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold h-11 px-6"
              >
                {lang === "hi" ? "दूरी 25 किमी करें और सब दिखाएं" : "Expand to 25 km & View All"}
              </Button>
            </CardContent>
          </Card>
        ) : viewMode === "map" ? (
          <div className="space-y-4">
            <PickerPickupMap
              pickups={filteredRequests}
              pickerLocation={pickerLoc}
              onAcceptPickup={acceptPickup}
              height="500px"
            />
            
            {/* Quick summary below map */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredRequests.slice(0, 3).map(req => (
                <div key={req.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-slate-900 text-xs flex items-center gap-1">
                      <span>{getWasteEmoji(req.wasteType)}</span>
                      <span>{req.generatorName}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate max-w-[170px]">{req.address}</div>
                    <div className="text-xs font-black text-emerald-600 mt-1">₹{req.estimatedPrice.toFixed(0)} • ~{req.estimatedWeight}kg</div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => acceptPickup(req.id)}
                    className="bg-slate-900 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold min-h-[40px] shrink-0 px-3"
                  >
                    {t("dash.accept")}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* List View */
          <div className="grid lg:grid-cols-2 gap-4">
            {filteredRequests.map(req => (
              <Card key={req.id} className="hover:border-emerald-400 transition-all overflow-hidden flex flex-col shadow-xs border-slate-200 rounded-2xl bg-white">
                {req.urgency === "high" && (
                  <div className="bg-amber-500 text-slate-950 text-xs font-bold uppercase tracking-wider text-center py-1 flex items-center justify-center gap-1">
                    ⚡ {lang === "hi" ? "तत्काल पिकअप (+₹20 अतिरिक्त बोनस)" : lang === "kn" ? "ತ್ವರಿತ ಪಿಕಪ್ (+₹20 ಬೋನಸ್)" : "Urgent Pickup (+₹20 Bonus)"}
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
                          <div className="text-xs text-slate-600 mt-0.5">
                            {lang === "hi" ? "नागरिक:" : lang === "kn" ? "ನಾಗರಿಕ:" : "Generator:"} <strong className="text-slate-800">{req.generatorName}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-black text-emerald-600">₹{req.estimatedPrice.toFixed(0)}</div>
                        <Badge variant="outline" className="mt-1 border-emerald-300 text-emerald-900 bg-emerald-100/80 text-[10px] font-bold">
                          {t("badge.fairFloor")}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 my-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                        <div>
                          <div className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">{t("radar.distance")}</div>
                          <div className="text-xs font-bold text-slate-800">{req.distanceKm.toFixed(1)} km away</div>
                          <div className="text-xs text-slate-600 line-clamp-1">{req.address}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <Scale className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                        <div>
                          <div className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">{t("radar.estWeight")}</div>
                          <div className="text-xs font-bold text-slate-800">~{req.estimatedWeight} kg</div>
                          <div className="text-xs text-slate-500">{lang === "hi" ? "अलग रखा कचरा" : "Pre-sorted"}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2 col-span-2 pt-2 border-t border-slate-200">
                        <Clock className="h-3.5 w-3.5 text-amber-600 mt-0.5 shrink-0" />
                        <div>
                          <div className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">{t("radar.timeSlot")}</div>
                          <div className="text-xs font-bold text-slate-800">{req.preferredTime || (lang === "hi" ? "आज कभी भी" : "Anytime today")}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-2 mt-auto flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => openWhatsAppSimulator(req)}
                      className="border-emerald-300 text-emerald-800 hover:bg-emerald-50 gap-1.5 px-3 rounded-xl text-xs font-bold min-h-[44px]"
                    >
                      <MessageCircle className="h-4 w-4 text-emerald-600" />
                      WhatsApp
                    </Button>
                    <Button 
                      className="flex-1 bg-slate-900 hover:bg-emerald-700 text-white font-bold min-h-[44px] rounded-xl shadow-xs text-xs"
                      onClick={() => acceptPickup(req.id)}
                    >
                      <CheckCircle2 className="mr-1.5 h-4 w-4 text-emerald-400" />
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