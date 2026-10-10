"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { usePlatformData } from "@/lib/platform-data-context";
import { Dispute } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  AlertTriangle, User as UserIcon, Calendar, MessageSquare, CheckCircle2, 
  MapPin, Camera, ShieldCheck, Scale, Send, Check
} from "lucide-react";
import { toast } from "sonner";

export default function AdminDisputes() {
  const { user } = useAuth();
  const { requests, disputes, users, resolveDispute: executeResolveDispute } = usePlatformData();
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [outcomes, setOutcomes] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"open" | "resolved">("open");

  if (!user || user.role !== "admin") {
    return <div className="p-8 text-center text-slate-900 font-bold">Unauthorized. Please log in as an Admin/NGO.</div>;
  }

  const resolveDispute = (disputeId: string) => {
    const outcome = outcomes[disputeId] || "Refund to Generator";
    const note = adminNotes[disputeId] || "Mediation completed by NGO arbitration officer.";
    executeResolveDispute(disputeId, outcome, note);
  };

  const openDisputes = disputes.filter(d => d.status === "open").sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const resolvedDisputes = disputes.filter(d => d.status === "resolved").sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Scale className="h-6 w-6 text-rose-600" />
            Independent Dispute Arbitration & Settlement
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">Evidence-backed resolution: GPS timestamps, scale photos, dual statements, and automated settlement.</p>
        </div>
        
        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab("open")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "open" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5 text-rose-600" /> Open Cases ({openDisputes.length})
          </button>
          <button
            onClick={() => setActiveTab("resolved")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "resolved" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Resolved History ({resolvedDisputes.length})
          </button>
        </div>
      </div>

      {activeTab === "open" ? (
        <div className="space-y-6">
          {openDisputes.length === 0 ? (
            <Card className="border-dashed bg-white shadow-xs rounded-2xl p-12 text-center text-slate-500">
              <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
              <div className="font-bold text-slate-800 text-base">No Open Disputes!</div>
              <p className="text-xs text-slate-500 mt-1">All pickup transactions and scale calibrations are verified and in harmony.</p>
            </Card>
          ) : (
            <div className="space-y-6">
              {openDisputes.map(dispute => {
                const req = requests.find((r: any) => r.id === dispute.pickupId);
                const raisedByUser = users.find((u: any) => u.id === dispute.raisedBy);
                
                return (
                  <Card key={dispute.id} className="border-rose-200 shadow-md rounded-2xl overflow-hidden bg-white">
                    {/* Header bar */}
                    <div className="bg-rose-50/80 px-6 py-4 border-b border-rose-100 flex flex-wrap justify-between items-center gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive" className="uppercase font-bold text-xs">Arbitration Needed</Badge>
                        <span className="text-xs font-mono font-bold text-rose-950">Dispute #{dispute.id}</span>
                        <span className="text-xs text-slate-400">• Pickup #{dispute.pickupId.replace("req", "")}</span>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {new Date(dispute.createdAt).toLocaleString()}
                      </div>
                    </div>

                    <div className="grid lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
                      
                      {/* Left Column (Evidence & Statements - 7 cols) */}
                      <div className="lg:col-span-7 p-6 space-y-4">
                        <div>
                          <span className="text-[11px] font-bold uppercase text-rose-600 tracking-wider">Dispute Claim</span>
                          <h3 className="text-lg font-bold text-slate-900 mt-0.5">{dispute.reason}</h3>
                        </div>

                        {/* Dual Statements */}
                        <div className="grid sm:grid-cols-2 gap-3 text-xs">
                          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <UserIcon className="h-3.5 w-3.5 text-blue-600" /> Generator: {raisedByUser?.name || "Citizen"}
                            </div>
                            <p className="text-slate-600 italic">"{dispute.description}"</p>
                          </div>

                          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <UserIcon className="h-3.5 w-3.5 text-emerald-600" /> Picker: {req?.pickerName || "Suresh Kumar"}
                            </div>
                            <p className="text-slate-600 italic">"Electronic scale was calibrated at 10.5 kg in generator presence before UPI checkout."</p>
                          </div>
                        </div>

                        {/* Incident Evidence (GPS & Scale Photo) */}
                        <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/80 space-y-2 text-xs">
                          <div className="font-bold text-amber-950 flex items-center gap-1.5">
                            <Camera className="h-4 w-4 text-amber-600" /> Field Audit Evidence (Immutable Proof)
                          </div>
                          <div className="grid grid-cols-2 gap-3 pt-1">
                            <div className="bg-white p-2.5 rounded-lg border border-amber-100 text-[11px]">
                              <span className="text-slate-400 block font-semibold">GPS Geo-Tagging</span>
                              <span className="font-mono font-bold text-slate-800">12.9352° N, 77.6245° E</span>
                              <span className="text-emerald-700 block font-semibold mt-0.5">✓ Within 15m of doorstep</span>
                            </div>
                            <div className="bg-white p-2.5 rounded-lg border border-amber-100 text-[11px]">
                              <span className="text-slate-400 block font-semibold">Scale Tare Timestamp</span>
                              <span className="font-mono font-bold text-slate-800">10:42 AM IST (Photo Matched)</span>
                              <span className="text-blue-700 block font-semibold mt-0.5">✓ OCR Weight Verified</span>
                            </div>
                          </div>
                        </div>

                        {/* Internal Notes */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                            Internal NGO Arbitration Findings
                          </label>
                          <textarea
                            className="w-full min-h-[75px] rounded-xl border border-slate-300 p-3 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            placeholder="Enter findings from scale logs and citizen phone interview..."
                            value={adminNotes[dispute.id] || ""}
                            onChange={(e) => setAdminNotes(prev => ({ ...prev, [dispute.id]: e.target.value }))}
                          />
                        </div>
                      </div>

                      {/* Right Column (Settlement & Outcome - 5 cols) */}
                      <div className="lg:col-span-5 p-6 bg-slate-50/50 flex flex-col justify-between space-y-4">
                        <div className="space-y-4">
                          <h4 className="font-bold text-slate-900 text-sm border-b pb-2">Arbitration Ruling</h4>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                              Select Binding Outcome *
                            </label>
                            <select
                              value={outcomes[dispute.id] || "refund"}
                              onChange={(e) => setOutcomes(prev => ({ ...prev, [dispute.id]: e.target.value }))}
                              className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:ring-2 focus:ring-purple-500"
                            >
                              <option value="refund">Refund ₹50 to Generator (Tare Calibration Error)</option>
                              <option value="no_action">No Action — Photo Evidence Confirms Picker Scale</option>
                              <option value="warning">Issue Mutual Warning & Adjust Trust Score</option>
                              <option value="penalty">Penalty on Fraudulent Misreporting</option>
                            </select>
                          </div>

                          <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Pickup Value:</span>
                              <span className="font-bold text-slate-900">₹{req?.finalPrice || req?.estimatedPrice}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Material Grade:</span>
                              <span className="font-bold text-slate-900">{req?.wasteType}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Worker Paid:</span>
                              <span className="font-bold text-emerald-600">100% Direct UPI</span>
                            </div>
                          </div>
                        </div>

                        <Button 
                          onClick={() => resolveDispute(dispute.id)}
                          className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-11 text-xs font-bold shadow-md flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          Resolve & Notify Both Users (WhatsApp/SMS)
                        </Button>
                      </div>

                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Resolved History Tab */
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {resolvedDisputes.map(dispute => (
              <Card key={dispute.id} className="shadow-xs border-slate-200 rounded-2xl bg-white p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      Dispute #{dispute.id}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm mt-1">{dispute.reason}</h4>
                  </div>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-300 text-xs font-bold">
                    ✓ Resolved & Settled
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 italic">"{dispute.description}"</p>
                <div className="pt-2 border-t text-[11px] text-slate-500 flex justify-between">
                  <span>Pickup #{dispute.pickupId.replace("req", "")}</span>
                  <span className="text-emerald-700 font-semibold">Disbursed with mutual consent</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}