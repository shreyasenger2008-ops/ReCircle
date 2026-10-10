"use client";

import { PickupRequest } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  Download, 
  ReceiptText, 
  Leaf, 
  Share2, 
  X, 
  ShieldCheck, 
  MessageCircle 
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/lib/language-context";

type ReceiptModalProps = {
  pickup: PickupRequest;
  onClose: () => void;
};

export default function ReceiptModal({ pickup, onClose }: ReceiptModalProps) {
  const { lang } = useLanguage();

  const weight = pickup.finalWeight || pickup.estimatedWeight || 12;
  const estimatedUnitPrice = pickup.finalPrice 
    ? Math.round((pickup.finalPrice / weight) * 10) / 10 
    : 14.5;
  const baseMaterialTotal = Math.round(weight * estimatedUnitPrice);
  const urgencyFee = pickup.urgency === "high" ? 20 : 0;
  const healthPoolTip = 10;
  const totalReceivedByPicker = baseMaterialTotal + urgencyFee + healthPoolTip;
  const co2Saved = Number((weight * 1.5).toFixed(1));
  const paymentMode = (pickup.paymentMode || "upi").toUpperCase();

  const handleDownloadPDF = () => {
    toast.success(lang === "hi" 
      ? `डिजिटल रसीद #${pickup.id} (PDF) डाउनलोड हो रही है...` 
      : `Downloading digital receipt #${pickup.id} (PDF)...`);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `♻️ *ReCircle Fair Digital Receipt*\n` +
      `Pickup #${pickup.id}\n` +
      `Generator: ${pickup.generatorName}\n` +
      `Safai Mitra: ${pickup.pickerName || "Suresh"}\n` +
      `Material: ${pickup.wasteType} (${weight} kg)\n` +
      `Amount Paid to Worker: ₹${totalReceivedByPicker} (100% Direct UPI)\n` +
      `CO₂ Saved: ${co2Saved} kg\n` +
      `100% Zero-Landfill Verified.`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
      <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 bg-white rounded-3xl overflow-hidden border-2 border-emerald-500 max-h-[90vh] overflow-y-auto">
        
        {/* Receipt Header */}
        <div className="bg-gradient-to-br from-emerald-700 via-teal-800 to-slate-900 p-6 text-center text-white relative">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-lg mb-2 text-emerald-700">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-black">{lang === "hi" ? "भुगतान सफल डिजिटल रसीद" : "Verified Payment Receipt"}</h2>
          <p className="text-xs text-emerald-200 mt-0.5 font-mono">Invoice #{pickup.id.toUpperCase()}</p>
          
          <div className="text-3xl font-black mt-3 text-emerald-300">₹{totalReceivedByPicker}</div>
          <div className="text-[11px] uppercase tracking-widest text-emerald-200 mt-1 font-bold">
            100% Direct {paymentMode} Escrow Settlement
          </div>
        </div>

        <CardContent className="p-0">
          <div className="p-5 space-y-4">
            
            {/* Impact Highlight */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-xl text-emerald-700 shrink-0">
                  <Leaf className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider">Circular Economy Impact</div>
                  <div className="text-xs font-bold text-emerald-800">{co2Saved} kg CO₂ Offsetting • Zero Landfill</div>
                </div>
              </div>
            </div>

            {/* Itemized Payout Breakdown */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
              <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-200">
                {lang === "hi" ? "मदवार भुगतान ब्योरा" : "Itemized Payout Breakdown"}
              </div>
              
              <div className="flex justify-between text-slate-600">
                <span>Material Rate × Weight ({weight} kg × ₹{estimatedUnitPrice}/kg):</span>
                <strong className="text-slate-900 font-bold">₹{baseMaterialTotal}</strong>
              </div>

              {urgencyFee > 0 && (
                <div className="flex justify-between text-amber-700">
                  <span>Urgent Dispatch Priority Fee:</span>
                  <strong className="font-bold">+₹{urgencyFee}</strong>
                </div>
              )}

              <div className="flex justify-between text-rose-700">
                <span>Suraksha Kawach Health Pool Round-Up:</span>
                <strong className="font-bold">+₹{healthPoolTip}</strong>
              </div>

              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Platform Commission Deduction:</span>
                <strong className="font-bold">₹0 (0% Cut)</strong>
              </div>

              <div className="border-t border-slate-300 pt-2 flex justify-between items-center text-slate-900">
                <span className="font-black text-xs uppercase">{lang === "hi" ? "सफाई मित्र को कुल प्राप्त:" : "Total Received by Picker:"}</span>
                <span className="font-black text-lg text-emerald-700">₹{totalReceivedByPicker}</span>
              </div>
            </div>

            {/* Parties Details */}
            <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
              <div className="flex justify-between">
                <span className="text-slate-500">{lang === "hi" ? "नागरिक:" : "Generator:"}</span>
                <strong className="text-slate-900">{pickup.generatorName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{lang === "hi" ? "सफाई मित्र:" : "Assigned Picker:"}</span>
                <strong className="text-slate-900">{pickup.pickerName || "Suresh (Picker #WP-084)"}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{lang === "hi" ? "कचरा श्रेणी:" : "Material:"}</span>
                <strong className="text-slate-900">{pickup.wasteType}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{lang === "hi" ? "पता:" : "Address:"}</span>
                <span className="text-slate-900 font-medium truncate max-w-[200px]">{pickup.address}</span>
              </div>
            </div>

          </div>

          {/* Footer Actions: Download PDF + Share on WhatsApp */}
          <div className="bg-slate-50 p-4 border-t border-slate-100 flex flex-col sm:flex-row gap-2.5">
            <Button 
              variant="outline" 
              onClick={handleShareWhatsApp}
              className="flex-1 rounded-xl text-xs font-bold border-emerald-300 text-emerald-800 hover:bg-emerald-50 min-h-[44px] gap-1.5"
            >
              <MessageCircle className="h-4 w-4 text-emerald-600" />
              WhatsApp
            </Button>
            <Button 
              onClick={handleDownloadPDF}
              className="flex-1 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold min-h-[44px] gap-1.5 shadow-md"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
