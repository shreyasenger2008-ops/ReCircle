"use client";
import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { usePlatformData } from "@/lib/platform-data-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Wallet, ArrowUpRight, ArrowDownLeft, ShieldCheck, CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import SOSFloatingButton from "@/components/SOSFloatingButton";

import { MOCK_WALLET_TRANSACTIONS, WalletTransaction } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/formatters";

export default function PickerWalletPage() {
  const { user } = useAuth();
  const { lang, t, speak } = useLanguage();
  const { users, payments, requests, withdrawPickerBalance } = usePlatformData();
  const [withdrawAmount, setWithdrawAmount] = useState<number | "">("");
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!user || user.role !== "picker") {
    return <div className="p-8 text-center text-slate-900 font-bold">Unauthorized. Please log in as a Waste-Picker.</div>;
  }

  // Calculate live reactive balance
  const currentUserObj = users.find(u => u.id === user.id || u.role === "picker");
  const storedBalance = currentUserObj?.balance ?? 1450;
  
  // Guarantee any completed pickups are included in balance
  const completedNewPickups = requests.filter(r => 
    (r.matchedPickerId === user.id || r.pickerName === user.name || user.id === "p1") && 
    r.status === "completed" && 
    !["req1", "req2"].includes(r.id)
  );
  const newPickupTotal = completedNewPickups.reduce((sum, r) => sum + (r.finalPrice || r.payoutAmount || 0), 0);
  const balance = Math.max(storedBalance, 1450 + newPickupTotal);

  // Real-time combined transaction history
  const livePaymentTransactions: WalletTransaction[] = completedNewPickups.map(req => ({
    id: `live-tx-${req.id}`,
    userId: user.id,
    type: "credit",
    amount: req.finalPrice || req.payoutAmount || 174,
    description: `UPI Direct Payout: ${req.generatorName || "Rajesh Kumar"} (${req.wasteType})`,
    timestamp: "Just now",
    status: "completed",
    referenceId: `UPI-REC-${req.id.toUpperCase()}`,
  }));

  const staticTransactions = MOCK_WALLET_TRANSACTIONS.filter(t => t.userId === user.id || t.userId === "p1");
  const transactions = [...livePaymentTransactions, ...staticTransactions];

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmount || Number(withdrawAmount) <= 0) return;
    if (Number(withdrawAmount) > balance) {
      toast.error(lang === "hi" ? "वॉलेट में पर्याप्त राशि नहीं है!" : "Insufficient wallet balance!");
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      withdrawPickerBalance(user.id, Number(withdrawAmount));
      setIsProcessing(false);
      setWithdrawModalOpen(false);
      const msg = lang === "hi"
        ? `₹${Number(withdrawAmount).toLocaleString()} तुरंत आपके UPI खाते suresh@okaxis में भेज दिए गए हैं!`
        : `₹${Number(withdrawAmount).toLocaleString()} transferred instantly to suresh@okaxis via UPI!`;
      speak(msg);
      toast.success(msg);
      setWithdrawAmount("");
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Wallet className="h-6 w-6 text-emerald-600" />
            {t("wallet.title")}
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">{t("wallet.subtitle")}</p>
        </div>
        <Button onClick={() => setWithdrawModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5 rounded-xl shadow-xs text-xs h-10">
          <ArrowUpRight className="h-4 w-4" /> {t("wallet.withdraw")}
        </Button>
      </div>

      {/* Balance Card & Payout Details */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 text-white shadow-md border-0 rounded-2xl">
          <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
            <div>
              <div className="flex justify-between items-center text-xs uppercase tracking-wider text-slate-400 mb-1">
                <span>{lang === "hi" ? "उपलब्ध बैलेंस" : "Available Payout"}</span>
                <Badge variant="success" className="bg-emerald-500/20 text-emerald-400 text-[10px] border-none">
                  {lang === "hi" ? "सक्रिय" : "Active"}
                </Badge>
              </div>
              <div className="text-4xl font-black text-emerald-400">₹{balance.toLocaleString()}</div>
              <p className="text-xs text-slate-300 mt-1">
                {lang === "hi" ? "1-क्लिक में तुरंत बैंक खाते में ट्रांसफर योग्य।" : "Ready for 1-click transfer to your bank."}
              </p>
            </div>

            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-xs space-y-1">
              <div className="text-slate-400">{lang === "hi" ? "लिंक्ड यूपीआई आईडी:" : "Linked UPI VPA:"}</div>
              <div className="font-mono text-white font-bold flex items-center justify-between">
                <span>suresh@okaxis</span>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              </div>
            </div>

            <Button onClick={() => setWithdrawModalOpen(true)} className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black h-11 rounded-xl shadow-xs text-xs">
              {lang === "hi" ? "बैंक / UPI में ट्रांसफर करें" : "Transfer to Bank / UPI"}
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 shadow-xs border-slate-200 rounded-2xl bg-white">
          <CardHeader className="p-5 pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              {lang === "hi" ? "100% सीधी कमाई की गारंटी" : "100% Direct Payout Guarantee"}
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              {lang === "hi" ? "ReCircle Fair आपकी पूरी मेहनत की कमाई की सुरक्षा कैसे करता है" : "How ReCircle Fair protects your hard-earned money"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 grid sm:grid-cols-2 gap-4">
            <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100">
              <div className="text-2xl mb-1">⚡</div>
              <h4 className="font-bold text-emerald-950 text-sm mb-1">{lang === "hi" ? "शून्य प्लेटफॉर्म कमीशन" : "Zero Platform Cut"}</h4>
              <p className="text-xs text-emerald-800 leading-relaxed">
                {lang === "hi" ? "सफाई मित्रों से 0% कमीशन लिया जाता है। 100% उचित मूल्य सीधे आपको मिलता है।" : "ReCircle takes 0% commission from informal workers. 100% of fair value goes to you."}
              </p>
            </div>

            <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100">
              <div className="text-2xl mb-1">🏦</div>
              <h4 className="font-bold text-blue-950 text-sm mb-1">{lang === "hi" ? "रात 9 बजे स्वतः ऑटो-ट्रांसफर" : "Automatic 9:00 PM Sweep"}</h4>
              <p className="text-xs text-blue-800 leading-relaxed">
                {lang === "hi" ? "वॉलेट में बचा हुआ बैलेंस रोज़ रात को स्वतः आपके बैंक खाते में जमा हो जाता है।" : "Any leftover wallet balance is automatically cleared to your bank account every night."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card className="shadow-xs border-slate-200 rounded-2xl bg-white overflow-hidden">
        <CardHeader className="p-5 pb-3 border-b border-slate-100 bg-slate-50/60">
          <CardTitle className="text-base font-bold text-slate-900">{t("wallet.txHistory")}</CardTitle>
          <CardDescription className="text-xs text-slate-500">
            {lang === "hi" ? "सभी कमाई, टिप्स और बैंक ट्रांसफर का रीयल-टाइम ब्योरा" : "Real-time record of all earnings, tips, and bank transfers"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {transactions.map(tx => (
              <div key={tx.id} className="p-4 sm:p-5 flex justify-between items-center hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3.5">
                  <div className={`p-2.5 rounded-2xl ${tx.type === 'credit' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                    {tx.type === 'credit' ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{tx.description}</div>
                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                      <span>{tx.timestamp}</span>
                      <span>•</span>
                      <Badge variant="outline" className="text-[10px] uppercase font-mono bg-white rounded-lg">100% UPI</Badge>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-lg font-black ${tx.type === 'credit' ? 'text-emerald-600' : 'text-slate-900'}`}>
                    {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </div>
                  <div className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block font-semibold">
                    {lang === "hi" ? "सफल" : "Settled"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Withdrawal Modal */}
      {withdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-slate-900 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl">
                <ArrowUpRight className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">{t("wallet.withdraw")}</h3>
                <p className="text-xs text-slate-500">{lang === "hi" ? "पैसे सीधे आपके बैंक खाते में ट्रांसफर होंगे" : "Funds transfer directly to your bank account"}</p>
              </div>
            </div>

            <form onSubmit={handleWithdraw} className="space-y-4 text-sm">
              <div className="bg-slate-50 p-3 rounded-xl border text-xs">
                <div className="text-slate-500">{lang === "hi" ? "खाता विवरण:" : "Destination Account:"}</div>
                <div className="font-bold text-slate-900 font-mono text-sm mt-0.5">suresh@okaxis (State Bank of India)</div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  {lang === "hi" ? `राशि दर्ज करें (उपलब्ध: ₹${balance.toLocaleString()})` : `Enter Amount (Available: ₹${balance.toLocaleString()})`}
                </label>
                <Input
                  type="number"
                  min="10"
                  max={balance}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(Number(e.target.value) || "")}
                  placeholder="₹500"
                  required
                  className="rounded-xl text-base font-bold h-11"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[500, 1000, balance].map((amt) => (
                  <button
                    type="button"
                    key={amt}
                    onClick={() => setWithdrawAmount(amt)}
                    className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700"
                  >
                    ₹{amt.toLocaleString()}
                  </button>
                ))}
              </div>

              <div className="pt-2 flex gap-3">
                <Button type="button" variant="outline" className="flex-1 rounded-xl text-xs font-semibold" onClick={() => setWithdrawModalOpen(false)}>
                  {t("btn.cancel")}
                </Button>
                <Button type="submit" disabled={isProcessing} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs">
                  {isProcessing ? (lang === "hi" ? "प्रोसेसिंग..." : "Processing...") : (lang === "hi" ? "ट्रांसफर की पुष्टि करें" : "Confirm Payout")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SOS Button */}
      <SOSFloatingButton />
    </div>
  );
}