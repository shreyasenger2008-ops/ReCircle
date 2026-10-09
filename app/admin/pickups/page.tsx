"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { MOCK_REQUESTS, PickupRequest } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Trash2, Navigation, MapPin, Search, Filter, Clock, 
  CheckCircle2, AlertTriangle, UserCheck, RefreshCw, Eye
} from "lucide-react";
import { toast } from "sonner";
import ReceiptModal from "@/components/ReceiptModal";

export default function AdminPickupsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<PickupRequest[]>(MOCK_REQUESTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeReceipt, setActiveReceipt] = useState<PickupRequest | null>(null);

  if (!user || user.role !== "admin") {
    return <div className="p-8">Unauthorized. Please log in as an Admin / NGO.</div>;
  }

  const filteredRequests = requests.filter(r => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (searchTerm && !r.wasteType.toLowerCase().includes(searchTerm.toLowerCase()) && !r.address.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const totalVolume = requests.reduce((sum, r) => sum + (r.finalWeight || r.estimatedWeight || 0), 0);
  const totalPayout = requests.reduce((sum, r) => sum + (r.finalPrice || r.estimatedPrice || 0), 0);
  const activeDispatches = requests.filter(r => r.status === "accepted" || r.status === "on_the_way").length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Navigation className="h-6 w-6 text-purple-600" />
            Global Pickup & Dispatch Control
          </h2>
          <p className="text-slate-500">Monitor live waste matches, route status, and enforce anti-monopoly fair dispatching.</p>
        </div>
        <Badge variant="outline" className="border-purple-300 bg-purple-50 text-purple-800 text-sm py-1.5 px-3">
          📡 Real-Time Dispatch Radar
        </Badge>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-sm border-slate-200">
          <CardContent className="p-5">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Network Volume</div>
            <div className="text-3xl font-black text-slate-900">{totalVolume.toFixed(1)} kg</div>
            <div className="text-xs text-emerald-600 font-semibold mt-1">Diverted from city landfills</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardContent className="p-5">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Fair Wages Disbursed</div>
            <div className="text-3xl font-black text-emerald-600">₹{totalPayout.toFixed(0)}</div>
            <div className="text-xs text-slate-500 mt-1">100% direct to informal workers</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardContent className="p-5">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Active Route Dispatches</div>
            <div className="text-3xl font-black text-blue-600">{activeDispatches} Active</div>
            <div className="text-xs text-blue-700 font-semibold mt-1">Live tracking on field</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search */}
      <Card className="shadow-sm border-slate-200">
        <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search waste type or ward address..."
              className="pl-9 rounded-xl text-sm"
            />
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 w-full sm:w-auto overflow-x-auto">
            {(["all", "pending", "accepted", "on_the_way", "completed", "disputed"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-lg text-xs font-bold capitalize whitespace-nowrap transition-all ${
                  statusFilter === s ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {s.replace("_", " ")}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Orders List Table */}
      <Card className="shadow-sm border-slate-200 overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                <tr>
                  <th className="px-6 py-4 font-bold">Order ID</th>
                  <th className="px-6 py-4 font-bold">Material & Weight</th>
                  <th className="px-6 py-4 font-bold">Generator</th>
                  <th className="px-6 py-4 font-bold">Assigned Picker</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold">Fair Payout</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 font-mono">
                      #{req.id.replace("req", "")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{req.wasteType}</div>
                      <div className="text-xs text-slate-500">{req.estimatedWeight} kg estimated</div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-700">
                      <div className="font-semibold">{req.generatorName}</div>
                      <div className="text-slate-400 line-clamp-1">{req.address}</div>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-800">
                      {req.pickerName || <span className="text-amber-600">Pending Match</span>}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={`text-xs uppercase ${
                        req.status === 'completed' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                        req.status === 'disputed' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                        req.status === 'on_the_way' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                        'bg-slate-50 text-slate-700 border-slate-200'
                      }`}>
                        {req.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-600">
                      ₹{(req.finalPrice || req.estimatedPrice).toFixed(0)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {req.status === "completed" && (
                        <Button size="sm" variant="outline" onClick={() => setActiveReceipt(req)} className="h-8 rounded-lg text-xs">
                          <Eye className="h-3.5 w-3.5 mr-1" /> View Receipt
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Receipt Modal */}
      {activeReceipt && (
        <ReceiptModal pickup={activeReceipt} onClose={() => setActiveReceipt(null)} />
      )}
    </div>
  );
}