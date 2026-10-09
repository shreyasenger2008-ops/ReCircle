"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { MOCK_REQUESTS, PickupRequest } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ReceiptText, CreditCard, Banknote, Download, Heart, Leaf
} from "lucide-react";
import ReceiptModal from "@/components/ReceiptModal";
import { toast } from "sonner";

export default function GeneratorPayments() {
  const { user } = useAuth();
  const { lang, t } = useLanguage();
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<PickupRequest | null>(null);
  const [filterMode, setFilterMode] = useState<"all" | "upi" | "cash">("all");

  if (!user || user.role !== "generator") {
    return <div className="p-8">Unauthorized. Please log in as a Citizen Generator.</div>;
  }

  // Completed pickups for this generator
  const completedPickups = MOCK_REQUESTS.filter(r => r.generatorId === user.id && (r.status === "completed" || r.status === "accepted"));

  const allPayments = [
    ...completedPickups,
    {
      id: "req-hist-1",
      generatorId: user.id,
      generatorName: user.name,
      wasteType: lang === "hi" ? "गत्ता व पैकेजिंग बॉक्स" : "Cardboard & Packaging Boxes",
      estimatedWeight: 18,
      finalWeight: 18.5,
      estimatedPrice: 185,
      finalPrice: 185,
      payoutAmount: 185,
      items: [{ type: "Cardboard", weight: 18.5 }],
      address: "12, MG Road, Bengaluru",
      location: { lat: 12.9716, lng: 77.5946 },
      preferredTime: "Morning",
      urgency: "low" as const,
      status: "completed" as const,
      paymentMode: "upi" as const,
      pickerName: "Suresh (Picker)",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString()
    },
    {
      id: "req-hist-2",
      generatorId: user.id,
      generatorName: user.name,
      wasteType: lang === "hi" ? "पीईटी प्लास्टिक की बोतलें व डिब्बे" : "PET Plastic Bottles & Cans",
      estimatedWeight: 12,
      finalWeight: 12,
      estimatedPrice: 154,
      finalPrice: 154,
      payoutAmount: 154,
      items: [{ type: "Plastic", weight: 12 }],
      address: "12, MG Road, Bengaluru",
      location: { lat: 12.9716, lng: 77.5946 },
      preferredTime: "Afternoon",
      urgency: "medium" as const,
      status: "completed" as const,
      paymentMode: "upi" as const,
      pickerName: "Ramesh (Picker)",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString()
    }
  ];

  const filteredPayments = allPayments.filter(p => {
    if (filterMode === "all") return true;
    return (p.paymentMode || "upi") === filterMode;
  });

  const totalFairPaid = allPayments.reduce((sum, r) => sum + (r.finalPrice || r.estimatedPrice || 0), 0);
  const totalTipsContributed = allPayments.length * 10;
  const totalRecycledKg = allPayments.reduce((sum, r) => sum + (r.finalWeight || r.estimatedWeight || 0), 0);

  const openReceipt = (req: PickupRequest) => {
    setActiveReceipt(req);
    setReceiptModalOpen(true);
  };

  const handleDownloadStatement = () => {
    toast.success(lang === "hi" ? "आधिकारिक ईएसजी ग्रीन टैक्स व भुगतान विवरण (PDF) डाउनलोड हो रहा है..." : "Downloading official ESG Green Tax & Payout Statement (PDF)...");
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-emerald-600" />
            {lang === "hi" ? "भुगतान व डिजिटल रसीदें" : "Payments & Digital Receipts"}
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {lang === "hi" ? "100% प्रत्यक्ष उचित पारिश्रमिक और सुरक्षा कवच हेल्थ फंड योगदान का ब्योरा।" : "Track 100% direct fair wages and Suraksha Kawach health fund contributions."}
          </p>
        </div>
        <Button onClick={handleDownloadStatement} variant="outline" className="gap-2 rounded-xl border-slate-300 text-xs font-semibold">
          <Download className="h-4 w-4" /> {lang === "hi" ? "ESG टैक्स रसीद डाउनलोड करें" : "Download ESG Tax Statement"}
        </Button>
      </div>

      {/* KPI Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 text-white shadow-md border-0 rounded-2xl">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  {lang === "hi" ? "सफाई मित्रों को किया गया कुल भुगतान" : "Total Fair Wages Paid"}
                </p>
                <h3 className="text-3xl font-black text-emerald-400">₹{totalFairPaid.toFixed(0)}</h3>
                <p className="text-xs text-slate-300 mt-1">
                  {lang === "hi" ? "100% सीधे श्रमिकों को प्राप्त" : "100% directly received by workers"}
                </p>
              </div>
              <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
                <Banknote className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-slate-200 rounded-2xl bg-white">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  {lang === "hi" ? "सुरक्षा हेल्थ टिप योगदान" : "Suraksha Health Tips"}
                </p>
                <h3 className="text-3xl font-black text-rose-600">₹{totalTipsContributed}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  {lang === "hi" ? "सफाई मित्रों के आपातकालीन क्लिनिक फंड में" : "Pooled for worker emergency clinic care"}
                </p>
              </div>
              <div className="p-2.5 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100">
                <Heart className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-slate-200 rounded-2xl bg-white">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  {lang === "hi" ? "पुनर्चक्रित कचरा वजन" : "Total Diverted Weight"}
                </p>
                <h3 className="text-3xl font-black text-blue-600">{totalRecycledKg.toFixed(1)} kg</h3>
                <p className="text-xs text-emerald-600 font-semibold mt-1">
                  {lang === "hi" ? "शून्य-लैंडफिल प्रमाणित ✅" : "Zero-landfill certified ✅"}
                </p>
              </div>
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
                <Leaf className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment History Table & Filters */}
      <Card className="shadow-xs border-slate-200 rounded-2xl bg-white overflow-hidden">
        <CardHeader className="p-5 pb-3 border-b border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <CardTitle className="text-base font-bold text-slate-900">
              {lang === "hi" ? "सत्यापित लेन-देन बहीखाता" : "Verified Transaction Ledger"}
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              {lang === "hi" ? "प्रत्येक पिकअप डिजिटल रसीद और ऑडिट ट्रेल से सुरक्षित है" : "All pickups are sealed with immutable digital receipts"}
            </CardDescription>
          </div>
          <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
            <button
              onClick={() => setFilterMode("all")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                filterMode === "all" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {lang === "hi" ? "सभी माध्यम" : "All Modes"}
            </button>
            <button
              onClick={() => setFilterMode("upi")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                filterMode === "upi" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              UPI ({lang === "hi" ? "डिजिटल" : "Digital"})
            </button>
            <button
              onClick={() => setFilterMode("cash")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                filterMode === "cash" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {lang === "hi" ? "नकद" : "Cash"}
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {filteredPayments.map(req => (
              <div key={req.id} className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-2xl mt-0.5 ${req.paymentMode === 'cash' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                    {req.paymentMode === 'cash' ? <Banknote className="h-5 w-5" /> : <CreditCard className="h-5 w-5" />}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <span>{req.wasteType}</span>
                      <Badge variant="outline" className="text-[10px] uppercase font-mono bg-white rounded-lg">
                        {req.paymentMode || 'UPI'}
                      </Badge>
                      <Badge variant="success" className="text-[10px] bg-emerald-100 text-emerald-800 rounded-lg">
                        {lang === "hi" ? "100% भुगतान सफल" : "Paid 100%"}
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                      <span>{lang === "hi" ? "सफाई मित्र:" : "Worker:"} <strong className="text-slate-700">{req.pickerName || "Suresh (Picker)"}</strong></span>
                      <span>•</span>
                      <span>{lang === "hi" ? "वजन:" : "Weight:"} <strong>{req.finalWeight || req.estimatedWeight} kg</strong></span>
                      <span>•</span>
                      <span>{lang === "hi" ? "तारीख:" : "Date:"} {new Date(req.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center">
                  <div className="text-right">
                    <div className="text-xl font-black text-slate-900">₹{(req.finalPrice || req.estimatedPrice).toFixed(0)}</div>
                    <div className="text-[10px] text-emerald-600 font-semibold">{lang === "hi" ? "+₹10 स्वास्थ्य फंड" : "+₹10 Health Pool"}</div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => openReceipt(req as any)}
                    className="rounded-xl border-slate-300 hover:bg-slate-100 text-xs font-bold gap-1.5"
                  >
                    <ReceiptText className="h-3.5 w-3.5" />
                    {lang === "hi" ? "रसीद देखें" : "View Receipt"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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