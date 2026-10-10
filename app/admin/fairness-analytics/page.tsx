"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { MOCK_REQUESTS, MOCK_PICKERS, MOCK_DISPUTES, PickupRequest } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Scale, AlertTriangle, TrendingUp, Users, MapPin, Banknote, ShieldAlert, Sparkles, X, CheckCircle2, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from "recharts";
import { formatCurrency } from "@/lib/formatters";

export default function FairnessAnalytics() {
  const { user } = useAuth();
  const [showUnderpaidModal, setShowUnderpaidModal] = useState(false);

  if (!user || user.role !== "admin") {
    return <div className="p-8 text-center text-slate-900 font-bold">Unauthorized. Please log in as an Admin/NGO.</div>;
  }

  // --- KPI Calculations ---
  const completedPickups = MOCK_REQUESTS.filter(r => r.status === "completed" || r.status === "disputed");
  
  const totalPaid = completedPickups.reduce((sum, r) => sum + (r.finalPrice || r.estimatedPrice || 0), 0);
  const totalWeight = completedPickups.reduce((sum, r) => sum + (r.finalWeight || r.estimatedWeight || 0), 0);
  const avgPaymentPerKg = totalWeight > 0 ? (totalPaid / totalWeight) : 24.5;
  
  const disputeRate = (MOCK_DISPUTES.length / (MOCK_REQUESTS.length || 1)) * 100;
  const avgFairMatchScore = MOCK_PICKERS.reduce((sum, p) => sum + p.fairnessPriorityScore, 0) / (MOCK_PICKERS.length || 1);
  const underpaidAlertsCount = 2;

  // --- Charts Data ---
  const earningsDistribution = [
    { range: "< ₹500", count: 15 },
    { range: "₹500 - ₹1k", count: 45 },
    { range: "₹1k - ₹2k", count: 85 },
    { range: "₹2k - ₹3k", count: 32 },
    { range: "> ₹3k", count: 8 },
  ];

  const jobDistribution = [
    { picker: "Suresh K.", jobs: 18 },
    { picker: "Ramesh M.", jobs: 15 },
    { picker: "Kavitha R.", jobs: 14 },
    { picker: "Muniswamy", jobs: 12 },
    { picker: "Anand P.", jobs: 10 },
    { picker: "Raju B. (Flagged)", jobs: 42 }, // Outlier
  ];

  const areaDistribution = [
    { name: "Ward 150 (Bellandur)", value: 35, color: "#3b82f6" },
    { name: "Ward 151 (Koramangala)", value: 25, color: "#eab308" },
    { name: "Ward 152 (Indiranagar)", value: 20, color: "#10b981" },
    { name: "Ward 174 (HSR Layout)", value: 15, color: "#a855f7" },
    { name: "Ward 175 (BTM Layout)", value: 5, color: "#64748b" },
  ];

  const fairnessTrend = [
    { day: "Mon", score: 72, target: 80 },
    { day: "Tue", score: 75, target: 80 },
    { day: "Wed", score: 78, target: 80 },
    { day: "Thu", score: 82, target: 80 },
    { day: "Fri", score: 85, target: 80 },
    { day: "Sat", score: 88, target: 80 },
    { day: "Sun", score: 91, target: 80 },
  ];

  type UnfairMatch = { id: string; picker: string; generator: string; issue: string; severity: "high" | "medium" | "low"; amount: number };
  
  const flaggedMatches: UnfairMatch[] = [
    { id: "req2", picker: "Suresh Kumar", generator: "Anjali Gupta (Indiranagar)", issue: "Weight calibration dispute raised", severity: "high", amount: 180 },
    { id: "req992", picker: "Raju B.", generator: "Tech Park Block C", issue: "Picker has 42 jobs this week (Monopoly Risk)", severity: "medium", amount: 1420 },
    { id: "req993", picker: "Kavitha R.", generator: "Lakeview Apartments", issue: "Payment ₹14/kg fell below floor benchmark ₹18/kg", severity: "high", amount: 210 }
  ];

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Scale className="h-6 w-6 text-purple-600" />
            Fairness & Anti-Monopoly Analytics
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">Algorithmic equity monitoring, Gini coefficient optimization, and exploitation protection.</p>
        </div>
        <Badge variant="outline" className="border-purple-300 bg-purple-50 text-purple-800 text-xs py-1.5 px-3 font-bold rounded-xl">
          📊 Ethical AI Engine v2.4 Active
        </Badge>
      </div>

      {/* Gini Coefficient Before vs After Comparison Card */}
      <Card className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 text-white rounded-3xl shadow-lg border-0 overflow-hidden">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-7 space-y-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <Sparkles className="h-4 w-4" />
                </span>
                <span className="text-xs uppercase tracking-wider font-bold text-emerald-400">Wealth Equity Benchmark</span>
              </div>
              <h3 className="text-2xl font-black text-white">Gini Coefficient Disparity Index</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                The Gini index measures economic inequality (0.0 = perfect equality, 1.0 = total monopoly). Our ethical dispatch algorithm guarantees fair job rotation to historically under-earning waste pickers.
              </p>
              <div className="flex items-center gap-4 pt-2">
                <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Without Algorithm (Mandi Middlemen)</div>
                  <div className="text-2xl font-black text-rose-400 font-mono mt-0.5">0.62 <span className="text-xs font-normal text-slate-400">(Severe Inequality)</span></div>
                </div>
                <div className="text-emerald-400 font-bold text-xl">➔</div>
                <div className="p-3 bg-emerald-950/80 rounded-2xl border border-emerald-500/40">
                  <div className="text-[10px] uppercase font-bold text-emerald-300">With ReCircle Fair-Match</div>
                  <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">0.28 <span className="text-xs font-normal text-emerald-300 font-semibold">(Equitable Wealth)</span></div>
                </div>
              </div>
            </div>

            <div className="md:col-span-5 bg-slate-800/60 p-5 rounded-2xl border border-slate-700 text-center space-y-2">
              <div className="text-3xl font-black text-emerald-400">54.8%</div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-200">Inequality Reduction</div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Ensures no single waste-picker receives more than 30 jobs/week while vulnerable collectors are prioritized for high-margin routes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-xs border-slate-200 rounded-2xl bg-white">
          <CardContent className="p-5">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Avg Fair Match Score</p>
            <div className="flex items-end gap-2">
              <h3 className="text-3xl font-black text-purple-700">{avgFairMatchScore.toFixed(1)}</h3>
              <span className="text-xs font-bold text-purple-600 mb-1">/ 100</span>
            </div>
            <span className="text-[11px] text-slate-400">Platform-wide algorithmic health</span>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-slate-200 rounded-2xl bg-white">
          <CardContent className="p-5">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Avg Worker Floor Payout</p>
            <div className="flex items-end gap-2">
              <h3 className="text-3xl font-black text-emerald-600">₹{avgPaymentPerKg.toFixed(1)}</h3>
              <span className="text-xs font-bold text-emerald-600 mb-1">/ kg</span>
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold">+33% above local middleman mandi</span>
          </CardContent>
        </Card>

        {/* Clickable Underpaid Alerts Card */}
        <Card 
          onClick={() => setShowUnderpaidModal(true)}
          className="shadow-xs border-rose-200 rounded-2xl bg-rose-50/70 hover:bg-rose-100/70 hover:shadow-md transition-all cursor-pointer group"
        >
          <CardContent className="p-5">
            <p className="text-xs font-bold text-rose-800 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5"><AlertTriangle className="h-4 w-4 text-rose-600" /> Underpaid Alerts</span>
              <span className="text-[10px] bg-rose-200 text-rose-800 px-1.5 py-0.5 rounded font-bold group-hover:bg-rose-300">View List</span>
            </p>
            <h3 className="text-3xl font-black text-rose-600">{underpaidAlertsCount}</h3>
            <span className="text-[11px] text-rose-700 font-medium">Click to review flagged transactions</span>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-slate-200 rounded-2xl bg-white">
          <CardContent className="p-5">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Dispute Rate</p>
            <div className="flex items-end gap-2">
              <h3 className="text-3xl font-black text-amber-600">{disputeRate.toFixed(1)}%</h3>
            </div>
            <span className="text-[11px] text-slate-400">Within ethical &lt; 5% tolerance</span>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* Earnings Distribution */}
        <Card className="shadow-xs border-slate-200 rounded-2xl bg-white overflow-hidden">
          <CardHeader className="p-5 pb-2 border-b border-slate-100">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Banknote className="h-4 w-4 text-emerald-600"/> Weekly Earnings Distribution
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">Pickers across income brackets (Healthy bell-curve without poverty clusters)</CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={earningsDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}} 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }} 
                    formatter={(val) => [`${val} Pickers`, "Active Workers"]}
                  />
                  <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={45} label={{ position: 'top', fill: '#059669', fontSize: 11, fontWeight: 'bold' }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Job Distribution (Monopoly Risk) */}
        <Card className="shadow-xs border-slate-200 rounded-2xl bg-white overflow-hidden">
          <CardHeader className="p-5 pb-2 border-b border-slate-100">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600"/> Job Distribution & Monopoly Detection
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">Weekly jobs per worker (Outliers above 30 flagged in red)</CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={jobDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="picker" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}} 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }} 
                    formatter={(val) => [`${val} Pickups`, "Weekly Jobs"]}
                  />
                  <Bar dataKey="jobs" radius={[6, 6, 0, 0]} maxBarSize={45} label={{ position: 'top', fill: '#475569', fontSize: 11, fontWeight: 'bold' }}>
                    {jobDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.jobs > 30 ? '#ef4444' : '#3b82f6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Area Distribution with Legend */}
        <Card className="shadow-xs border-slate-200 rounded-2xl bg-white overflow-hidden">
          <CardHeader className="p-5 pb-2 border-b border-slate-100">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-amber-500"/> Ward-Wise Recycling Demand Share
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">Distribution of recycling requests by municipal ward</CardDescription>
          </CardHeader>
          <CardContent className="p-5 flex flex-col items-center">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={areaDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {areaDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }} 
                    formatter={(val) => [`${val}%`, "Share of City Pickups"]}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    formatter={(value) => <span className="text-xs font-semibold text-slate-700">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Fairness Match Score Trend with Target Line */}
        <Card className="shadow-xs border-slate-200 rounded-2xl bg-white overflow-hidden">
          <CardHeader className="p-5 pb-2 border-b border-slate-100">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600"/> Fair Match Score 7-Day Trend
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">Algorithmic fairness compliance vs NGO ethical baseline (80/100)</CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={fairnessTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis domain={[50, 100]} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }} 
                    formatter={(val, name) => [val, name === "score" ? "Fairness Score" : "Ethical Target"]}
                  />
                  <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={3} dot={{r: 4, fill: '#8b5cf6'}} activeDot={{r: 6}} name="Score" />
                  <Line type="monotone" dataKey="target" stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={2} dot={false} name="Target" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Potentially Unfair Matches Table */}
      <Card className="shadow-xs border-rose-200 rounded-2xl bg-white overflow-hidden">
        <CardHeader className="p-5 pb-3 bg-rose-50/70 border-b border-rose-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-rose-950 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-rose-600" />
              Flagged Unfair Matches & Exploitation Alerts
            </CardTitle>
            <CardDescription className="text-xs text-rose-700">
              Pickups intercepted by the ethical engine (underpayment, monopoly hoarding, or dispute rate anomalies)
            </CardDescription>
          </div>
          <Button 
            size="sm" 
            onClick={() => setShowUnderpaidModal(true)} 
            className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold"
          >
            Review All Flagged ({flaggedMatches.length})
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                <tr>
                  <th className="px-6 py-4 font-bold">Pickup ID</th>
                  <th className="px-6 py-4 font-bold">Generator</th>
                  <th className="px-6 py-4 font-bold">Picker</th>
                  <th className="px-6 py-4 font-bold">Flag Reason</th>
                  <th className="px-6 py-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {flaggedMatches.map((match, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">#{match.id.replace('req', '')}</td>
                    <td className="px-6 py-4 text-xs text-slate-700">{match.generator}</td>
                    <td className="px-6 py-4 text-xs text-slate-900 font-bold">{match.picker}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        match.severity === 'high' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {match.issue}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => setShowUnderpaidModal(true)} 
                        className="text-xs font-bold rounded-lg border-slate-200"
                      >
                        Investigate
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Underpaid Alerts Detail Modal */}
      {showUnderpaidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <span className="text-[11px] uppercase font-bold text-rose-600 tracking-wider">Ethical Compliance Audit</span>
                <h3 className="text-lg font-bold text-slate-900">Underpaid & Exploitation Alert Dossier</h3>
              </div>
              <button onClick={() => setShowUnderpaidModal(false)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              {flaggedMatches.map((item) => (
                <div key={item.id} className="p-4 rounded-2xl border border-rose-200 bg-rose-50/40 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-xs text-rose-900">Pickup #{item.id}</span>
                    <Badge variant="outline" className={`text-[10px] font-bold uppercase ${
                      item.severity === "high" ? "bg-rose-100 text-rose-800 border-rose-300" : "bg-amber-100 text-amber-800 border-amber-300"
                    }`}>
                      {item.severity} Risk
                    </Badge>
                  </div>
                  <div className="text-xs font-bold text-slate-900">{item.issue}</div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1 border-t border-rose-100">
                    <div>Generator: <strong>{item.generator}</strong></div>
                    <div>Picker: <strong>{item.picker}</strong></div>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs text-slate-500">Transaction Value: <strong className="text-slate-900 font-mono">₹{item.amount}</strong></span>
                    <Button size="sm" className="bg-slate-900 text-white rounded-lg text-xs h-7">
                      Adjust Wage & Disburse
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t">
              <Button variant="outline" onClick={() => setShowUnderpaidModal(false)} className="rounded-xl text-xs">
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}