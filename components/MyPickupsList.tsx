"use client";

import { useState } from "react";
import { User, MOCK_REQUESTS, PickupRequest } from "@/lib/mock-data";
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
    
    // Add to MOCK_DISPUTES
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
      toast.success("Dispute submitted successfully to the Admin team.");
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
      toast.error("You must confirm payment to complete the pickup.");
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
      
      toast.success("Pickup completed and payment confirmed!");
      setCompletionModalOpen(false);
      setRefresh(prev => prev + 1);
    }
  };

  const tabs: { id: TabType, label: string, icon: any }[] = [
    { id: "upcoming", label: "Upcoming", icon: Clock },
    { id: "ongoing", label: "Ongoing", icon: Truck },
    { id: "completed", label: "Completed", icon: CheckCircle },
    { id: "cancelled", label: "Cancelled", icon: XCircle },
    { id: "disputed", label: "Disputed", icon: AlertTriangle },
  ];

  return (
    <div className="space-y-6 pb-20 relative">
      
      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2 hide-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
              activeTab === tab.id 
                ? "bg-slate-900 text-white shadow-sm" 
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? 'text-white' : 'text-slate-400'}`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <Card className="border-dashed bg-transparent shadow-none">
            <CardContent className="p-12 text-center text-slate-500">
              No {activeTab} pickups found.
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map(req => (
            <Card key={req.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-slate-50 border-b p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      req.status === 'completed' ? 'success' : 
                      req.status === 'disputed' ? 'destructive' : 
                      req.status === 'cancelled' ? 'secondary' : 'default'
                    } className="uppercase tracking-wider">
                      {req.status.replace("_", " ")}
                    </Badge>
                    <span className="text-sm font-semibold text-slate-900">{req.wasteType}</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    ₹{(req.finalPrice || req.estimatedPrice).toFixed(0)}
                  </div>
                </div>

                <div className="p-5 grid sm:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <UserIcon className="h-5 w-5 text-slate-400 mt-0.5" />
                      <div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider">Parties</div>
                        <div className="text-sm">
                          <span className="font-medium text-slate-900">Generator:</span> {req.generatorName}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium text-slate-900">Picker:</span> {req.pickerName || "Not assigned yet"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-slate-400 mt-0.5" />
                      <div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider">Address & Time</div>
                        <div className="text-sm font-medium text-slate-900">{req.address}</div>
                        <div className="text-sm text-slate-600">{req.preferredTime}</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Scale className="h-5 w-5 text-slate-400 mt-0.5" />
                      <div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider">Weight</div>
                        <div className="text-sm">
                          <span className="text-slate-600">Estimated:</span> <span className="font-medium text-slate-900">{req.estimatedWeight} kg</span>
                        </div>
                        {req.finalWeight && (
                          <div className="text-sm">
                            <span className="text-slate-600">Final:</span> <span className="font-medium text-slate-900">{req.finalWeight} kg</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Banknote className="h-5 w-5 text-slate-400 mt-0.5" />
                      <div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider">Payment Status</div>
                        <div className="text-sm font-medium text-slate-900">
                          {req.status === 'completed' ? `Paid (${req.paymentMode?.toUpperCase() || 'UPI'})` : 'Pending Completion'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shared Action for completed */}
                {req.status === "completed" && (
                  <div className="bg-slate-50 p-4 border-t flex flex-wrap gap-2 justify-between items-center">
                    {!isPicker && (
                      <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => openDisputeModal(req)}>
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Raise Dispute
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="ml-auto" onClick={() => openReceipt(req)}>
                      View Digital Receipt
                    </Button>
                  </div>
                )}

                {/* Waste-Picker Actions */}
                {isPicker && req.status !== "completed" && req.status !== "cancelled" && req.status !== "disputed" && (
                  <div className="bg-slate-50 p-4 border-t flex flex-wrap gap-2">
                    {req.status === "accepted" && (
                      <Button size="sm" onClick={() => updateStatus(req.id, "on_the_way")} className="bg-blue-600 hover:bg-blue-700">
                        Mark On The Way
                      </Button>
                    )}
                    {req.status === "on_the_way" && (
                      <Button size="sm" onClick={() => updateStatus(req.id, "picked_up")} className="bg-purple-600 hover:bg-purple-700">
                        Mark Picked Up
                      </Button>
                    )}
                    {(req.status === "picked_up" || req.status === "on_the_way" || req.status === "accepted") && (
                      <Button size="sm" onClick={() => openCompletionModal(req)} className="bg-green-600 hover:bg-green-700">
                        Complete & Confirm Weight
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => updateStatus(req.id, "cancelled")}>
                      Cancel
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <Card className="w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95">
            <CardHeader>
              <CardTitle>Complete Pickup</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCompletePickup} className="space-y-4">
                <div>
                  <label className="text-sm font-semibold mb-1 block">Final Weight (kg)</label>
                  <p className="text-xs text-slate-500 mb-2">Estimated weight was {activePickupForCompletion.estimatedWeight} kg</p>
                  <Input 
                    type="number" 
                    min="0.1" 
                    step="0.1" 
                    value={finalWeight} 
                    onChange={(e) => setFinalWeight(parseFloat(e.target.value) || "")} 
                    required 
                  />
                </div>
                
                <div>
                  <label className="text-sm font-semibold mb-1 block">Payment Mode</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="radio" name="pmode" value="upi" checked={paymentMode === "upi"} onChange={() => setPaymentMode("upi")} />
                      UPI (Digital)
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="radio" name="pmode" value="cash" checked={paymentMode === "cash"} onChange={() => setPaymentMode("cash")} />
                      Cash
                    </label>
                  </div>
                </div>

                <div className="bg-green-50 p-3 rounded border border-green-200">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="mt-1 h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500" 
                      checked={paymentConfirmed}
                      onChange={(e) => setPaymentConfirmed(e.target.checked)}
                    />
                    <div>
                      <div className="text-sm font-bold text-green-900">Payment Confirmed</div>
                      <div className="text-xs text-green-700">I have received the {paymentMode.toUpperCase()} payment for this transaction securely.</div>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="text-sm font-semibold mb-1 block">Additional Notes</label>
                  <textarea 
                    className="flex min-h-[80px] w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                    placeholder="E.g., Great generator, very clean sorting."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setCompletionModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
                    Finish Job
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Dispute Modal */}
      {disputeModalOpen && activeDisputePickup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <Card className="w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95">
            <CardHeader className="bg-red-50 border-b border-red-100">
              <CardTitle className="text-red-900 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Raise a Dispute
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmitDispute} className="space-y-4">
                <div>
                  <label className="text-sm font-semibold mb-1 block">Reason for Dispute</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    required
                  >
                    <option value="">Select a reason...</option>
                    <option value="Wrong weight">Wrong weight</option>
                    <option value="Payment not received">Payment not received</option>
                    <option value="Wrong waste type">Wrong waste type</option>
                    <option value="Pickup cancelled unfairly">Pickup cancelled unfairly</option>
                    <option value="Unsafe behavior">Unsafe behavior</option>
                    <option value="Late pickup">Late pickup</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold mb-1 block">Description</label>
                  <textarea 
                    className="flex min-h-[80px] w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                    placeholder="Provide details about the issue..."
                    value={disputeDesc}
                    onChange={(e) => setDisputeDesc(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold mb-1 block">Upload Proof (Optional)</label>
                  <div className="border border-dashed border-slate-300 rounded-lg p-4 text-center bg-slate-50 text-slate-500 cursor-pointer hover:bg-slate-100">
                    <span className="text-sm">Click to upload photo or screenshot</span>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setDisputeModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 bg-red-600 hover:bg-red-700">
                    Submit Dispute
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
