"use client";

import { useAuth } from "@/lib/auth-context";
import { MOCK_PICKERS, MOCK_PAYMENTS, MOCK_REQUESTS } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Banknote, TrendingUp, Calendar, Wallet, CreditCard, Clock, History, AlertCircle } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";

const chartData = [
  { name: "Mon", earnings: 450 },
  { name: "Tue", earnings: 600 },
  { name: "Wed", earnings: 320 },
  { name: "Thu", earnings: 850 },
  { name: "Fri", earnings: 500 },
  { name: "Sat", earnings: 920 },
  { name: "Sun", earnings: 400 },
];

export default function EarningsDashboard() {
  const { user } = useAuth();

  if (!user || user.role !== "picker") {
    return <div className="p-8">Unauthorized. Please log in as a Waste-Picker.</div>;
  }

  const pickerProfile = MOCK_PICKERS.find(p => p.userId === user.id);
  if (!pickerProfile) {
    return <div className="p-8">Picker profile not found.</div>;
  }

  // Calculate Metrics
  const dailyEarnings = pickerProfile.dailyEarnings;
  const weeklyEarnings = pickerProfile.weeklyEarnings;
  const monthlyEarnings = weeklyEarnings * 4.2; // Rough mock calculation
  const totalCompletedPickups = pickerProfile.completedJobsToday + 24; // Mock total historical jobs
  const avgEarnings = totalCompletedPickups > 0 ? (weeklyEarnings * 2) / totalCompletedPickups : 0;

  // Pending Payments Logic
  const myCompletedRequests = MOCK_REQUESTS.filter(r => r.matchedPickerId === user.id && r.status === "completed");
  const myCompletedPayments = MOCK_PAYMENTS.filter(p => p.receiverId === user.id && p.status === "completed");
  const myCompletedPaymentsTotal = myCompletedPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalEarnedFromPickups = myCompletedRequests.reduce((sum, r) => sum + (r.finalPrice || r.payoutAmount), 0);
  
  const pendingPaymentsAmount = Math.max(0, totalEarnedFromPickups - myCompletedPaymentsTotal);

  // Extend mock history just for UI display
  const paymentHistory = [
    ...myCompletedPayments,
    { id: "mock1", pickupId: "req-mock-1", payerId: "g2", receiverId: user.id, amount: 450, method: "cash", status: "completed", paidAt: new Date(Date.now() - 86400000 * 1).toISOString() },
    { id: "mock2", pickupId: "req-mock-2", payerId: "g1", receiverId: user.id, amount: 320, method: "upi", status: "completed", paidAt: new Date(Date.now() - 86400000 * 2).toISOString() },
    { id: "mock3", pickupId: "req-mock-3", payerId: "g3", receiverId: user.id, amount: 600, method: "upi", status: "completed", paidAt: new Date(Date.now() - 86400000 * 3).toISOString() },
  ].sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime());

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Earnings Dashboard</h2>
        <p className="text-slate-500">Track your daily income, payouts, and financial growth.</p>
      </div>

      {/* Income Improvement Insight Card */}
      <Card className="bg-gradient-to-r from-green-600 to-emerald-500 text-white shadow-md border-0">
        <CardContent className="p-6 flex items-start gap-4">
          <div className="bg-white/20 p-3 rounded-full hidden sm:block">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 sm:hidden" /> Great Progress!
            </h3>
            <p className="text-emerald-50 text-sm sm:text-base leading-relaxed">
              Your income this week is <strong>18% higher</strong> because of fair route grouping and transparent pricing.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-sm border-slate-200">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-500 mb-1">Today's Earnings</p>
                <h3 className="text-2xl font-bold text-slate-900">₹{dailyEarnings.toFixed(0)}</h3>
              </div>
              <Banknote className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-slate-200">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-500 mb-1">Weekly Earnings</p>
                <h3 className="text-2xl font-bold text-slate-900">₹{weeklyEarnings.toFixed(0)}</h3>
              </div>
              <Calendar className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-500 mb-1">Monthly (Est)</p>
                <h3 className="text-2xl font-bold text-slate-900">₹{monthlyEarnings.toFixed(0)}</h3>
              </div>
              <Wallet className="h-5 w-5 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-500 mb-1">Avg / Pickup</p>
                <h3 className="text-2xl font-bold text-slate-900">₹{avgEarnings.toFixed(0)}</h3>
              </div>
              <TrendingUp className="h-5 w-5 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Chart Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Weekly Income Trend</CardTitle>
              <CardDescription>Your daily earnings breakdown over the past 7 days.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(val) => `₹${val}`} />
                    <Tooltip 
                      cursor={{fill: '#f1f5f9'}}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value) => [`₹${value}`, "Earnings"]}
                    />
                    <Bar dataKey="earnings" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 border-b">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center gap-2">
                  <History className="h-5 w-5 text-slate-500" /> 
                  Payment History
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {paymentHistory.map(pay => (
                  <div key={pay.id} className="p-4 sm:p-5 flex justify-between items-center hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${pay.method === 'upi' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                        {pay.method === 'upi' ? <CreditCard className="h-5 w-5" /> : <Banknote className="h-5 w-5" />}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">Pickup #{pay.pickupId.replace('req', '')}</div>
                        <div className="text-xs sm:text-sm text-slate-500 flex flex-col sm:flex-row sm:gap-2">
                          <span>{new Date(pay.paidAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                          <span className="hidden sm:inline text-slate-300">•</span>
                          <span className="uppercase">{pay.method}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">+₹{pay.amount.toFixed(0)}</div>
                      <div className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full inline-block mt-1">Paid</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar: Pending & Wallet Actions */}
        <div className="space-y-6">
          <Card className="border-orange-200 shadow-sm overflow-hidden">
            <div className="bg-orange-50 p-4 border-b border-orange-100 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
              <div>
                <h3 className="font-bold text-orange-900">Pending Payments</h3>
                <p className="text-sm text-orange-700 mt-1">Funds from completed jobs that have not been settled yet.</p>
              </div>
            </div>
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-black text-orange-600 mb-2">
                ₹{pendingPaymentsAmount.toFixed(0)}
              </div>
              <p className="text-xs text-slate-500 mb-6">Will be settled to your UPI directly.</p>
              
              <Button className="w-full bg-slate-900 hover:bg-slate-800">
                Request Instant Settlement
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-lg">Income Security Info</CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="flex gap-3 items-start">
                <div className="bg-slate-100 p-2 rounded shrink-0"><Banknote className="h-4 w-4 text-slate-600" /></div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">100% Fair Wage Guarantee</h4>
                  <p className="text-xs text-slate-500 mt-1">ReCircle does not take any commission from your earnings. 100% of the calculated fair price goes to you.</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="bg-slate-100 p-2 rounded shrink-0"><Clock className="h-4 w-4 text-slate-600" /></div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Same-day Payouts</h4>
                  <p className="text-xs text-slate-500 mt-1">All pending UPI payments are automatically cleared at 9:00 PM every day.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}