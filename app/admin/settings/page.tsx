"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, Sliders, ShieldCheck, Scale, HeartPulse, Bell, 
  Save, Sparkles, Building2, RefreshCw, Key
} from "lucide-react";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const { user } = useAuth();

  const [incomeBalancingWeight, setIncomeBalancingWeight] = useState(20);
  const [proximityWeight, setProximityWeight] = useState(25);
  const [expertiseWeight, setExpertiseWeight] = useState(25);
  const [reliabilityWeight, setReliabilityWeight] = useState(15);
  const [availabilityWeight, setAvailabilityWeight] = useState(15);

  const [minPricePerKm, setMinPricePerKm] = useState(5.0);
  const [healthPoolMatchPercent, setHealthPoolMatchPercent] = useState(50);
  const [monopolyThresholdJobs, setMonopolyThresholdJobs] = useState(30);

  if (!user || user.role !== "admin") {
    return <div className="p-8">Unauthorized. Please log in as an Admin / NGO.</div>;
  }

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Algorithmic fairness parameters and NGO governance policies updated!");
  };

  const handleResetDefaults = () => {
    setIncomeBalancingWeight(20);
    setProximityWeight(25);
    setExpertiseWeight(25);
    setReliabilityWeight(15);
    setAvailabilityWeight(15);
    setMinPricePerKm(5.0);
    setHealthPoolMatchPercent(50);
    setMonopolyThresholdJobs(30);
    toast.info("Reset to default ethical parameters.");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="h-6 w-6 text-purple-600" />
            Platform Governance & Algorithmic Settings
          </h2>
          <p className="text-slate-500">Fine-tune the mathematical fairness weights, anti-monopoly caps, and emergency health fund matching.</p>
        </div>
        <Badge variant="outline" className="border-purple-300 bg-purple-50 text-purple-800 text-sm py-1.5 px-3">
          🏛️ NGO Governance Council
        </Badge>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Fair Match Algorithm Weights */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-3 border-b bg-slate-50">
            <CardTitle className="text-base flex items-center gap-2">
              <Scale className="h-5 w-5 text-purple-600" />
              Fair-Match Weight Configuration (Must sum to 100%)
            </CardTitle>
            <CardDescription>Adjust how the dispatch algorithm balances worker income equity vs proximity</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-100">
                <div className="flex justify-between text-xs font-bold text-blue-950 uppercase mb-1">
                  <span>Income Balancing Weight</span>
                  <span>{incomeBalancingWeight}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="50" 
                  value={incomeBalancingWeight} 
                  onChange={(e) => setIncomeBalancingWeight(Number(e.target.value))}
                  className="w-full accent-blue-600" 
                />
                <p className="text-[11px] text-blue-800 mt-1">Gives higher priority to under-earning pickers today.</p>
              </div>

              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-100">
                <div className="flex justify-between text-xs font-bold text-emerald-950 uppercase mb-1">
                  <span>Proximity / Distance Weight</span>
                  <span>{proximityWeight}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="50" 
                  value={proximityWeight} 
                  onChange={(e) => setProximityWeight(Number(e.target.value))}
                  className="w-full accent-emerald-600" 
                />
                <p className="text-[11px] text-emerald-800 mt-1">Minimizes picker physical travel strain.</p>
              </div>

              <div className="p-3.5 bg-purple-50 rounded-xl border border-purple-100">
                <div className="flex justify-between text-xs font-bold text-purple-950 uppercase mb-1">
                  <span>Material Handling Expertise</span>
                  <span>{expertiseWeight}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="50" 
                  value={expertiseWeight} 
                  onChange={(e) => setExpertiseWeight(Number(e.target.value))}
                  className="w-full accent-purple-600" 
                />
                <p className="text-[11px] text-purple-800 mt-1">Matches waste category with certified pickers.</p>
              </div>

              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-100">
                <div className="flex justify-between text-xs font-bold text-amber-950 uppercase mb-1">
                  <span>Reliability & Trust Score</span>
                  <span>{reliabilityWeight}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="50" 
                  value={reliabilityWeight} 
                  onChange={(e) => setReliabilityWeight(Number(e.target.value))}
                  className="w-full accent-amber-600" 
                />
                <p className="text-[11px] text-amber-800 mt-1">Rewards verified workers with high ratings.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Worker Protection & Floor Prices */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-3 border-b bg-slate-50">
            <CardTitle className="text-base flex items-center gap-2">
              <HeartPulse className="h-5 w-5 text-rose-600" />
              Social Protection & Anti-Monopoly Thresholds
            </CardTitle>
            <CardDescription>Policies protecting vulnerable informal recyclers from exploitation</CardDescription>
          </CardHeader>
          <CardContent className="p-6 grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Travel Floor Comp (₹ / km)
              </label>
              <Input 
                type="number" 
                step="0.5" 
                value={minPricePerKm} 
                onChange={(e) => setMinPricePerKm(Number(e.target.value))}
                className="rounded-xl"
              />
              <p className="text-[11px] text-slate-400 mt-1">Guaranteed travel wage added to all pickups.</p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                NGO Health Pool Match (%)
              </label>
              <Input 
                type="number" 
                value={healthPoolMatchPercent} 
                onChange={(e) => setHealthPoolMatchPercent(Number(e.target.value))}
                className="rounded-xl"
              />
              <p className="text-[11px] text-slate-400 mt-1">CSR grant matching for citizen round-ups.</p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Monopoly Alert Cap (Jobs/wk)
              </label>
              <Input 
                type="number" 
                value={monopolyThresholdJobs} 
                onChange={(e) => setMonopolyThresholdJobs(Number(e.target.value))}
                className="rounded-xl"
              />
              <p className="text-[11px] text-slate-400 mt-1">Flags pickers dominating route clusters.</p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-2">
          <Button type="button" variant="outline" onClick={handleResetDefaults} className="gap-1.5 rounded-xl border-slate-300">
            <RefreshCw className="h-4 w-4" /> Reset Ethical Defaults
          </Button>

          <Button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white gap-2 rounded-xl px-8 h-11 font-bold shadow-md">
            <Save className="h-4 w-4" /> Save Governance Parameters
          </Button>
        </div>
      </form>
    </div>
  );
}