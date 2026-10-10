"use client";

import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { usePlatformData } from "@/lib/platform-data-context";
import { MOCK_PICKERS, MOCK_PAYMENTS, MOCK_REQUESTS } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Banknote, TrendingUp, Calendar, Wallet, History } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import SOSFloatingButton from "@/components/SOSFloatingButton";

import { formatCurrency, formatDate } from "@/lib/formatters";

export default function EarningsDashboard() {
  const { user } = useAuth();
  const { lang, t } = useLanguage();
  const { pickers, payments, requests } = usePlatformData();

  if (!user || user.role !== "picker") {
    return <div className="p-8 text-center text-slate-900 font-bold">Unauthorized. Please log in as a Waste-Picker.</div>;
  }

  const pickerProfile = pickers.find(p => p.userId === user.id || p.id === user.id) || pickers[0];

  // Completed Requests and new earnings
  const completedNewPickups = requests.filter(r => 
    (r.matchedPickerId === user.id || r.pickerName === user.name || user.id === "p1") && 
    r.status === "completed" && 
    !["req1", "req2"].includes(r.id)
  );
  const extraEarned = completedNewPickups.reduce((sum, r) => sum + (r.finalPrice || r.payoutAmount || 0), 0);

  // Calculate Metrics
  const dailyEarnings = (pickerProfile?.dailyEarnings || 450) + extraEarned;
  const weeklyEarnings = (pickerProfile?.weeklyEarnings || 2800) + extraEarned;
  const monthlyEarnings = weeklyEarnings * 4;
  const totalCompletedPickups = (pickerProfile?.completedJobsToday || 3) + completedNewPickups.length;
  const avgEarnings = totalCompletedPickups > 0 ? (dailyEarnings / totalCompletedPickups) : 150;

  const chartData = [
    { name: lang === "hi" ? "सोम" : "Mon", earnings: 450 },
    { name: lang === "hi" ? "मंगल" : "Tue", earnings: 600 },
    { name: lang === "hi" ? "बुध" : "Wed", earnings: 320 },
    { name: lang === "hi" ? "गुरु" : "Thu", earnings: 480 },
    { name: lang === "hi" ? "शुक्र" : "Fri", earnings: 500 },
    { name: lang === "hi" ? "शनि" : "Sat", earnings: dailyEarnings },
  ];

  // Payments History (100% UPI)
  const paymentHistory = [...payments.filter(p => p.receiverId === user.id || p.receiverId === "p1"), ...MOCK_PAYMENTS.filter(p => p.receiverId === user.id || p.receiverId === "p1")];

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <h2 className="text-2xl font-bold text-slate-900">{t("nav.earnings")}</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          {lang === "hi" ? "अपनी दैनिक आय, भुगतान और वित्तीय प्रगति का ब्योरा देखें।" : "Track your daily income, payouts, and financial growth."}
        </p>
      </div>

      {/* Income Improvement Insight Card */}
      <Card className="bg-gradient-to-r from-emerald-800 to-teal-700 text-white shadow-md border-0 rounded-2xl">
        <CardContent className="p-5 sm:p-6 flex items-start gap-4">
          <div className="bg-white/20 p-3 rounded-2xl hidden sm:block">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-base mb-1 flex items-center gap-2 text-emerald-300">
              <TrendingUp className="h-5 w-5 sm:hidden" /> {lang === "hi" ? "शानदार प्रगति!" : "Great Progress!"}
            </h3>
            <p className="text-emerald-50 text-xs sm:text-sm leading-relaxed">
              {lang === "hi"
                ? "फेयर फ्लोर रेट और डाउनहिल रूट क्लस्टरिंग के कारण इस सप्ताह आपकी आय 18% अधिक रही है।"
                : "Your income this week is 18% higher because of fair route grouping and transparent pricing."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-xs border-slate-200 rounded-2xl bg-white">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">{t("dash.todayEarnings")}</p>
                <h3 className="text-2xl font-bold text-slate-900">₹{dailyEarnings.toFixed(0)}</h3>
              </div>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <Banknote className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-xs border-slate-200 rounded-2xl bg-white">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">{t("dash.weeklyEarnings")}</p>
                <h3 className="text-2xl font-bold text-slate-900">₹{weeklyEarnings.toFixed(0)}</h3>
              </div>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Calendar className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-slate-200 rounded-2xl bg-white">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">{lang === "hi" ? "मासिक अनुमानित" : "Monthly (Est)"}</p>
                <h3 className="text-2xl font-bold text-slate-900">₹{monthlyEarnings.toFixed(0)}</h3>
              </div>
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                <Wallet className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-slate-200 rounded-2xl bg-white">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">{lang === "hi" ? "औसत / पिकअप" : "Avg / Pickup"}</p>
                <h3 className="text-2xl font-bold text-slate-900">₹{avgEarnings.toFixed(0)}</h3>
              </div>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-xs border-slate-200 rounded-2xl bg-white">
            <CardHeader className="p-5 pb-2">
              <CardTitle className="text-base font-bold text-slate-900">
                {lang === "hi" ? "साप्ताहिक आय प्रवृत्ति" : "Weekly Income Trend"}
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                {lang === "hi" ? "पिछले 7 दिनों में आपकी दैनिक कमाई का विवरण" : "Your daily earnings breakdown over the past 7 days."}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <div className="h-64 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(val) => `₹${val}`} />
                    <Tooltip 
                      cursor={{fill: '#f8fafc'}}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value) => [`₹${value}`, lang === "hi" ? "कमाई" : "Earnings"]}
                    />
                    <Bar dataKey="earnings" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={44} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment History sidebar */}
        <div className="space-y-6">
          <Card className="shadow-xs border-slate-200 rounded-2xl bg-white overflow-hidden">
            <CardHeader className="p-5 pb-3 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900">
                <History className="h-4 w-4 text-emerald-600" /> 
                {lang === "hi" ? "हाल के भुगतान" : "Payment History"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {paymentHistory.slice(0, 5).map((p: any) => (
                  <div key={p.id} className="p-3.5 flex justify-between items-center text-xs">
                    <div>
                      <div className="font-bold text-slate-800">
                        {p.method === 'cash' ? (lang === "hi" ? "नकद भुगतान" : "Cash Payout") : "UPI Payout"}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(p.paidAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-emerald-600">₹{p.amount}</div>
                      <div className="text-[10px] text-slate-400 uppercase">{p.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <SOSFloatingButton />
    </div>
  );
}