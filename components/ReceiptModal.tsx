import { PickupRequest } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Download, ReceiptText, MapPin, Scale, Banknote, Leaf } from "lucide-react";

type ReceiptModalProps = {
  pickup: PickupRequest;
  onClose: () => void;
};

export default function ReceiptModal({ pickup, onClose }: ReceiptModalProps) {
  const co2Saved = (pickup.finalWeight || pickup.estimatedWeight) * 2;
  const amountPaid = pickup.finalPrice || pickup.estimatedPrice;
  const paymentMode = pickup.paymentMode || "upi";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <Card className="w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 bg-white overflow-hidden">
        
        {/* Receipt Header */}
        <div className="bg-green-600 p-6 text-center text-white relative">
          <div className="absolute top-4 right-4">
            <ReceiptText className="h-6 w-6 opacity-50" />
          </div>
          <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-inner mb-3">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold">Payment Successful</h2>
          <p className="text-green-100 mt-1 opacity-90">Digital Receipt for Pickup #{pickup.id.replace('req', '')}</p>
          <div className="text-4xl font-black mt-4">₹{amountPaid.toFixed(0)}</div>
          <div className="text-xs uppercase tracking-widest text-green-200 mt-2">Paid via {paymentMode}</div>
        </div>

        <CardContent className="p-0">
          <div className="p-6 space-y-5">
            
            {/* Impact Highlight */}
            <div className="bg-green-50 border border-green-100 rounded-lg p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Leaf className="h-6 w-6 text-green-600" />
                <div>
                  <div className="text-xs font-bold text-green-800 uppercase tracking-wider">Environmental Impact</div>
                  <div className="text-sm text-green-700">{co2Saved.toFixed(1)} kg CO₂ Emissions Saved</div>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3">
              <div className="flex justify-between border-b border-dashed pb-3">
                <span className="text-slate-500 text-sm">Date</span>
                <span className="font-medium text-slate-900 text-sm">{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between border-b border-dashed pb-3">
                <span className="text-slate-500 text-sm">Generator Name</span>
                <span className="font-medium text-slate-900 text-sm">{pickup.generatorName}</span>
              </div>
              <div className="flex justify-between border-b border-dashed pb-3">
                <span className="text-slate-500 text-sm">Waste-Picker Name</span>
                <span className="font-medium text-slate-900 text-sm">{pickup.pickerName || "N/A"}</span>
              </div>
              <div className="flex justify-between border-b border-dashed pb-3">
                <span className="text-slate-500 text-sm">Waste Type</span>
                <span className="font-medium text-slate-900 text-sm">{pickup.wasteType}</span>
              </div>
              <div className="flex justify-between border-b border-dashed pb-3">
                <span className="text-slate-500 text-sm">Final Weight</span>
                <span className="font-medium text-slate-900 text-sm">{pickup.finalWeight || pickup.estimatedWeight} kg</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-slate-500 text-sm">Fair Income Generated</span>
                <span className="font-bold text-green-600 text-sm">₹{amountPaid.toFixed(0)}</span>
              </div>
              <div className="text-xs text-slate-400 text-right italic">100% went directly to the worker.</div>
            </div>

          </div>

          <div className="bg-slate-50 p-4 border-t flex gap-3">
            <Button variant="outline" className="flex-1 text-slate-600" onClick={onClose}>
              Close
            </Button>
            <Button className="flex-1 bg-slate-900 hover:bg-slate-800">
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
