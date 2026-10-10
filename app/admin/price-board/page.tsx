"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { usePlatformData } from "@/lib/platform-data-context";
import { MOCK_RATES, RecyclableRate } from "@/lib/mock-rates";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Banknote, TrendingUp, TrendingDown, Scale, Edit2, CheckCircle2, X, 
  Calendar, AlertCircle, Sparkles, LineChart as ChartIcon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

// Mock historical price movement for sparklines
const PRICE_HISTORY: Record<string, { month: string; fair: number; market: number }[]> = {
  "r1": [
    { month: "May", fair: 18, market: 12 },
    { month: "Jun", fair: 19, market: 13 },
    { month: "Jul", fair: 20, market: 13 },
    { month: "Aug", fair: 21, market: 14 },
    { month: "Sep", fair: 22, market: 14 },
    { month: "Oct", fair: 22, market: 15 },
  ],
  "r2": [
    { month: "May", fair: 12, market: 9 },
    { month: "Jun", fair: 12, market: 9 },
    { month: "Jul", fair: 13, market: 10 },
    { month: "Aug", fair: 13, market: 10 },
    { month: "Sep", fair: 14, market: 10 },
    { month: "Oct", fair: 14, market: 10 },
  ],
  "r3": [
    { month: "May", fair: 10, market: 7 },
    { month: "Jun", fair: 10, market: 7 },
    { month: "Jul", fair: 11, market: 8 },
    { month: "Aug", fair: 11, market: 8 },
    { month: "Sep", fair: 12, market: 8 },
    { month: "Oct", fair: 12, market: 8 },
  ],
  "r4": [
    { month: "May", fair: 38, market: 28 },
    { month: "Jun", fair: 40, market: 30 },
    { month: "Jul", fair: 42, market: 30 },
    { month: "Aug", fair: 42, market: 32 },
    { month: "Sep", fair: 44, market: 32 },
    { month: "Oct", fair: 45, market: 35 },
  ],
  "r5": [
    { month: "May", fair: 4, market: 2 },
    { month: "Jun", fair: 4, market: 2 },
    { month: "Jul", fair: 5, market: 3 },
    { month: "Aug", fair: 5, market: 3 },
    { month: "Sep", fair: 5, market: 3 },
    { month: "Oct", fair: 5, market: 3 },
  ],
  "r6": [
    { month: "May", fair: 65, market: 45 },
    { month: "Jun", fair: 70, market: 50 },
    { month: "Jul", fair: 75, market: 55 },
    { month: "Aug", fair: 80, market: 58 },
    { month: "Sep", fair: 82, market: 60 },
    { month: "Oct", fair: 85, market: 60 },
  ],
};

