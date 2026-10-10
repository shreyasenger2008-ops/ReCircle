"use client";

import { useState } from "react";
import { User, PickupRequest } from "@/lib/mock-data";
import { useLanguage } from "@/lib/language-context";
import { usePlatformData } from "@/lib/platform-data-context";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  MapPin, 
  Scale, 
  Clock, 
  Banknote, 
  User as UserIcon, 
  Truck, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Camera,
  Upload,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Navigation
} from "lucide-react";
import { toast } from "sonner";
import ReceiptModal from "./ReceiptModal";
import { formatCurrency, formatStatus } from "@/lib/formatters";

type Props = {
  user: User;
};

type TabType = "upcoming" | "ongoing" | "completed" | "cancelled" | "disputed";

export default function MyPickupsList({ user }: Props) {
  const { lang, t, speak } = useLanguage();
  const { requests, startPickupRoute, confirmPickupWeighed, cancelPickup } = usePlatformData();
  const [activeTab, setActiveTab] = useState<TabType>("ongoing");
  
  // Modal State for Completion
  const [completionModalOpen, setCompletionModalOpen] = useState(false);
  const [activePickupForCompletion, setActivePickupForCompletion] = useState<PickupRequest | null>(null);
  const [finalWeight, setFinalWeight] = useState<number>(12);
  const [scalePhotoUrl, setScalePhotoUrl] = useState<string | null>(null);
  const [paymentConfirmed, setPaymentConfirmed] = useState(true);

  // Cancel Confirmation Modal State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [activeCancelPickup, setActiveCancelPickup] = useState<PickupRequest | null>(null);

  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<PickupRequest | null>(null);

  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [activeDisputePickup, setActiveDisputePickup] = useState<PickupRequest | null>(null);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeDesc, setDisputeDesc] = useState("");

  const isPicker = user.role === "picker";

  const myRequests = requests.filter(r => 
    isPicker ? (r.matchedPickerId === user.id || r.pickerName === user.name) : r.generatorId === user.id
  );

  const getFilteredRequests = (tab: TabType) => {
    switch (tab) {
      case "upcoming": return myRequests.filter(r => r.status === "pending" || r.status === "accepted");
      case "ongoing": return myRequests.filter(r => r.status === "accepted" || r.status === "on_the_way" || r.status === "picked_up");
      case "completed": return myRequests.filter(r => r.status === "completed");
      case "cancelled": return myRequests.filter(r => r.status === "cancelled");
      case "disputed": return myRequests.filter(r => r.status === "disputed");
      default: return [];
    }
  };

  const filteredRequests = getFilteredRequests(activeTab);

  const handleStartTrip = (id: string) => {
    startPickupRoute(id);
    const msg = lang === "hi" 
      ? "सफर शुरू हुआ! नागरिक को सूचना भेज दी गई है।" 
      : lang === "kn"
      ? "ಪ್ರಯಾಣ ಆರಂಭವಾಗಿದೆ! ಗ್ರಾಹಕರಿಗೆ ಮಾಹಿತಿ ರವಾನಿಸಲಾಗಿದೆ."
      : "Trip started! Generator notified.";
    speak(msg);
  };

  const handleMarkArrived = (id: string) => {
    const targetReq = requests.find(r => r.id === id) || filteredRequests.find(r => r.id === id);
    if (targetReq) {
      openCompletionModal(targetReq);
    } else {
      startPickupRoute(id);
    }
  };

  const openCompletionModal = (req: PickupRequest) => {
    setActivePickupForCompletion(req);
    setFinalWeight(req.estimatedWeight || 12);
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
    if (!activePickupForCompletion) return;
    if (!paymentConfirmed) {
      toast.error(lang === "hi" ? "कृपया काम पूरा करने के लिए भुगतान की पुष्टि करें।" : "Please confirm payment release.");
      return;
    }

    const weightRatio = Number(finalWeight) / (activePickupForCompletion.estimatedWeight || 1);
    const calcPrice = Math.round((activePickupForCompletion.estimatedPrice || activePickupForCompletion.payoutAmount || 150) * weightRatio);
    
    confirmPickupWeighed(activePickupForCompletion.id, Number(finalWeight), calcPrice);

    const msg = lang === "hi" 
      ? `पिकअप पूरा हुआ! ₹${calcPrice} का भुगतान सीधे आपके UPI खाते में जमा कर दिया गया है।` 
      : lang === "kn"
      ? `ಪಿಕಪ್ ಪೂರ್ಣಗೊಂಡಿದೆ! ₹${calcPrice} ಯುಪಿಐಗೆ ಜಮೆಯಾಗಿದೆ.`
      : `Pickup completed! ₹${calcPrice} transferred instantly to your UPI account.`;
    speak(msg);
    setCompletionModalOpen(false);
  };

  const promptCancel = (req: PickupRequest) => {
    setActiveCancelPickup(req);
    setCancelModalOpen(true);
  };

  const confirmCancel = () => {
    if (activeCancelPickup) {
      cancelPickup(activeCancelPickup.id, "Cancelled by picker");
      setCancelModalOpen(false);
    }
  };

  const openReceipt = (req: PickupRequest) => {
    setActiveReceipt(req);
    setReceiptModalOpen(true);
  };

  const openDisputeModal = (req: PickupRequest) => {
    setActiveDisputePickup(req);
    setDisputeReason("");
    setDisputeDesc("");
    setDisputeModalOpen(true);
  };

  const handleSubmitDispute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDisputePickup) return;
    
    import("@/lib/mock-data").then(({ MOCK_DISPUTES }) => {
      MOCK_DISPUTES.push({
        id: `d${Date.now()}`,
        pickupId: activeDisputePickup.id,
        raisedBy: user.id,
        generatorName: activeDisputePickup.generatorName || user.name,
        reason: disputeReason,
        description: disputeDesc,
        status: "open",
        createdAt: new Date().toISOString()
      });
      activeDisputePickup.status = "disputed";
      const msg = lang === "hi" ? "शिकायत सफलतापूर्वक एडमिन टीम को भेज दी गई।" : "Dispute submitted successfully to the Admin team.";
      toast.success(msg);
      setDisputeModalOpen(false);
    });
  };

  const tabs: { id: TabType, label: string, icon: any }[] = [
    { id: "ongoing", label: lang === "hi" ? "प्रगति पर (Active)" : lang === "kn" ? "ಸಕ್ರಿಯ ಕೆಲಸಗಳು" : "Active Jobs", icon: Truck },
    { id: "completed", label: lang === "hi" ? "पूरे हुए (Completed)" : lang === "kn" ? "ಪೂರ್ಣಗೊಂಡಿದೆ" : "Completed", icon: CheckCircle },
    { id: "cancelled", label: lang === "hi" ? "रद्द (Cancelled)" : lang === "kn" ? "ರದ್ದುಗೊಂಡಿದೆ" : "Cancelled", icon: XCircle },
    { id: "disputed", label: lang === "hi" ? "विवादित (Disputed)" : lang === "kn" ? "ವಿವಾದಿತ" : "Disputed", icon: AlertTriangle },
  ];

  // Estimated unit rate per kg
  const estimatedUnitPrice = activePickupForCompletion 
    ? Math.round(((activePickupForCompletion.estimatedPrice || 150) / (activePickupForCompletion.estimatedWeight || 10)) * 10) / 10 
    : 14.5;
  const calculatedPayout = Math.round(Number(finalWeight || 0) * estimatedUnitPrice);

  return (
    <div className="space-y-6 pb-24 md:pb-16 relative">
      
      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2 hide-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap text-xs font-bold transition-all min-h-[44px] ${
              activeTab === tab.id 
                ? "bg-slate-900 text-white shadow-xs" 
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? 'text-emerald-400' : 'text-slate-500'}`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <Card className="border-dashed border-2 rounded-2xl bg-white">
            <CardContent className="p-12 text-center text-slate-600 text-xs font-medium">
              {lang === "hi" ? `कोई ${activeTab} पिकअप नहीं मिला।` : `No ${activeTab} pickups found.`}
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map(req => {
            const isAccepted = req.status === "accepted";
            const isOnTheWay = req.status === "on_the_way";
            const isPickedUp = req.status === "picked_up";

            return (
              <Card key={req.id} className="overflow-hidden border-slate-200 rounded-2xl bg-white shadow-xs border-l-4 border-l-emerald-600">
                <CardContent className="p-0">
                  <div className="bg-slate-50 border-b border-slate-100 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        req.status === 'completed' ? 'success' : 
                        req.status === 'disputed' ? 'destructive' : 
                        req.status === 'cancelled' ? 'secondary' : 'default'
                      } className="uppercase tracking-wider text-[11px] font-bold rounded-lg px-2.5 py-1">
                        {formatStatus(req.status)}
                      </Badge>
                      <span className="text-sm font-bold text-slate-900">{req.wasteType}</span>
                    </div>
                    <div className="text-2xl font-black text-emerald-700">
                      {formatCurrency(req.finalPrice || req.estimatedPrice || 0)}
                    </div>
                  </div>

                  <div className="p-5 grid sm:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <UserIcon className="h-4 w-4 text-slate-400 mt-0.5" />
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{lang === "hi" ? "पक्षकार" : "Parties"}</div>
                          <div className="text-xs">
                            <span className="font-medium text-slate-600">{lang === "hi" ? "नागरिक:" : "Generator:"}</span> <strong className="text-slate-900 font-bold">{req.generatorName}</strong>
                          </div>
                          <div className="text-xs">
                            <span className="font-medium text-slate-600">{lang === "hi" ? "सफाई मित्र:" : "Picker:"}</span> <strong className="text-slate-900 font-bold">{req.pickerName || (lang === "hi" ? "असाइन नहीं हुआ" : "Not assigned yet")}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{lang === "hi" ? "पता व समय" : "Address & Time"}</div>
                          <div className="text-xs font-bold text-slate-900">{req.address}</div>
                          <div className="text-xs text-slate-600">{req.preferredTime || "10:00 AM - 12:00 PM"}</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Scale className="h-4 w-4 text-slate-400 mt-0.5" />
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{lang === "hi" ? "वजन (Weight)" : "Weight"}</div>
                          <div className="text-xs">
                            <span className="text-slate-600">{lang === "hi" ? "अनुमानित:" : "Estimated:"}</span> <strong className="text-slate-900 font-bold">{req.estimatedWeight} kg</strong>
                          </div>
                          {req.finalWeight && (
                            <div className="text-xs">
                              <span className="text-slate-600">{lang === "hi" ? "अंतिम वजन:" : "Final:"}</span> <strong className="text-emerald-700 font-bold">{req.finalWeight} kg</strong>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Banknote className="h-4 w-4 text-slate-400 mt-0.5" />
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{lang === "hi" ? "भुगतान स्थिति" : "Payment Status"}</div>
                          <div className="text-xs font-bold text-slate-900">
                            {req.status === 'completed' 
                              ? (lang === "hi" ? `भुगतान हो चुका (${req.paymentMode?.toUpperCase() || 'UPI'})` : `Paid (${req.paymentMode?.toUpperCase() || 'UPI'})`)
                              : (lang === "hi" ? "कार्य पूर्ण होने पर तुरंत UPI" : "Instant UPI on Completion")}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Shared Action for completed */}
                  {req.status === "completed" && (
                    <div className="bg-slate-50 p-4 border-t border-slate-100 flex flex-wrap gap-2 justify-between items-center">
                      {!isPicker && (
                        <Button size="sm" variant="ghost" className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs rounded-xl" onClick={() => openDisputeModal(req)}>
                          <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
                          {t("btn.dispute")}
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="ml-auto rounded-xl text-xs font-bold min-h-[40px]" onClick={() => openReceipt(req)}>
                        {t("btn.viewReceipt")}
                      </Button>
                    </div>
                  )}

                  {/* Waste-Picker Actions: EXACTLY ONE PRIMARY ACTION + Subtle Cancel Link */}
                  {isPicker && req.status !== "completed" && req.status !== "cancelled" && req.status !== "disputed" && (
                    <div className="bg-slate-50 p-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3">
                      
                      {/* SINGLE PRIMARY ACTION */}
                      <div className="w-full sm:w-auto flex-1">
                        {isAccepted && (
                          <Button 
                            onClick={() => handleStartTrip(req.id)}
                            className="w-full sm:w-auto min-h-[48px] px-6 bg-slate-900 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-2"
                          >
                            <Navigation className="h-4 w-4 text-emerald-400" />
                            {lang === "hi" ? "1. रास्ते पर निकलें (Start Trip)" : lang === "kn" ? "1. ಪ್ರಯಾಣ ಆರಂಭಿಸಿ" : "1. Start Trip"}
                          </Button>
                        )}

                        {isOnTheWay && (
                          <Button 
                            onClick={() => openCompletionModal(req)}
                            className="w-full sm:w-auto min-h-[48px] px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-2"
                          >
                            <Scale className="h-4 w-4" />
                            {lang === "hi" ? "2. पहुंच गए - वजन व भुगतान करें" : lang === "kn" ? "2. ತಲುಪಿದೆವು - ತೂಕ & ಪಾವತಿ" : "2. Arrived - Weigh & Complete"}
                          </Button>
                        )}

                        {isPickedUp && (
                          <Button 
                            onClick={() => openCompletionModal(req)}
                            className="w-full sm:w-auto min-h-[48px] px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-2"
                          >
                            <CheckCircle2 className="h-4 w-4 text-white" />
                            {lang === "hi" ? "3. वजन व फोटो दर्ज करें (Complete)" : lang === "kn" ? "3. ತೂಕ & ಫೋಟೋ ನಮೂದಿಸಿ" : "3. Complete & Confirm Weight"}
                          </Button>
                        )}
                      </div>

                      {/* SUBTLE CANCEL TEXT LINK WITH CONFIRM DIALOG */}
                      <button 
                        onClick={() => promptCancel(req)}
                        className="text-xs text-slate-500 hover:text-rose-600 font-semibold underline p-2 transition-colors"
                      >
                        {lang === "hi" ? "पिकअप रद्द करें" : lang === "kn" ? "ಪಿಕಪ್ ರದ್ದುಮಾಡಿ" : "Cancel pickup"}
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Enhanced Completion Modal: Weight + Scale Photo + Payout Breakdown */}
      {completionModalOpen && activePickupForCompletion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <Card className="w-full max-w-lg shadow-2xl rounded-3xl bg-white border-2 border-emerald-500 max-h-[90vh] overflow-y-auto">
            <div className="p-5 pb-3 border-b bg-emerald-50/50 flex justify-between items-center">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {lang === "hi" ? "पिकअप पूर्ण करें एवं वजन पुष्टि" : "Complete & Confirm Weight"}
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  {activePickupForCompletion.generatorName} • {activePickupForCompletion.wasteType}
                </p>
              </div>
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-xs font-bold">
                Step 3 of 3
              </Badge>
            </div>

            <CardContent className="p-5 space-y-4">
              <form onSubmit={handleCompletePickup} className="space-y-4">
                
                {/* 1. Final Weight Input */}
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 block">
                    {lang === "hi" ? "1. वास्तविक तोला गया वजन (kg)" : "1. Actual Weighed Scale Weight (kg)"}
                  </label>
                  <div className="flex items-center gap-3">
                    <Input 
                      type="number" 
                      min="0.1" 
                      step="0.1" 
                      value={finalWeight} 
                      onChange={(e) => setFinalWeight(parseFloat(e.target.value) || 0)} 
                      required 
                      className="rounded-xl font-black text-lg h-12 flex-1"
                    />
                    <div className="bg-slate-100 px-4 py-3 rounded-xl text-xs font-bold text-slate-700">
                      Est: {activePickupForCompletion.estimatedWeight} kg
                    </div>
                  </div>
                </div>
                
                {/* 2. Photo Upload of Weighing Scale */}
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 block">
                    {lang === "hi" ? "2. तराजू की फोटो (Scale Photo Verification)" : "2. Weighing Scale Photo Proof"}
                  </label>
                  
                  {scalePhotoUrl ? (
                    <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500 bg-slate-900">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={scalePhotoUrl} 
                        alt="Scale scale photo preview" 
                        className="w-full h-40 object-cover" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3 justify-between">
                        <span className="text-xs text-emerald-300 font-bold flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-emerald-400" />
                          {lang === "hi" ? "फोटो सत्यापित" : "Photo Captured"}
                        </span>
                        <Button 
                          type="button" 
                          size="sm" 
                          variant="outline" 
                          onClick={handleSimulatePhotoUpload}
                          className="h-8 text-[11px] bg-white text-slate-900 font-bold rounded-lg"
                        >
                          {lang === "hi" ? "पुनः फोटो लें" : "Retake"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center bg-slate-50 hover:bg-slate-100 transition-colors">
                      <Camera className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-700">
                        {lang === "hi" ? "तराजू पर वजन दिखाते हुए फोटो लें" : "Take a clear photo showing the scale reading"}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5 mb-3">
                        {lang === "hi" ? "नागरिक के ऐप में तुरंत पुष्टि हेतु दिखाई देगी" : "Shown to generator for instant 1-tap confirmation"}
                      </p>
                      <Button
                        type="button"
                        onClick={handleSimulatePhotoUpload}
                        className="bg-slate-900 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold h-10 px-4 gap-1.5"
                      >
                        <Upload className="h-4 w-4" />
                        {lang === "hi" ? "कैमरा खोलें व फोटो लें" : "Open Camera / Upload Photo"}
                      </Button>
                    </div>
                  )}
                </div>

                {/* 3. Payout Breakdown */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>{lang === "hi" ? "भुगतान का विवरण" : "Final Payout Breakdown"}</span>
                    <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-800 border-emerald-300">
                      0% Platform Cut
                    </Badge>
                  </div>

                  <div className="flex justify-between text-xs text-slate-600">
                    <span>{lang === "hi" ? "मूल दर (Base Rate):" : "Base Material Rate:"}</span>
                    <strong className="text-slate-800">₹{estimatedUnitPrice}/kg</strong>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>{lang === "hi" ? "तोला गया वजन:" : "Weighed Weight:"}</span>
                    <strong className="text-slate-800">{finalWeight} kg</strong>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>{lang === "hi" ? "प्लेटफ़ॉर्म कमीशन:" : "Platform Commission:"}</span>
                    <strong className="text-emerald-700 font-bold">₹0 (Free)</strong>
                  </div>

                  <div className="border-t border-slate-200 pt-2 flex justify-between items-center">
                    <span className="font-black text-slate-900 text-sm">{lang === "hi" ? "कुल प्राप्त राशि (UPI):" : "Net Payout to Bank:"}</span>
                    <span className="font-black text-2xl text-emerald-700">₹{calculatedPayout}</span>
                  </div>
                </div>

                {/* 4. Instant UPI Settlement Checkbox */}
                <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-300">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="mt-1 h-4 w-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500" 
                      checked={paymentConfirmed}
                      onChange={(e) => setPaymentConfirmed(e.target.checked)}
                    />
                    <div>
                      <div className="text-xs font-black text-emerald-950">
                        {lang === "hi" ? "सत्यापन एवं प्रत्यक्ष UPI भुगतान" : "Confirm Weight & Direct Payout"}
                      </div>
                      <div className="text-[11px] text-emerald-800 leading-snug">
                        {lang === "hi" 
                          ? "नागरिक के ऐप में फोटो भेजी जाएगी। राशि तुरंत आपके UPI खाते में जमा होगी।"
                          : "Photo sent to generator app. ₹" + calculatedPayout + " will be released to your registered UPI."}
                      </div>
                    </div>
                  </label>
                </div>

                <div className="pt-2 flex gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1 rounded-xl text-xs font-bold min-h-[48px]" 
                    onClick={() => setCompletionModalOpen(false)}
                  >
                    {t("btn.cancel")}
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black min-h-[48px] shadow-lg"
                  >
                    {lang === "hi" ? "कार्य समाप्त करें (Finish)" : "Finish & Release Payout"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      {cancelModalOpen && activeCancelPickup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <Card className="w-full max-w-sm shadow-2xl rounded-3xl bg-white p-5 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 bg-rose-100 rounded-xl">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-900">{lang === "hi" ? "पिकअप रद्द करें?" : "Cancel this Pickup?"}</h4>
                <p className="text-xs text-slate-500">{activeCancelPickup.generatorName}</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {lang === "hi"
                ? "क्या आप निश्चित रूप से यह कार्य रद्द करना चाहते हैं? बार-बार रद्द करने से आपके कर्मा स्कोर पर प्रभाव पड़ सकता है।"
                : "Are you sure you want to cancel? Frequent cancellations may slightly lower your fair-match priority score."}
            </p>
            <div className="flex gap-2 pt-2">
              <Button 
                variant="outline" 
                onClick={() => setCancelModalOpen(false)} 
                className="flex-1 rounded-xl text-xs font-bold min-h-[44px]"
              >
                {lang === "hi" ? "नहीं, जारी रखें" : "Keep Job"}
              </Button>
              <Button 
                onClick={confirmCancel} 
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold min-h-[44px]"
              >
                {lang === "hi" ? "हाँ, रद्द करें" : "Yes, Cancel"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Dispute Modal */}
      {disputeModalOpen && activeDisputePickup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <Card className="w-full max-w-md shadow-2xl rounded-3xl bg-white">
            <div className="bg-rose-50 border-b border-rose-100 p-5 flex justify-between items-center">
              <div className="text-rose-900 flex items-center gap-2 text-base font-bold">
                <AlertTriangle className="h-5 w-5 text-rose-600" />
                {t("btn.dispute")}
              </div>
            </div>
            <CardContent className="p-5">
              <form onSubmit={handleSubmitDispute} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">
                    {lang === "hi" ? "विवाद का कारण" : "Reason for Dispute"}
                  </label>
                  <select 
                    className="flex h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-400"
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    required
                  >
                    <option value="">{lang === "hi" ? "कारण चुनें..." : "Select a reason..."}</option>
                    <option value="Wrong weight">{lang === "hi" ? "गलत वजन (Wrong weight)" : "Wrong weight"}</option>
                    <option value="Payment not received">{lang === "hi" ? "भुगतान नहीं मिला (Payment not received)" : "Payment not received"}</option>
                    <option value="Wrong waste type">{lang === "hi" ? "कचरा प्रकार में अंतर (Wrong waste type)" : "Wrong waste type"}</option>
                    <option value="Unsafe behavior">{lang === "hi" ? "अनुचित व्यवहार (Unsafe behavior)" : "Unsafe behavior"}</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">
                    {lang === "hi" ? "विस्तृत विवरण" : "Description"}
                  </label>
                  <textarea 
                    className="flex min-h-[80px] w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-rose-400"
                    placeholder={lang === "hi" ? "समस्या का विवरण दर्ज करें..." : "Provide details about the issue..."}
                    value={disputeDesc}
                    onChange={(e) => setDisputeDesc(e.target.value)}
                    required
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <Button type="button" variant="outline" className="flex-1 rounded-xl text-xs font-bold min-h-[44px]" onClick={() => setDisputeModalOpen(false)}>
                    {t("btn.cancel")}
                  </Button>
                  <Button type="submit" className="flex-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold min-h-[44px]">
                    {lang === "hi" ? "शिकायत दर्ज करें" : "Submit Dispute"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Receipt Modal */}
      {receiptModalOpen && activeReceipt && (
        <ReceiptModal 
          pickup={activeReceipt} 
          onClose={() => setReceiptModalOpen(false)} 
        />
      )}

    </div>
  );
}
