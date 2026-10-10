"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/lib/auth-context";
import { usePlatformData } from "@/lib/platform-data-context";
import { CITY_WIDE_STATS } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/formatters";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, ShieldCheck, Truck, Leaf, Banknote, AlertTriangle, Scale, Activity, ArrowRight, 
  TrendingUp, MapPin, BarChart3, ChevronRight 
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const AdminWardMap = dynamic(() => import("@/components/AdminWardMap"), {
  ssr: false,
  loading: () => (
    <div className="h-72 w-full rounded-xl bg-slate-100 animate-pulse flex items-center justify-center text-slate-400 text-xs font-semibold">
      Loading Ward Activity Map...
    </div>
  ),
});

const PICKUP_TREND_DATA = [
  { day: "Mon", pickups: 42, volumeKg: 480 },
  { day: "Tue", pickups: 56, volumeKg: 620 },
  { day: "Wed", pickups: 49, volumeKg: 510 },
  { day: "Thu", pickups: 68, volumeKg: 790 },
  { day: "Fri", pickups: 74, volumeKg: 850 },
  { day: "Sat", pickups: 92, volumeKg: 1050 },
  { day: "Sun", pickups: 85, volumeKg: 940 },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const { requests, disputes, pickers, users } = usePlatformData();
  const [trendMetric, setTrendMetric] = useState<"pickups" | "volumeKg">("pickups");

  if (!user || user.role !== "admin") {
    return <div className="p-8 text-center text-slate-900 font-bold">Unauthorized. Please log in as an Admin/NGO.</div>;
  }

  // Calculate System-Wide Metrics from real-time store
  const totalUsers = users.length + 1250;
  const verifiedPickers = pickers.length;
  const totalPickups = requests.length + CITY_WIDE_STATS.totalPickups;
  const wasteRecycled = CITY_WIDE_STATS.totalKgRecycled + requests.reduce((sum, r) => sum + (r.finalWeight || r.estimatedWeight || 0), 0);
  const fairIncomeGenerated = CITY_WIDE_STATS.totalWealthDisbursed + requests.reduce((sum, r) => sum + (r.finalPrice || r.estimatedPrice || 0), 0);
  const activeDisputes = disputes.filter(d => d.status === "open").length;
  const avgFairnessScore = 89;

  // Recent Platform Activity Feed
  const recentActivity = [
    { id: 1, type: 'pickup', title: "Pickup Completed", desc: "Rajesh (Generator) & Suresh (Picker) completed 10.5 kg dry recyclables.", time: "10 mins ago", icon: Truck, color: "text-emerald-600", bg: "bg-emerald-100" },
    { id: 2, type: 'payment', title: "Fair Wage Disbursed", desc: "₹368 routed directly to Suresh via instant 100% UPI payout.", time: "12 mins ago", icon: Banknote, color: "text-purple-600", bg: "bg-purple-100" },
    { id: 3, type: 'user', title: "New Picker Verified", desc: "Suresh's background & municipal ID check approved. Status: Verified.", time: "1 hour ago", icon: ShieldCheck, color: "text-blue-600", bg: "bg-blue-100" },
    { id: 4, type: 'dispute', title: "Dispute Escalated", desc: "Weight calibration review requested on #req2 (Indiranagar).", time: "3 hours ago", icon: AlertTriangle, color: "text-rose-600", bg: "bg-rose-100" },
    { id: 5, type: 'impact', title: "Milestone Reached", desc: "Platform crossed 125,000 kg of total recycled waste in Ward 150!", time: "5 hours ago", icon: Leaf, color: "text-emerald-600", bg: "bg-emerald-100" },
  ];

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Admin Executive Overview</h2>
          <p className="text-sm text-slate-500 mt-0.5">Platform health, ethical algorithmic operations, and direct worker wealth disbursal.</p>
        </div>
        <Badge variant="outline" className="border-purple-300 bg-purple-50 text-purple-800 text-xs py-1.5 px-3 font-bold rounded-xl">
          🏛️ City-Wide Municipal Aggregates (Ward 150 Projected)
        </Badge>
      </div>

      {/* Top Priority Cards (Clickable) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <Link href="/admin/fairness-analytics" className="block group">
          <Card className="bg-slate-900 text-white shadow-md border-0 rounded-2xl transition-all group-hover:scale-[1.02] group-hover:ring-2 group-hover:ring-emerald-400">
            <CardContent className="p-5 flex justify-between items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                  Fair Wealth Disbursed <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </p>
                <h3 className="text-2xl font-bold text-emerald-400">{formatCurrency(fairIncomeGenerated, true)}</h3>
                <span className="text-[11px] text-slate-400">100% direct worker pay</span>
              </div>
              <div className="bg-slate-800 p-3 rounded-2xl hidden sm:block">
                <Banknote className="h-6 w-6 text-emerald-400" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/impact-reports" className="block group">
          <Card className="shadow-xs border-t-4 border-t-emerald-500 rounded-2xl transition-all group-hover:scale-[1.02] group-hover:shadow-md">
            <CardContent className="p-5 flex justify-between items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                  Waste Recycled <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-600" />
                </p>
                <h3 className="text-2xl font-bold text-slate-900">{(wasteRecycled / 1000).toFixed(1)}k <span className="text-sm font-normal text-slate-500">kg</span></h3>
                <span className="text-[11px] text-emerald-600 font-semibold">Zero-landfill diversion</span>
              </div>
              <div className="bg-emerald-50 p-3 rounded-full hidden sm:block">
                <Leaf className="h-6 w-6 text-emerald-600" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/users" className="block group">
          <Card className="shadow-xs border-t-4 border-t-blue-500 rounded-2xl transition-all group-hover:scale-[1.02] group-hover:shadow-md">
            <CardContent className="p-5 flex justify-between items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                  Verified Pickers <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600" />
                </p>
                <h3 className="text-2xl font-bold text-slate-900">{verifiedPickers}</h3>
                <span className="text-[11px] text-blue-600 font-semibold">Certified identity badges</span>
              </div>
              <div className="bg-blue-50 p-3 rounded-full hidden sm:block">
                <ShieldCheck className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/disputes" className="block group">
          <Card className="shadow-xs border-t-4 border-t-rose-500 rounded-2xl transition-all group-hover:scale-[1.02] group-hover:shadow-md">
            <CardContent className="p-5 flex justify-between items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                  Active Disputes <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-rose-600" />
                </p>
                <h3 className="text-2xl font-bold text-rose-600">{activeDisputes}</h3>
                <span className="text-[11px] text-rose-600 font-semibold">Requires mediation</span>
              </div>
              <div className="bg-rose-50 p-3 rounded-full hidden sm:block">
                <AlertTriangle className="h-6 w-6 text-rose-600" />
              </div>
            </CardContent>
          </Card>
        </Link>

      </div>

      {/* Secondary Metrics (Linkable) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/admin/users" className="block group">
          <Card className="shadow-xs rounded-2xl hover:border-slate-300 transition-all">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="bg-slate-100 p-2.5 rounded-xl shrink-0"><Users className="h-5 w-5 text-slate-600" /></div>
              <div>
                <div className="text-xl font-bold text-slate-900">{totalUsers}</div>
                <div className="text-xs text-slate-500 font-medium">Total Platform Users</div>
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/admin/pickups" className="block group">
          <Card className="shadow-xs rounded-2xl hover:border-slate-300 transition-all">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="bg-slate-100 p-2.5 rounded-xl shrink-0"><Truck className="h-5 w-5 text-slate-600" /></div>
              <div>
                <div className="text-xl font-bold text-slate-900">{totalPickups}</div>
                <div className="text-xs text-slate-500 font-medium">Total Pickups Handled</div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/fairness-analytics" className="block group">
          <Card className="shadow-xs rounded-2xl hover:border-slate-300 transition-all">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="bg-amber-100 p-2.5 rounded-xl shrink-0"><Scale className="h-5 w-5 text-amber-700" /></div>
              <div>
                <div className="text-xl font-bold text-slate-900">{avgFairnessScore.toFixed(0)}/100</div>
                <div className="text-xs text-slate-500 font-medium">Avg Fairness Score</div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Pickups Trend Chart & Ward-Wise Activity Map */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <Card className="shadow-xs border-slate-200 rounded-2xl bg-white overflow-hidden">
          <CardHeader className="p-5 pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-600" /> Weekly Pickups & Volume Trend
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">7-day collection throughput across all wards</CardDescription>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setTrendMetric("pickups")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  trendMetric === "pickups" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                }`}
              >
                Pickups
              </button>
              <button
                onClick={() => setTrendMetric("volumeKg")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  trendMetric === "volumeKg" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                }`}
              >
                Volume (kg)
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={PICKUP_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)" }}
                    formatter={(value: any) => [trendMetric === "pickups" ? `${value} pickups` : `${value} kg`, trendMetric === "pickups" ? "Pickups" : "Recycled Weight"]}
                  />
                  <Bar
                    dataKey={trendMetric}
                    fill={trendMetric === "pickups" ? "#8b5cf6" : "#10b981"}
                    radius={[6, 6, 0, 0]}
                    maxBarSize={45}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Ward Activity Map */}
        <Card className="shadow-xs border-slate-200 rounded-2xl bg-white overflow-hidden">
          <CardHeader className="p-5 pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-emerald-600" /> Ward-Wise Activity Heatmap
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">Real-time zone coverage and picker density</CardDescription>
            </div>
            <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-800 text-[11px] font-bold">
              5 Wards Monitored
            </Badge>
          </CardHeader>
          <CardContent className="p-5">
            <AdminWardMap />
          </CardContent>
        </Card>
      </div>

      {/* Main Feed & Admin Shortcuts */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Main Feed */}
        <div className="lg:col-span-2">
          <Card className="shadow-xs border-slate-200 rounded-2xl bg-white overflow-hidden h-full">
            <CardHeader className="p-5 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-slate-500" />
                <CardTitle className="text-base font-bold text-slate-900">Live Platform Activity Log</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {recentActivity.map(event => (
                  <div key={event.id} className="p-4 sm:p-5 flex gap-4 hover:bg-slate-50 transition-colors">
                    <div className={`${event.bg} ${event.color} p-3 rounded-2xl h-12 w-12 flex items-center justify-center shrink-0`}>
                      <event.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-slate-900 text-sm truncate">{event.title}</h4>
                        <span className="text-xs text-slate-400 shrink-0">• {event.time}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{event.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-center">
                <Link href="/admin/settings">
                  <Button variant="ghost" className="text-purple-700 hover:text-purple-800 hover:bg-purple-50 text-xs font-bold">
                    View Full Audit Log & Governance History <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions / Shortcuts */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Admin Operations Hub</h3>
          
          <Link href="/admin/pickups" className="block">
            <Card className="hover:border-purple-300 hover:shadow-md transition-all cursor-pointer rounded-2xl">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-2.5 rounded-xl"><Truck className="h-5 w-5 text-purple-600" /></div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">Dispatch Radar</div>
                    <div className="text-[11px] text-slate-500">Live matches & reassignment</div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/disputes" className="block">
            <Card className="hover:border-rose-300 hover:shadow-md transition-all cursor-pointer rounded-2xl">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-rose-100 p-2.5 rounded-xl"><AlertTriangle className="h-5 w-5 text-rose-600" /></div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">Arbitrate Disputes</div>
                    <div className="text-[11px] text-slate-500">Photo evidence & settlements</div>
                  </div>
                </div>
                {activeDisputes > 0 && <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{activeDisputes}</span>}
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/users" className="block">
            <Card className="hover:border-blue-300 hover:shadow-md transition-all cursor-pointer rounded-2xl">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2.5 rounded-xl"><ShieldCheck className="h-5 w-5 text-blue-600" /></div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">Verify New Pickers</div>
                    <div className="text-[11px] text-slate-500">Municipal ID check queue</div>
                  </div>
                </div>
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">Review</span>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/fairness-analytics" className="block">
            <Card className="hover:border-purple-300 hover:shadow-md transition-all cursor-pointer rounded-2xl">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-2.5 rounded-xl"><Scale className="h-5 w-5 text-purple-600" /></div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">Fairness Analytics</div>
                    <div className="text-[11px] text-slate-500">Gini coefficient & alerts</div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/price-board" className="block">
            <Card className="hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer rounded-2xl">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 p-2.5 rounded-xl"><Banknote className="h-5 w-5 text-emerald-600" /></div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">Adjust Price Board</div>
                    <div className="text-[11px] text-slate-500">Daily floor benchmark rates</div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </CardContent>
            </Card>
          </Link>
        </div>

      </div>
    </div>
  );
}
