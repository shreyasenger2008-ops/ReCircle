"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/lib/auth-context";
import { usePlatformData } from "@/lib/platform-data-context";
import { PickupRequest } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Trash2, Navigation, MapPin, Search, Filter, Clock, 
  CheckCircle2, AlertTriangle, UserCheck, RefreshCw, Eye, UserPlus, ArrowRightLeft,
  Map as MapIcon, List, X
} from "lucide-react";
import { toast } from "sonner";
import ReceiptModal from "@/components/ReceiptModal";
import { formatStatus, formatCurrency, formatDate } from "@/lib/formatters";

const AdminDispatchMap = dynamic(() => import("@/components/AdminDispatchMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[480px] w-full rounded-2xl bg-slate-100 animate-pulse flex items-center justify-center text-slate-400 text-sm font-semibold">
      Loading Real-Time Dispatch Radar...
    </div>
  ),
});

export default function AdminPickupsPage() {
  const { user } = useAuth();
  const { requests, pickers, reassignPickup, forceMatchPickup } = usePlatformData();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  
  // Modals state
  const [activeReceipt, setActiveReceipt] = useState<PickupRequest | null>(null);
  const [selectedDetails, setSelectedDetails] = useState<PickupRequest | null>(null);
  const [reassignModalReq, setReassignModalReq] = useState<PickupRequest | null>(null);
  const [selectedNewPickerId, setSelectedNewPickerId] = useState<string>("");

  if (!user || user.role !== "admin") {
    return <div className="p-8">Unauthorized. Please log in as an Admin / NGO.</div>;
  }

  const filteredRequests = requests.filter(r => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (searchTerm && !r.wasteType.toLowerCase().includes(searchTerm.toLowerCase()) && !r.address.toLowerCase().includes(searchTerm.toLowerCase()) && !r.generatorName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const totalVolume = requests.reduce((sum, r) => sum + (r.finalWeight || r.estimatedWeight || 0), 0);
  const totalPayout = requests.reduce((sum, r) => sum + (r.finalPrice || r.estimatedPrice || 0), 0);
  const activeDispatches = requests.filter(r => r.status === "accepted" || r.status === "on_the_way").length;

  const handleReassignPicker = (reqId: string, pickerId: string) => {
    reassignPickup(reqId, pickerId);
    setReassignModalReq(null);
    setSelectedNewPickerId("");
  };

  const handleForceMatch = (reqId: string) => {
    forceMatchPickup(reqId);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Navigation className="h-6 w-6 text-purple-600" />
            Global Pickup & Dispatch Control
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">Monitor live waste matches, route status, and enforce anti-monopoly fair dispatching.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === "list" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
              }`}
            >
              <List className="h-4 w-4" /> Table View
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === "map" ? "bg-purple-600 text-white shadow-xs" : "text-slate-600"
              }`}
            >
              <MapIcon className="h-4 w-4" /> Radar Map
            </button>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-xs border-slate-200 rounded-2xl bg-white">
          <CardContent className="p-5">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Network Volume</div>
            <div className="text-3xl font-black text-slate-900">{totalVolume.toFixed(1)} kg</div>
            <div className="text-xs text-emerald-600 font-semibold mt-1">Diverted from city landfills</div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-slate-200 rounded-2xl bg-white">
          <CardContent className="p-5">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Fair Wages Disbursed</div>
            <div className="text-3xl font-black text-emerald-600">₹{totalPayout.toFixed(0)}</div>
            <div className="text-xs text-slate-500 mt-1">100% direct to informal workers</div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-slate-200 rounded-2xl bg-white">
          <CardContent className="p-5">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Active Route Dispatches</div>
            <div className="text-3xl font-black text-blue-600">{activeDispatches} Active</div>
            <div className="text-xs text-blue-700 font-semibold mt-1">Live tracking on field</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search */}
      <Card className="shadow-xs border-slate-200 rounded-2xl bg-white">
        <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search waste type, generator, address..."
              className="pl-9 rounded-xl text-sm"
            />
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 w-full sm:w-auto overflow-x-auto">
            {(["all", "pending", "accepted", "on_the_way", "completed", "disputed"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  statusFilter === s ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {formatStatus(s)}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* View Mode Switcher */}
      {viewMode === "map" ? (
        <Card className="shadow-xs border-slate-200 rounded-2xl bg-white overflow-hidden p-4">
          <div className="mb-3 flex justify-between items-center">
            <div className="text-sm font-bold text-slate-900">📡 Live Real-Time Dispatch Radar</div>
            <span className="text-xs text-slate-500">{filteredRequests.length} Pickups Mapped</span>
          </div>
          <AdminDispatchMap 
            pickups={filteredRequests} 
            onSelectPickup={(p) => setSelectedDetails(p)} 
          />
        </Card>
      ) : (
        /* Orders List Table */
        <Card className="shadow-xs border-slate-200 rounded-2xl bg-white overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                  <tr>
                    <th className="px-5 py-4 font-bold">Order ID</th>
                    <th className="px-5 py-4 font-bold">Material & Weight</th>
                    <th className="px-5 py-4 font-bold">Generator</th>
                    <th className="px-5 py-4 font-bold">Assigned Picker</th>
                    <th className="px-5 py-4 font-bold">Status</th>
                    <th className="px-5 py-4 font-bold">Fair Payout</th>
                    <th className="px-5 py-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-400 text-sm">
                        No pickup requests match your search or filter.
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-4 font-bold text-slate-900 font-mono">
                          #{req.id.replace("req", "")}
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-bold text-slate-900">{req.wasteType}</div>
                          <div className="text-xs text-slate-500">{req.estimatedWeight} kg estimated</div>
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-700">
                          <div className="font-semibold">{req.generatorName}</div>
                          <div className="text-slate-400 line-clamp-1 max-w-[160px]">{req.address}</div>
                        </td>
                        <td className="px-5 py-4 text-xs font-semibold text-slate-800">
                          {req.pickerName ? (
                            <span className="text-slate-900 font-bold">{req.pickerName}</span>
                          ) : (
                            <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-bold border border-amber-200">
                              Pending Match
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <Badge variant="outline" className={`text-xs uppercase font-bold ${
                            req.status === 'completed' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                            req.status === 'disputed' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                            req.status === 'on_the_way' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                            req.status === 'accepted' ? 'bg-purple-50 text-purple-800 border-purple-200' :
                            'bg-slate-50 text-slate-700 border-slate-200'
                          }`}>
                            {req.status.replace("_", " ")}
                          </Badge>
                        </td>
                        <td className="px-5 py-4 font-bold text-emerald-600">
                          ₹{(req.finalPrice || req.estimatedPrice).toFixed(0)}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Details Action */}
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => setSelectedDetails(req)} 
                              className="h-8 px-2 rounded-lg text-xs text-slate-600 hover:text-slate-900"
                              title="View full pickup details"
                            >
                              <Eye className="h-3.5 w-3.5 mr-1" /> Details
                            </Button>

                            {/* Reassign Action */}
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => {
                                setReassignModalReq(req);
                                setSelectedNewPickerId(req.matchedPickerId || (pickers[0]?.id || "wp1"));
                              }} 
                              className="h-8 px-2 rounded-lg text-xs border-purple-200 text-purple-700 hover:bg-purple-50"
                              title="Reassign to another picker"
                            >
                              <ArrowRightLeft className="h-3.5 w-3.5 mr-1" /> Reassign
                            </Button>

                            {/* Force match if unassigned/pending */}
                            {!req.pickerName && (
                              <Button 
                                size="sm" 
                                onClick={() => handleForceMatch(req.id)} 
                                className="h-8 px-2.5 rounded-lg text-xs bg-slate-900 text-white hover:bg-slate-800"
                                title="Force algorithmic match"
                              >
                                <UserPlus className="h-3.5 w-3.5 mr-1" /> Force Match
                              </Button>
                            )}

                            {/* Receipt Modal if completed */}
                            {req.status === "completed" && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => setActiveReceipt(req)} 
                                className="h-8 px-2 rounded-lg text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                              >
                                Receipt
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pickup Details Modal */}
      {selectedDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                  #{selectedDetails.id}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">Pickup Dispatch Summary</h3>
              </div>
              <button onClick={() => setSelectedDetails(null)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <Badge variant="outline" className="text-[10px] uppercase font-bold">{selectedDetails.status.replace("_", " ")}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Material Grade:</span>
                  <span className="font-bold text-slate-900">{selectedDetails.wasteType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Weight:</span>
                  <span className="font-bold text-slate-900">{selectedDetails.finalWeight || selectedDetails.estimatedWeight} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Fair Payout Amount:</span>
                  <span className="font-bold text-emerald-600 font-mono text-sm">₹{selectedDetails.finalPrice || selectedDetails.estimatedPrice}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-slate-200">
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Generator</div>
                  <div className="font-bold text-slate-900">{selectedDetails.generatorName}</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">{selectedDetails.address}</div>
                </div>
                <div className="p-3 rounded-xl border border-slate-200">
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Assigned Picker</div>
                  <div className="font-bold text-slate-900">{selectedDetails.pickerName || "None Assigned"}</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">Fair Match Priority: 92/100</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-900 space-y-1">
                <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Algorithmic Fair Guarantee
                </div>
                <p className="text-[11px] leading-relaxed">
                  Zero commission deducted. 100% of fair value routed directly to worker upon scale confirmation.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedDetails(null)} className="rounded-xl text-xs">
                Close
              </Button>
              {selectedDetails.status === "completed" && (
                <Button 
                  onClick={() => {
                    setActiveReceipt(selectedDetails);
                    setSelectedDetails(null);
                  }} 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                >
                  <Eye className="h-3.5 w-3.5 mr-1" /> View Official Receipt
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reassign Modal */}
      {reassignModalReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Reassign Pickup Dispatch</h3>
                <p className="text-xs text-slate-500">Order #{reassignModalReq.id.replace("req", "")} ({reassignModalReq.wasteType})</p>
              </div>
              <button onClick={() => setReassignModalReq(null)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Select Certified Waste-Picker:
              </label>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {pickers.map((picker) => (
                  <div
                    key={picker.id}
                    onClick={() => setSelectedNewPickerId(picker.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      selectedNewPickerId === picker.id
                        ? "border-purple-600 bg-purple-50/70 shadow-2xs"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-slate-900 text-xs">{picker.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        ⭐ {picker.rating} • {picker.completedJobsToday} jobs today • {picker.serviceAreas.join(", ")}
                      </div>
                    </div>
                    <Badge variant="outline" className="border-purple-300 text-purple-800 text-[10px] font-bold">
                      Score: {picker.fairnessPriorityScore}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t">
              <Button variant="outline" onClick={() => setReassignModalReq(null)} className="rounded-xl text-xs">
                Cancel
              </Button>
              <Button
                onClick={() => handleReassignPicker(reassignModalReq.id, selectedNewPickerId)}
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold"
              >
                Confirm Reassignment
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {activeReceipt && (
        <ReceiptModal pickup={activeReceipt} onClose={() => setActiveReceipt(null)} />
      )}
    </div>
  );
}