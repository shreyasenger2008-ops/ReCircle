"use client";

import { useAuth } from "@/lib/auth-context";
import { MOCK_REQUESTS, MOCK_PICKERS, MOCK_DISPUTES, PickupRequest } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Scale, AlertTriangle, TrendingUp, Users, MapPin, Banknote, ShieldAlert } from "lucide-react";
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
  Line
} from "recharts";

export default function FairnessAnalytics() {
  const { user } = useAuth();

  if (!user || user.role !== "admin") {
    return <div className="p-8">Unauthorized. Please log in as an Admin/NGO.</div>;
  }

  // --- KPI Calculations ---
  const completedPickups = MOCK_REQUESTS.filter(r => r.status === "completed" || r.status === "disputed");
  
  const totalPaid = completedPickups.reduce((sum, r) => sum + (r.finalPrice || r.estimatedPrice), 0);
  const totalWeight = completedPickups.reduce((sum, r) => sum + (r.finalWeight || r.estimatedWeight), 0);
  const avgPaymentPerKg = totalWeight > 0 ? (totalPaid / totalWeight) : 15; // fallback
  
  const disputeRate = (MOCK_DISPUTES.length / (MOCK_REQUESTS.length || 1)) * 100;
  const avgFairMatchScore = MOCK_PICKERS.reduce((sum, p) => sum + p.fairnessPriorityScore, 0) / (MOCK_PICKERS.length || 1);
  const underpaidAlertsCount = 12; // Mock

  // --- Charts Data ---
  const earningsDistribution = [
    { range: "< ₹500", count: 15 },
    { range: "₹500 - ₹1k", count: 45 },
    { range: "₹1k - ₹2k", count: 85 },
    { range: "₹2k - ₹3k", count: 32 },
    { range: "> ₹3k", count: 8 },
  ];

  const jobDistribution = [
    { picker: "Picker A", jobs: 12 },
    { picker: "Picker B", jobs: 18 },
    { picker: "Picker C", jobs: 15 },
    { picker: "Picker D", jobs: 42 }, // Outlier
    { picker: "Picker E", jobs: 14 },
    { picker: "Picker F", jobs: 10 },
  ];

  const areaDistribution = [
    { name: "Indiranagar", value: 35, color: "#3b82f6" },
    { name: "Koramangala", value: 25, color: "#eab308" },
    { name: "Whitefield", value: 20, color: "#10b981" },
    { name: "Jayanagar", value: 15, color: "#a855f7" },
    { name: "Other", value: 5, color: "#64748b" },
  ];

  const fairnessTrend = [
    { day: "Mon", score: 72 },
    { day: "Tue", score: 75 },
    { day: "Wed", score: 71 },
    { day: "Thu", score: 82 }, // Algorithm update
    { day: "Fri", score: 85 },
    { day: "Sat", score: 88 },
    { day: "Sun", score: 91 },
  ];

  // --- Unfair Matches Table Logic ---
  // We'll generate a list mixing real MOCK_REQUESTS that flag conditions, plus some mock ones to ensure the table isn't empty.
  
  type UnfairMatch = { id: string; picker: string; generator: string; issue: string; severity: "high" | "medium" | "low" };
  
  const flaggedMatches: UnfairMatch[] = [];
  
  MOCK_REQUESTS.forEach(req => {
    if (req.status === "disputed") {
      flaggedMatches.push({ id: req.id, picker: req.pickerName || "Unassigned", generator: req.generatorName, issue: "Active Dispute", severity: "high" });
    }
    else if (req.finalPrice && req.finalPrice < req.estimatedPrice * 0.7) {
      flaggedMatches.push({ id: req.id, picker: req.pickerName || "Unknown", generator: req.generatorName, issue: "Payment severely below estimate", severity: "high" });
    }
    else if (req.finalWeight && req.finalPrice && (req.finalPrice / req.finalWeight) < 5) {
      flaggedMatches.push({ id: req.id, picker: req.pickerName || "Unknown", generator: req.generatorName, issue: "Final payment doesn't match weight", severity: "medium" });
    }
  });

  // Add some mock ones
  flaggedMatches.push(
    { id: "req992", picker: "Raju", generator: "Tech Park A", issue: "Picker has 40+ jobs this week (Monopoly Risk)", severity: "medium" },
    { id: "req993", picker: "Kavitha", generator: "Apartment B", issue: "Payment below local minimum wage threshold", severity: "high" }
  );

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Scale className="h-6 w-6 text-purple-600" />
          Fairness Analytics
        </h2>
        <p className="text-slate-500">Monitor wealth distribution, algorithmic matching health, and worker exploitation risks.</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm border-t-4 border-t-purple-500">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Avg Fair Match Score</p>
            <div className="flex items-end gap-2">
              <h3 className="text-3xl font-black text-purple-700">{avgFairMatchScore.toFixed(1)}</h3>
              <span className="text-sm font-medium text-purple-600 mb-1">/ 100</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-t-4 border-t-green-500">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Avg Payment</p>
            <div className="flex items-end gap-2">
              <h3 className="text-3xl font-black text-green-700">₹{avgPaymentPerKg.toFixed(1)}</h3>
              <span className="text-sm font-medium text-green-600 mb-1">per kg</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-t-4 border-t-red-500 bg-red-50">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-red-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" /> Underpaid Alerts
            </p>
            <h3 className="text-3xl font-black text-red-700">{underpaidAlertsCount}</h3>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-t-4 border-t-orange-500">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Dispute Rate</p>
            <div className="flex items-end gap-2">
              <h3 className="text-3xl font-black text-orange-600">{disputeRate.toFixed(1)}%</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* Earnings Distribution */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-md flex items-center gap-2"><Banknote className="h-4 w-4 text-green-600"/> Weekly Earnings Distribution</CardTitle>
            <CardDescription>Number of pickers in each income bracket</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={earningsDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Job Distribution (Monopoly Risk) */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-md flex items-center gap-2"><Users className="h-4 w-4 text-blue-600"/> Job Distribution</CardTitle>
            <CardDescription>Jobs assigned per picker (Detecting monopolies)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={jobDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="picker" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="jobs" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50}>
                    {jobDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.jobs > 30 ? '#ef4444' : '#3b82f6'} /> // Highlight outliers in red
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Area Distribution */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-md flex items-center gap-2"><MapPin className="h-4 w-4 text-orange-500"/> Area-wise Demand</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={areaDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {areaDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-3 w-full">
              {areaDistribution.map((entry) => (
                <div key={entry.name} className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                  {entry.name}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Fairness Match Score Trend */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-md flex items-center gap-2"><TrendingUp className="h-4 w-4 text-purple-600"/> Fair Match Score Trend</CardTitle>
            <CardDescription>System-wide average score over 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={fairnessTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis domain={[50, 100]} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Line type="monotone" dataKey="score" stroke="#a855f7" strokeWidth={3} dot={{r: 4, fill: '#a855f7'}} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Potentially Unfair Matches Table */}
      <Card className="shadow-md border-red-200">
        <CardHeader className="bg-red-50 border-b border-red-100">
          <CardTitle className="text-red-900 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-red-600" />
            Potentially Unfair Matches
          </CardTitle>
          <CardDescription className="text-red-700">
            Pickups flagged by the algorithm for review (underpayment, monopolies, weight mismatches, or active disputes).
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                <tr>
                  <th className="px-6 py-4 font-semibold">Pickup ID</th>
                  <th className="px-6 py-4 font-semibold">Generator</th>
                  <th className="px-6 py-4 font-semibold">Picker</th>
                  <th className="px-6 py-4 font-semibold">Flag Reason</th>
                  <th className="px-6 py-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {flaggedMatches.map((match, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">#{match.id.replace('req', '')}</td>
                    <td className="px-6 py-4 text-slate-600">{match.generator}</td>
                    <td className="px-6 py-4 text-slate-600">{match.picker}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        match.severity === 'high' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {match.issue}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-blue-600 hover:text-blue-900 font-medium text-xs">Review</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}