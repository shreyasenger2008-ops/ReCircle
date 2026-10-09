"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { MOCK_REQUESTS, PickupRequest } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReceiptText, CreditCard, Banknote, Calendar } from "lucide-react";
import ReceiptModal from "@/components/ReceiptModal";

export default function GeneratorPayments() {
  const { user } = useAuth();
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<PickupRequest | null>(null);

  if (!user || user.role !== "generator") {
    return <div className="p-8">Unauthorized.</div>;
  }

  // Get all completed requests for this generator
  const completedPickups = MOCK_REQUESTS.filter(r => r.generatorId === user.id && r.status === "completed");

  const totalPaid = completedPickups.reduce((sum, r) => sum + (r.finalPrice || r.estimatedPrice), 0);

  const openReceipt = (req: PickupRequest) => {
    setActiveReceipt(req);
    setReceiptModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Payments & Receipts</h2>
        <p className="text-slate-500">Track the fair income you've provided to waste-pickers.</p>
      </div>

      <Card className="bg-slate-900 text-white border-0 shadow-md max-w-md">
        <CardContent className="p-6">
          <div className="text-slate-400 text-sm mb-1">Total Fair Wages Paid</div>
          <div className="text-4xl font-bold text-green-400 mb-2">₹{totalPaid.toFixed(0)}</div>
          <p className="text-xs text-slate-500">100% of this amount went directly to verified workers.</p>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        <h3 className="font-semibold text-slate-800 text-lg border-b pb-2">Payment History</h3>
        
        {completedPickups.length === 0 ? (
          <Card className="border-dashed bg-transparent shadow-none">
            <CardContent className="p-12 text-center text-slate-500">
              No payments made yet.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {completedPickups.map(req => (
              <Card key={req.id} className="overflow-hidden flex flex-col hover:border-slate-400 transition-colors">
                <CardContent className="p-0 flex-1 flex flex-col">
                  <div className="p-5 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-2 rounded-full ${req.paymentMode === 'cash' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                        {req.paymentMode === 'cash' ? <Banknote className="h-5 w-5" /> : <CreditCard className="h-5 w-5" />}
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-slate-900">₹{(req.finalPrice || req.estimatedPrice).toFixed(0)}</div>
                        <div className="text-xs text-slate-500 uppercase">{req.paymentMode || 'upi'}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-slate-500">Worker: </span>
                        <span className="font-medium text-slate-900">{req.pickerName || "Unknown"}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-slate-500">Items: </span>
                        <span className="font-medium text-slate-900">{req.wasteType}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 border-t mt-auto">
                    <Button variant="outline" className="w-full text-slate-600" onClick={() => openReceipt(req)}>
                      <ReceiptText className="h-4 w-4 mr-2" />
                      View Receipt
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {receiptModalOpen && activeReceipt && (
        <ReceiptModal 
          pickup={activeReceipt} 
          onClose={() => setReceiptModalOpen(false)} 
        />
      )}
    </div>
  );
}