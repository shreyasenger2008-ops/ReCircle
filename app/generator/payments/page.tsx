"use client";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { usePlatformData } from "@/lib/platform-data-context";
import { PickupRequest } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ReceiptText, CreditCard, Banknote, Download, Heart, Leaf, ShieldCheck, CheckCircle2
} from "lucide-react";
import ReceiptModal from "@/components/ReceiptModal";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "@/lib/formatters";

export default function GeneratorPayments() {
  const { user } = useAuth();
  const { lang, t } = useLanguage();
  const { requests } = usePlatformData();
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<PickupRequest | null>(null);
  const [filterMode, setFilterMode] = useState<"all" | "completed">("all");

  if (!user || user.role !== "generator") {
    return <div className="p-8">Unauthorized. Please log in as a Citizen Generator.</div>;
  }

  // Completed pickups for this generator directly from platform data
  const myRequests = requests.filter(r => (r.generatorId === user.id || r.generatorName === user.name));
  const completedPickups = myRequests.filter(r => r.status === "completed" || r.status === "accepted" || r.status === "on_the_way");

  const allPayments = completedPickups.length > 0 ? completedPickups : myRequests;

  const filteredPayments = allPayments.filter(p => {
    if (filterMode === "all") return true;
    return p.status === filterMode;
  });

  const totalFairPaid = allPayments.reduce((sum, r) => sum + (r.finalPrice || r.payoutAmount || r.estimatedPrice || 0), 0);
  const totalTipsContributed = allPayments.filter(r => r.status === "completed").length * 10;
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
                <h3 className="text-3xl font-black text-emerald-400">{formatCurrency(totalFairPaid)}</h3>
                <p className="text-xs text-slate-300 mt-1">
                  {lang === "hi" ? "100% सीधे UPI एस्क्रो द्वारा भुगतान" : "100% direct instant UPI Escrow"}
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
                <h3 className="text-3xl font-black text-rose-600">{formatCurrency(totalTipsContributed)}</h3>
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
              {lang === "hi" ? "प्रत्येक पिकअप 100% डिजिटल रसीद और UPI ऑडिट ट्रेल से सुरक्षित है" : "All pickups are secured with 100% digital receipts and UPI audit trail"}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 text-xs px-2.5 py-1 font-semibold flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              {lang === "hi" ? "100% डिजिटल UPI एस्क्रो" : "100% Direct UPI Escrow"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {filteredPayments.map(req => (
              <div key={req.id} className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-2xl mt-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <span>{req.wasteType}</span>
                      <Badge variant="outline" className="text-[10px] uppercase font-mono bg-white text-emerald-700 border-emerald-200 rounded-lg">
                        UPI ESCROW
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
                      <span>{lang === "hi" ? "तारीख:" : "Date:"} {formatDate(req.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center">
                  <div className="text-right">
                    <div className="text-xl font-black text-slate-900">{formatCurrency(req.finalPrice || req.estimatedPrice || 0)}</div>
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