export default function AdminPriceBoard() {
  const { user } = useAuth();
  const { rates, updateMaterialRate } = usePlatformData();
  const [editingRate, setEditingRate] = useState<RecyclableRate | null>(null);
  const [editForm, setEditForm] = useState<{
    marketRate: number;
    fairRate: number;
    sortingDifficulty: "low" | "medium" | "high";
    demandLevel: "low" | "normal" | "high";
    reason: string;
    effectiveDate: string;
  }>({
    marketRate: 0,
    fairRate: 0,
    sortingDifficulty: "medium",
    demandLevel: "high",
    reason: "",
    effectiveDate: "2026-10-10",
  });

  if (!user || user.role !== "admin") {
    return <div className="p-8 text-center text-slate-900 font-bold">Unauthorized. Please log in as an Admin/NGO.</div>;
  }

  const handleOpenEditModal = (rate: RecyclableRate) => {
    setEditingRate(rate);
    setEditForm({
      marketRate: rate.marketRate,
      fairRate: rate.fairRate,
      sortingDifficulty: rate.sortingDifficulty,
      demandLevel: rate.demandLevel,
      reason: "Industrial mill price index adjustment",
      effectiveDate: new Date().toISOString().split("T")[0],
    });
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRate) return;

    if (editForm.fairRate <= editForm.marketRate) {
      toast.error("Fair floor rate must be strictly higher than local middleman mandi rate.");
      return;
    }

    updateMaterialRate(
      editingRate.id, 
      editForm.fairRate, 
      editForm.marketRate, 
      editForm.sortingDifficulty, 
      editForm.demandLevel
    );
    setEditingRate(null);
  };

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Banknote className="h-6 w-6 text-emerald-600" />
            Fair Price Board & Mandi Benchmark Index
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">Regulate base pricing to ensure fair worker compensation against scrap dealer volatility.</p>
        </div>
        <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-800 text-xs py-1.5 px-3 font-bold rounded-xl">
          ⚖️ Anti-Exploitation Floor Active
        </Badge>
      </div>

      {/* Main Rates Table */}
      <Card className="shadow-xs border-slate-200 rounded-2xl bg-white overflow-hidden">
        <CardHeader className="p-5 pb-3 border-b border-slate-100 bg-slate-50/50">
          <CardTitle className="text-base font-bold text-slate-900">Active Material Rates & Price History Sparklines</CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Rates instantly calibrate the Fair-Match Algorithm and worker direct UPI payouts.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                <tr>
                  <th className="px-5 py-4 font-bold">Material Grade</th>
                  <th className="px-5 py-4 font-bold">Market Rate / kg</th>
                  <th className="px-5 py-4 font-bold text-emerald-700">Fair Rate / kg</th>
                  <th className="px-5 py-4 font-bold">6-Month Price Movement</th>
                  <th className="px-5 py-4 font-bold">Sorting Effort</th>
                  <th className="px-5 py-4 font-bold">Demand</th>
                  <th className="px-5 py-4 font-bold text-right">Edit Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {rates.map((rate: RecyclableRate) => {
                  const history = PRICE_HISTORY[rate.id] || PRICE_HISTORY["r1"];
                  return (
                    <tr key={rate.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4 font-bold text-slate-900">
                        {rate.material}
                      </td>

                      <td className="px-5 py-4 text-slate-400 line-through">
                        ₹{rate.marketRate}
                      </td>

                      <td className="px-5 py-4 font-black text-emerald-600 bg-emerald-50/40 text-base">
                        <div className="flex items-center gap-1">
                          ₹{rate.fairRate}
                          <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                        </div>
                      </td>

                      {/* Small Price History Chart */}
                      <td className="px-5 py-4 w-44">
                        <div className="h-10 w-36">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={history}>
                              <Line type="monotone" dataKey="fair" stroke="#10b981" strokeWidth={2} dot={false} />
                              <Line type="monotone" dataKey="market" stroke="#94a3b8" strokeDasharray="2 2" strokeWidth={1.5} dot={false} />
                              <Tooltip 
                                contentStyle={{ borderRadius: '8px', fontSize: '10px', padding: '4px 8px' }}
                                formatter={(val: any, name: any) => [`₹${val}/kg`, name === "fair" ? "Fair Floor" : "Market Mandi"]}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <Badge variant="outline" className={`text-xs ${
                          rate.sortingDifficulty === 'high' ? 'border-rose-200 text-rose-700 bg-rose-50' : 
                          rate.sortingDifficulty === 'medium' ? 'border-amber-200 text-amber-700 bg-amber-50' : 
                          'border-blue-200 text-blue-700 bg-blue-50'}
                        `}>
                          {rate.sortingDifficulty} effort
                        </Badge>
                      </td>

                      <td className="px-5 py-4">
                        <Badge variant="outline" className={`text-xs ${
                          rate.demandLevel === 'high' ? 'border-emerald-200 text-emerald-700 bg-emerald-50' : 
                          rate.demandLevel === 'low' ? 'border-slate-200 text-slate-500 bg-slate-50' : 
                          'border-slate-200 text-slate-700'}
                        `}>
                          {rate.demandLevel}
                        </Badge>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenEditModal(rate)}
                          className="h-8 px-2.5 rounded-lg border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-xs font-bold"
                        >
                          <Edit2 className="h-3.5 w-3.5 mr-1" /> Edit
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {/* Fair rate explanation banner */}
      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-5 flex items-start gap-3">
        <Scale className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-900 leading-relaxed">
          <h4 className="font-bold text-emerald-950 text-sm mb-0.5">Automated Floor Price Protection</h4>
          The platform ensures that even if local scrap dealers collapse their buying rates, informal waste workers receive guaranteed fair floor pricing funded via Extended Producer Responsibility (EPR) brand credits.
        </div>
      </div>

      {/* Edit Rate Modal */}
      {editingRate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase text-emerald-600 tracking-wider">Benchmark Calibration</span>
                <h3 className="text-lg font-bold text-slate-900">Edit {editingRate.material} Fair Floor Rate</h3>
              </div>
              <button onClick={() => setEditingRate(null)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Market Mandi Rate (₹/kg)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={editForm.marketRate}
                    onChange={(e) => setEditForm({ ...editForm, marketRate: Number(e.target.value) })}
                    className="h-10 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                    ReCircle Fair Floor Rate (₹/kg) *
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={editForm.fairRate}
                    onChange={(e) => setEditForm({ ...editForm, fairRate: Number(e.target.value) })}
                    className="h-10 rounded-xl border-emerald-300 focus:ring-emerald-500 font-bold text-emerald-700"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Sorting Difficulty
                  </label>
                  <select
                    value={editForm.sortingDifficulty}
                    onChange={(e) => setEditForm({ ...editForm, sortingDifficulty: e.target.value as any })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="low">Low (Easy to segregate)</option>
                    <option value="medium">Medium (Moderate sorting)</option>
                    <option value="high">High (Extensive decontamination)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Market Demand
                  </label>
                  <select
                    value={editForm.demandLevel}
                    onChange={(e) => setEditForm({ ...editForm, demandLevel: e.target.value as any })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="low">Low Demand</option>
                    <option value="normal">Normal Demand</option>
                    <option value="high">High Industrial Demand</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 uppercase tracking-wider block">
                  Justification / Regulatory Reason *
                </label>
                <Input
                  type="text"
                  value={editForm.reason}
                  onChange={(e) => setEditForm({ ...editForm, reason: e.target.value })}
                  placeholder="e.g., Global PET polymer price surge / Monsoon transportation relief"
                  className="h-10 rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 uppercase tracking-wider block">
                  Effective From Date
                </label>
                <Input
                  type="date"
                  value={editForm.effectiveDate}
                  onChange={(e) => setEditForm({ ...editForm, effectiveDate: e.target.value })}
                  className="h-10 rounded-xl"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t">
                <Button type="button" variant="outline" onClick={() => setEditingRate(null)} className="rounded-xl text-xs">
                  Cancel
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold">
                  Publish New Benchmark Rate
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}