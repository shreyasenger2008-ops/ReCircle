"use client";

import { useState } from "react";
import { User, MOCK_REQUESTS, PickupRequest } from "@/lib/mock-data";
import { useLanguage } from "@/lib/language-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Scale, Clock, Banknote, User as UserIcon, Truck, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import ReceiptModal from "./ReceiptModal";

type Props = {
  user: User;
};

type TabType = "upcoming" | "ongoing" | "completed" | "cancelled" | "disputed";

export default function MyPickupsList({ user }: Props) {
  const { lang, t, speak } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>("upcoming");
  const [refresh, setRefresh] = useState(0); // To trigger re-renders
  
  // Modal State
  const [completionModalOpen, setCompletionModalOpen] = useState(false);
  const [activePickupForCompletion, setActivePickupForCompletion] = useState<PickupRequest | null>(null);
  const [finalWeight, setFinalWeight] = useState<number | "">("");
  const [paymentMode, setPaymentMode] = useState<"upi" | "cash">("upi");
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [notes, setNotes] = useState("");

  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<PickupRequest | null>(null);

  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [activeDisputePickup, setActiveDisputePickup] = useState<PickupRequest | null>(null);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeDesc, setDisputeDesc] = useState("");

  const isPicker = user.role === "picker";

  const myRequests = MOCK_REQUESTS.filter(r => 
    isPicker ? r.matchedPickerId === user.id : r.generatorId === user.id
  );

  const getFilteredRequests = (tab: TabType) => {
    switch (tab) {
      case "upcoming": return myRequests.filter(r => r.status === "pending" || r.status === "accepted");
      case "ongoing": return myRequests.filter(r => r.status === "on_the_way" || r.status === "picked_up");
      case "completed": return myRequests.filter(r => r.status === "completed");
      case "cancelled": return myRequests.filter(r => r.status === "cancelled");
      case "disputed": return myRequests.filter(r => r.status === "disputed");
      default: return [];
    }
  };

  const filteredRequests = getFilteredRequests(activeTab);

  const updateStatus = (id: string, newStatus: PickupRequest["status"]) => {
    const req = MOCK_REQUESTS.find(r => r.id === id);
    if (req) {
      req.status = newStatus;
      setRefresh(prev => prev + 1);
    }
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
        reason: disputeReason,
        description: disputeDesc,
        status: "open",
        createdAt: new Date().toISOString()
      });
      updateStatus(activeDisputePickup.id, "disputed");
      const msg = lang === "hi" ? "शिकायत सफलतापूर्वक एडमिन टीम को भेज दी गई।" : "Dispute submitted successfully to the Admin team.";
      toast.success(msg);
      setDisputeModalOpen(false);
    });
  };

  const openCompletionModal = (req: PickupRequest) => {
    setActivePickupForCompletion(req);
    setFinalWeight(req.estimatedWeight);
    setPaymentMode(req.paymentMode || "upi");
    setPaymentConfirmed(false);
    setNotes("");
    setCompletionModalOpen(true);
  };

  const openReceipt = (req: PickupRequest) => {
    setActiveReceipt(req);
    setReceiptModalOpen(true);
  };

  const handleCompletePickup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePickupForCompletion) return;
    if (!paymentConfirmed) {
      toast.error(lang === "hi" ? "कृपया काम पूरा करने के लिए भुगतान की पुष्टि करें।" : "You must confirm payment to complete the pickup.");
      return;
    }

    const req = MOCK_REQUESTS.find(r => r.id === activePickupForCompletion.id);
    if (req) {
      req.status = "completed";
      req.finalWeight = Number(finalWeight);
      req.paymentMode = paymentMode;
      
      const weightRatio = Number(finalWeight) / req.estimatedWeight;
      req.finalPrice = req.estimatedPrice * weightRatio;
      req.payoutAmount = req.finalPrice;
      
      const msg = lang === "hi" ? "पिकअप पूरा हुआ और भुगतान की पुष्टि हो गई!" : "Pickup completed and payment confirmed!";
      speak(msg);
      toast.success(msg);
      setCompletionModalOpen(false);
      setRefresh(prev => prev + 1);
    }
  };

  const tabs: { id: TabType, label: string, icon: any }[] = [
    { id: "upcoming", label: lang === "hi" ? "आगामी (Upcoming)" : "Upcoming", icon: Clock },
    { id: "ongoing", label: lang === "hi" ? "प्रगति पर (Ongoing)" : "Ongoing", icon: Truck },
    { id: "completed", label: lang === "hi" ? "पूरे हुए (Completed)" : "Completed", icon: CheckCircle },
    { id: "cancelled", label: lang === "hi" ? "रद्द (Cancelled)" : "Cancelled", icon: XCircle },
    { id: "disputed", label: lang === "hi" ? "विवादित (Disputed)" : "Disputed", icon: AlertTriangle },
  ];

  return (
    <div className="space-y-6 pb-20 relative">
      
      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2 hide-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap text-xs font-bold transition-all ${
              activeTab === tab.id 
                ? "bg-slate-900 text-white shadow-xs" 
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? 'text-emerald-400' : 'text-slate-400'}`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <Card className="border-dashed border-2 rounded-2xl bg-white">
            <CardContent className="p-12 text-center text-slate-500 text-xs font-medium">
              {lang === "hi" ? `कोई ${activeTab} पिकअप नहीं मिला।` : `No ${activeTab} pickups found.`}
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map(req => (
            <Card key={req.id} className="overflow-hidden border-slate-200 rounded-2xl bg-white shadow-xs">
              <CardContent className="p-0">
                <div className="bg-slate-50 border-b border-slate-100 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      req.status === 'completed' ? 'success' : 
                      req.status === 'disputed' ? 'destructive' : 
                      req.status === 'cancelled' ? 'secondary' : 'default'
                    } className="uppercase tracking-wider text-[10px] rounded-lg">
                      {req.status === 'completed' ? (lang === "hi" ? "पूर्ण" : "Completed") :
                       req.status === 'accepted' ? (lang === "hi" ? "स्वीकृत" : "Accepted") :
                       req.status === 'on_the_way' ? (lang === "hi" ? "रास्ते में" : "On The Way") :
                       req.status === 'picked_up' ? (lang === "hi" ? "कचरा उठाया गया" : "Picked Up") :
                       req.status.replace("_", " ")}
                    </Badge>
                    <span className="text-sm font-bold text-slate-900">{req.wasteType}</span>
                  </div>
                  <div className="text-2xl font-black text-emerald-600">
                    ₹{(req.finalPrice || req.estimatedPrice).toFixed(0)}
                  </div>
                </div>

                <div className="p-5 grid sm:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <UserIcon className="h-4 w-4 text-slate-400 mt-0.5" />
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{lang === "hi" ? "पक्षकार" : "Parties"}</div>
                        <div className="text-xs">
                          <span className="font-medium text-slate-500">{lang === "hi" ? "नागरिक:" : "Generator:"}</span> <strong className="text-slate-800">{req.generatorName}</strong>
                        </div>
                        <div className="text-xs">
                          <span className="font-medium text-slate-500">{lang === "hi" ? "सफाई मित्र:" : "Picker:"}</span> <strong className="text-slate-800">{req.pickerName || (lang === "hi" ? "असाइन नहीं हुआ" : "Not assigned yet")}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{lang === "hi" ? "पता व समय" : "Address & Time"}</div>
                        <div className="text-xs font-semibold text-slate-900">{req.address}</div>
                        <div className="text-xs text-slate-500">{req.preferredTime}</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Scale className="h-4 w-4 text-slate-400 mt-0.5" />
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{lang === "hi" ? "वजन (Weight)" : "Weight"}</div>
                        <div className="text-xs">
                          <span className="text-slate-500">{lang === "hi" ? "अनुमानित:" : "Estimated:"}</span> <strong className="text-slate-800">{req.estimatedWeight} kg</strong>
                        </div>
                        {req.finalWeight && (
                          <div className="text-xs">
                            <span className="text-slate-500">{lang === "hi" ? "अंतिम वजन:" : "Final:"}</span> <strong className="text-emerald-700">{req.finalWeight} kg</strong>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Banknote className="h-4 w-4 text-slate-400 mt-0.5" />
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{lang === "hi" ? "भुगतान स्थिति" : "Payment Status"}</div>
                        <div className="text-xs font-semibold text-slate-900">
                          {req.status === 'completed' 
                            ? (lang === "hi" ? `भुगतान हो चुका (${req.paymentMode?.toUpperCase() || 'UPI'})` : `Paid (${req.paymentMode?.toUpperCase() || 'UPI'})`)
                            : (lang === "hi" ? "कार्य पूर्ण होने पर" : "Pending Completion")}
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
                    <Button size="sm" variant="outline" className="ml-auto rounded-xl text-xs font-semibold" onClick={() => openReceipt(req)}>
                      {t("btn.viewReceipt")}
                    </Button>
                  </div>
                )}

                {/* Waste-Picker Actions */}
                {isPicker && req.status !== "completed" && req.status !== "cancelled" && req.status !== "disputed" && (
                  <div className="bg-slate-50 p-4 border-t border-slate-100 flex flex-wrap gap-2">
                    {req.status === "accepted" && (
                      <Button size="sm" onClick={() => updateStatus(req.id, "on_the_way")} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold">
                        {lang === "hi" ? "रास्ते में चिह्नित करें" : "Mark On The Way"}
                      </Button>
                    )}
                    {req.status === "on_the_way" && (
                      <Button size="sm" onClick={() => updateStatus(req.id, "picked_up")} className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold">
                        {lang === "hi" ? "कचरा उठाया गया" : "Mark Picked Up"}
                      </Button>
                    )}
                    {(req.status === "picked_up" || req.status === "on_the_way" || req.status === "accepted") && (
                      <Button size="sm" onClick={() => openCompletionModal(req)} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold">
                        {lang === "hi" ? "वजन दर्ज करें व पूरा करें" : "Complete & Confirm Weight"}
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="text-rose-600 border-rose-200 hover:bg-rose-50 rounded-xl text-xs font-semibold" onClick={() => updateStatus(req.id, "cancelled")}>
                      {t("btn.cancel")}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Completion Modal */}
      {completionModalOpen && activePickupForCompletion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <Card className="w-full max-w-md shadow-2xl rounded-3xl bg-white">
            <CardHeader className="p-5 pb-3 border-b">
              <CardTitle className="text-base font-bold text-slate-900">
                {lang === "hi" ? "पिकअप कार्य पूर्ण करें" : "Complete Pickup"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <form onSubmit={handleCompletePickup} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                    {lang === "hi" ? "अंतिम वास्तविक वजन (kg)" : "Final Weight (kg)"}
                  </label>
                  <p className="text-xs text-slate-500 mb-2">
                    {lang === "hi" ? `अनुमानित वजन ${activePickupForCompletion.estimatedWeight} kg था` : `Estimated weight was ${activePickupForCompletion.estimatedWeight} kg`}
                  </p>
                  <Input 
                    type="number" 
                    min="0.1" 
                    step="0.1" 
                    value={finalWeight} 
                    onChange={(e) => setFinalWeight(parseFloat(e.target.value) || "")} 
                    required 
                    className="rounded-xl font-bold text-base h-11"
                  />
                </div>
                
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                    {lang === "hi" ? "भुगतान का माध्यम" : "Payment Mode"}
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                      <input type="radio" name="pmode" value="upi" checked={paymentMode === "upi"} onChange={() => setPaymentMode("upi")} />
                      UPI ({lang === "hi" ? "डिजिटल" : "Digital"})
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                      <input type="radio" name="pmode" value="cash" checked={paymentMode === "cash"} onChange={() => setPaymentMode("cash")} />
                      {lang === "hi" ? "नकद (Cash)" : "Cash"}
                    </label>
                  </div>
                </div>

                <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="mt-1 h-4 w-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500" 
                      checked={paymentConfirmed}
                      onChange={(e) => setPaymentConfirmed(e.target.checked)}
                    />
                    <div>
                      <div className="text-xs font-bold text-emerald-900">{lang === "hi" ? "भुगतान प्राप्त हुआ" : "Payment Confirmed"}</div>
                      <div className="text-[11px] text-emerald-700">
                        {lang === "hi" 
                          ? `मुझे इस कार्य के लिए ${paymentMode.toUpperCase()} भुगतान सुरक्षित रूप से प्राप्त हो गया है।`
                          : `I have received the ${paymentMode.toUpperCase()} payment for this transaction securely.`}
                      </div>
                    </div>
                  </label>
                </div>

                <div className="pt-2 flex gap-3">
                  <Button type="button" variant="outline" className="flex-1 rounded-xl text-xs font-semibold" onClick={() => setCompletionModalOpen(false)}>
                    {t("btn.cancel")}
                  </Button>
                  <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold">
                    {lang === "hi" ? "कार्य समाप्त करें" : "Finish Job"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Dispute Modal */}
      {disputeModalOpen && activeDisputePickup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <Card className="w-full max-w-md shadow-2xl rounded-3xl bg-white">
            <CardHeader className="bg-rose-50 border-b border-rose-100 p-5">
              <CardTitle className="text-rose-900 flex items-center gap-2 text-base font-bold">
                <AlertTriangle className="h-5 w-5 text-rose-600" />
                {t("btn.dispute")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <form onSubmit={handleSubmitDispute} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                    {lang === "hi" ? "विवाद का कारण" : "Reason for Dispute"}
                  </label>
                  <select 
                    className="flex h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-400"
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
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
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
                  <Button type="button" variant="outline" className="flex-1 rounded-xl text-xs font-semibold" onClick={() => setDisputeModalOpen(false)}>
                    {t("btn.cancel")}
                  </Button>
                  <Button type="submit" className="flex-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold">
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
