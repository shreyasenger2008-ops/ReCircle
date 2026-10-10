"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, Sliders, ShieldCheck, Scale, HeartPulse, Bell, 
  Save, Sparkles, Building2, RefreshCw, Key, History, AlertCircle, X, CheckCircle2
} from "lucide-react";
import { toast } from "sonner";

interface AuditLogEntry {
  id: string;
  adminName: string;
  action: string;
  change: string;
  timestamp: string;
  ipAddress: string;
}

const INITIAL_AUDIT_LOG: AuditLogEntry[] = [
  { id: "log-1", adminName: "Priya Sharma (NGO Lead)", action: "Weight Calibration", change: "Proximity weight: 20% ➔ 25%", timestamp: "2026-10-09 18:30 IST", ipAddress: "192.168.1.42" },
  { id: "log-2", adminName: "Siddharth Rao (Admin)", action: "Floor Wage Increase", change: "Travel comp: ₹4.5 ➔ ₹5.0/km", timestamp: "2026-10-08 11:15 IST", ipAddress: "192.168.1.18" },
  { id: "log-3", adminName: "Priya Sharma (NGO Lead)", action: "Health Pool Expansion", change: "CSR Match: 40% ➔ 50%", timestamp: "2026-10-06 14:00 IST", ipAddress: "192.168.1.42" },
  { id: "log-4", adminName: "System Automation", action: "Monopoly Safeguard", change: "Weekly cap set to 30 jobs", timestamp: "2026-10-01 00:00 IST", ipAddress: "Platform Daemon" },
];

