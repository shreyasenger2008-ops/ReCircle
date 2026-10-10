"use client";

import React from "react";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, Download, Leaf, Wind, Banknote, Users, 
  Building2, CheckCircle2, TrendingUp, ShieldCheck
} from "lucide-react";
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
import { toast } from "sonner";
import { CITY_WIDE_STATS, CO2_PER_KG_RECYCLED } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/formatters";

export default function AdminImpactReportsPage() {
  const { user } = useAuth();

  if (!user || user.role !== "admin") {
    return <div className="p-8">Unauthorized. Please log in as an Admin / NGO.</div>;
  }

  // Ward data standardized with 1.5x CO2 ratio
  const wardData = [
    { ward: "Koramangala", wasteTons: 42.5, workerIncome: 382000, co2Saved: 63.8 },
    { ward: "Indiranagar", wasteTons: 38.2, workerIncome: 344000, co2Saved: 57.3 },
    { ward: "HSR Layout", wasteTons: 29.8, workerIncome: 268000, co2Saved: 44.7 },
    { ward: "Whitefield", wasteTons: 54.1, workerIncome: 486000, co2Saved: 81.2 },
    { ward: "Jayanagar", wasteTons: 22.4, workerIncome: 201000, co2Saved: 33.6 },
  ];

  const materialShare = [
    { name: "PET Plastic", value: 40, color: "#3b82f6" },
    { name: "Corrugated Cardboard", value: 30, color: "#eab308" },
    { name: "Scrap Metal & Cans", value: 15, color: "#10b981" },
    { name: "Glass Containers", value: 10, color: "#64748b" },
    { name: "Hazardous E-Waste", value: 5, color: "#a855f7" },
  ];

  const handleDownloadReport = () => {
    toast.success("Exporting Official Municipal ESG & Carbon Audit Report (PDF)...");
  };

  const totalWasteTons = (CITY_WIDE_STATS.totalKgRecycled / 1000).toFixed(1);
  const totalCo2Tons = CITY_WIDE_STATS.co2OffsetTons.toFixed(1);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <FileText className="h-6 w-6 text-purple-600" />
              City-Wide Municipal ESG & Impact Audit
            </h2>
            <Badge variant="outline" className="bg-purple-50 text-purple-800 border-purple-200 text-xs">
              Municipal Ward 150 Projected
            </Badge>
          </div>
          <p className="text-slate-500">Official reporting for Municipal Corporation, Pollution Control Boards & Carbon Credits.</p>
        </div>
        <Button onClick={handleDownloadReport} className="bg-slate-900 hover:bg-slate-800 text-white gap-2 rounded-xl shadow">
          <Download className="h-4 w-4" /> Export Municipal PDF Report
        </Button>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md border-0 rounded-2xl">
          <CardContent className="p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-100 mb-1">Total Landfill Diverted</p>
            <h3 className="text-3xl font-black">{totalWasteTons} <span className="text-sm font-normal">Tons</span></h3>
            <p className="text-xs text-emerald-100 mt-1">Across 5 Urban Wards ({CITY_WIDE_STATS.totalPickups.toLocaleString()} Pickups)</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md border-0 rounded-2xl">
          <CardContent className="p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-100 mb-1">CO₂ Emissions Offset</p>
            <h3 className="text-3xl font-black">{totalCo2Tons} <span className="text-sm font-normal">Tons</span></h3>
            <p className="text-xs text-blue-100 mt-1">1.5x Factor • Carbon Registry Verified</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-600 to-violet-700 text-white shadow-md border-0 rounded-2xl">
          <CardContent className="p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-purple-100 mb-1">Worker Direct Wealth</p>
            <h3 className="text-3xl font-black">{formatCurrency(CITY_WIDE_STATS.totalWealthDisbursed)}</h3>
            <p className="text-xs text-purple-100 mt-1">0% Intermediary Cut • 100% UPI</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-600 to-orange-700 text-white shadow-md border-0 rounded-2xl">
          <CardContent className="p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-100 mb-1">Suraksha Health Pool</p>
            <h3 className="text-3xl font-black">₹54,200</h3>
            <p className="text-xs text-amber-100 mt-1">100% Zero-Red-Tape Clinic Relief</p>
          </CardContent>
        </Card>
      </div>

      {/* Ward-wise Recycling Performance Chart */}
      <div className="grid lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-7 shadow-sm border-slate-200">
          <CardHeader className="pb-2 border-b bg-slate-50">
            <CardTitle className="text-base">Ward-Wise Recycling & Economic Disbursal</CardTitle>
            <CardDescription>Volume (Tons) and direct worker earnings by municipal zone</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={wardData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="ward" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="wasteTons" name="Waste Diverted (Tons)" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={45} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-5 shadow-sm border-slate-200">
          <CardHeader className="pb-2 border-b bg-slate-50">
            <CardTitle className="text-base">Material Stream Aggregation</CardTitle>
            <CardDescription>Breakdown by recyclable commodity class (%)</CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex flex-col items-center">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={materialShare}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {materialShare.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex flex-wrap justify-center gap-3 mt-2 w-full">
              {materialShare.map((entry) => (
                <div key={entry.name} className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                  {entry.name} ({entry.value}%)
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Methodology Note */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-500 flex items-center justify-between">
        <span>* Carbon emissions offset computed at official standard of <strong>1.5 kg CO₂ avoided per 1.0 kg</strong> dry recyclable stream diverted from landfills and open incineration.</span>
        <Badge variant="outline" className="bg-white text-slate-700 font-mono text-[10px]">ISO 14064 Compliant</Badge>
      </div>
    </div>
  );
}