export default function AdminSettingsPage() {
  const { user } = useAuth();

  const [incomeBalancingWeight, setIncomeBalancingWeight] = useState(30);
  const [proximityWeight, setProximityWeight] = useState(25);
  const [expertiseWeight, setExpertiseWeight] = useState(25);
  const [reliabilityWeight, setReliabilityWeight] = useState(20);

  const [minPricePerKm, setMinPricePerKm] = useState(5.0);
  const [healthPoolMatchPercent, setHealthPoolMatchPercent] = useState(50);
  const [monopolyThresholdJobs, setMonopolyThresholdJobs] = useState(30);

  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOG);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const totalWeight = incomeBalancingWeight + proximityWeight + expertiseWeight + reliabilityWeight;
  const isWeightValid = totalWeight === 100;

  if (!user || user.role !== "admin") {
    return <div className="p-8 text-center text-slate-900 font-bold">Unauthorized. Please log in as an Admin / NGO.</div>;
  }

  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isWeightValid) {
      toast.error(`Fair-Match weights must sum to exactly 100% (currently ${totalWeight}%).`);
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmSave = () => {
    const newLog: AuditLogEntry = {
      id: `log-${Date.now()}`,
      adminName: user.name || "NGO Officer",
      action: "Governance Policy Update",
      change: `Income: ${incomeBalancingWeight}%, Prox: ${proximityWeight}%, Exp: ${expertiseWeight}%, Rel: ${reliabilityWeight}%`,
      timestamp: new Date().toLocaleString() + " IST",
      ipAddress: "192.168.1.42",
    };

    setAuditLog(prev => [newLog, ...prev]);
    setShowConfirmModal(false);
    toast.success("Platform algorithmic governance weights successfully committed to live production!");
  };

  const handleResetDefaults = () => {
    setIncomeBalancingWeight(30);
    setProximityWeight(25);
    setExpertiseWeight(25);
    setReliabilityWeight(20);
    setMinPricePerKm(5.0);
    setHealthPoolMatchPercent(50);
    setMonopolyThresholdJobs(30);
    toast.info("Reset to default ethical parameters (100% weight sum).");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="h-6 w-6 text-purple-600" />
            Platform Governance & Algorithmic Settings
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">Fine-tune mathematical fairness weights, anti-monopoly caps, and emergency health fund matching.</p>
        </div>
        <Badge variant="outline" className="border-purple-300 bg-purple-50 text-purple-800 text-xs py-1.5 px-3 font-bold rounded-xl">
          🏛️ NGO Governance Council
        </Badge>
      </div>

      <form onSubmit={handleOpenConfirm} className="space-y-6">
        {/* Fair Match Algorithm Weights */}
        <Card className="shadow-xs border-slate-200 rounded-2xl bg-white overflow-hidden">
          <CardHeader className="p-5 pb-3 border-b bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base flex items-center gap-2 text-slate-900 font-bold">
                <Scale className="h-5 w-5 text-purple-600" />
                Fair-Match Weight Configuration
              </CardTitle>
              <CardDescription className="text-slate-600 text-xs">Adjust how the dispatch algorithm balances worker income equity vs proximity</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-black px-3 py-1 rounded-full border ${
                isWeightValid 
                  ? "bg-emerald-100 text-emerald-800 border-emerald-300" 
                  : "bg-rose-100 text-rose-800 border-rose-300 animate-pulse"
              }`}>
                Total: {totalWeight}% / 100% {isWeightValid ? "✓ Valid" : "⚠️ Must sum to 100%"}
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-3.5 bg-blue-50/80 rounded-xl border border-blue-200">
                <div className="flex justify-between text-xs font-bold text-blue-950 uppercase mb-1">
                  <span>Income Balancing Weight</span>
                  <span>{incomeBalancingWeight}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="60" 
                  value={incomeBalancingWeight} 
                  onChange={(e) => setIncomeBalancingWeight(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer" 
                />
                <p className="text-[11px] text-blue-900 font-medium mt-1">Gives higher priority to under-earning pickers today.</p>
              </div>

              <div className="p-3.5 bg-emerald-50/80 rounded-xl border border-emerald-200">
                <div className="flex justify-between text-xs font-bold text-emerald-950 uppercase mb-1">
                  <span>Proximity / Distance Weight</span>
                  <span>{proximityWeight}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="60" 
                  value={proximityWeight} 
                  onChange={(e) => setProximityWeight(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer" 
                />
                <p className="text-[11px] text-emerald-900 font-medium mt-1">Minimizes picker physical travel strain.</p>
              </div>

              <div className="p-3.5 bg-purple-50/80 rounded-xl border border-purple-200">
                <div className="flex justify-between text-xs font-bold text-purple-950 uppercase mb-1">
                  <span>Material Handling Expertise</span>
                  <span>{expertiseWeight}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="60" 
                  value={expertiseWeight} 
                  onChange={(e) => setExpertiseWeight(Number(e.target.value))}
                  className="w-full accent-purple-600 cursor-pointer" 
                />
                <p className="text-[11px] text-purple-900 font-medium mt-1">Matches waste category with certified pickers.</p>
              </div>

              <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-200">
                <div className="flex justify-between text-xs font-bold text-amber-950 uppercase mb-1">
                  <span>Reliability & Trust Score</span>
                  <span>{reliabilityWeight}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="60" 
                  value={reliabilityWeight} 
                  onChange={(e) => setReliabilityWeight(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer" 
                />
                <p className="text-[11px] text-amber-900 font-medium mt-1">Rewards verified workers with high ratings.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Worker Protection & Floor Prices */}
        <Card className="shadow-xs border-slate-200 rounded-2xl bg-white overflow-hidden">
          <CardHeader className="p-5 pb-3 border-b bg-slate-50/70">
            <CardTitle className="text-base flex items-center gap-2">
              <HeartPulse className="h-5 w-5 text-rose-600" />
              Social Protection & Anti-Monopoly Thresholds
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">Policies protecting vulnerable informal recyclers from exploitation</CardDescription>
          </CardHeader>
          <CardContent className="p-6 grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Travel Floor Comp (₹ / km)
              </label>
              <Input 
                type="number" 
                step="0.5" 
                value={minPricePerKm} 
                onChange={(e) => setMinPricePerKm(Number(e.target.value))}
                className="rounded-xl h-10 text-xs font-bold"
              />
              <p className="text-[11px] text-slate-400 mt-1">Guaranteed travel wage added to all pickups.</p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                NGO Health Pool Match (%)
              </label>
              <Input 
                type="number" 
                value={healthPoolMatchPercent} 
                onChange={(e) => setHealthPoolMatchPercent(Number(e.target.value))}
                className="rounded-xl h-10 text-xs font-bold"
              />
              <p className="text-[11px] text-slate-400 mt-1">CSR grant matching for citizen round-ups.</p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Monopoly Alert Cap (Jobs/wk)
              </label>
              <Input 
                type="number" 
                value={monopolyThresholdJobs} 
                onChange={(e) => setMonopolyThresholdJobs(Number(e.target.value))}
                className="rounded-xl h-10 text-xs font-bold"
              />
              <p className="text-[11px] text-slate-400 mt-1">Flags pickers dominating route clusters.</p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleResetDefaults} 
            className="w-full sm:w-auto gap-1.5 rounded-xl border-slate-300 text-slate-800 hover:bg-slate-100 font-bold text-xs h-10"
          >
            <RefreshCw className="h-4 w-4" /> Reset Ethical Defaults
          </Button>

          <Button 
            type="submit" 
            disabled={!isWeightValid}
            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white gap-2 rounded-xl px-8 h-11 text-xs font-bold shadow-md"
          >
            <Save className="h-4 w-4" /> Save Governance Parameters
          </Button>
        </div>
      </form>

      {/* Governance Audit Log Table */}
      <Card className="shadow-xs border-slate-200 rounded-2xl bg-white overflow-hidden">
        <CardHeader className="p-5 pb-3 border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <History className="h-5 w-5 text-purple-600" />
              Platform Governance Audit Log
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Immutable record of parameter modifications, timestamps, and authorized administrators.
            </CardDescription>
          </div>
          <Badge variant="outline" className="border-slate-300 text-slate-600 text-xs font-bold">
            {auditLog.length} Records
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] text-slate-500 uppercase bg-slate-50/80 border-b">
                <tr>
                  <th className="px-5 py-3.5 font-bold">Timestamp</th>
                  <th className="px-5 py-3.5 font-bold">Authorized Admin</th>
                  <th className="px-5 py-3.5 font-bold">Action</th>
                  <th className="px-5 py-3.5 font-bold">Parameter Delta</th>
                  <th className="px-5 py-3.5 font-bold text-right">Origin IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {auditLog.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-slate-500">
                      {log.timestamp}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-900">
                      {log.adminName}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-700 font-mono text-[11px]">
                      {log.change}
                    </td>
                    <td className="px-5 py-3.5 text-right text-slate-400 font-mono">
                      {log.ipAddress}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 text-purple-700 rounded-2xl shrink-0">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Confirm Policy Deployment</h3>
                <p className="text-xs text-slate-500">This will immediately re-tune live dispatch weights.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Income Balancing:</span>
                <span className="font-bold text-slate-900">{incomeBalancingWeight}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Proximity Weight:</span>
                <span className="font-bold text-slate-900">{proximityWeight}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Travel Compensation:</span>
                <span className="font-bold text-slate-900">₹{minPricePerKm}/km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Health Pool CSR Match:</span>
                <span className="font-bold text-emerald-600">{healthPoolMatchPercent}%</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t">
              <Button variant="outline" onClick={() => setShowConfirmModal(false)} className="rounded-xl text-xs">
                Cancel
              </Button>
              <Button
                onClick={handleConfirmSave}
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold"
              >
                Confirm & Deploy Weights
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}