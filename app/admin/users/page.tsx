"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { usePlatformData } from "@/lib/platform-data-context";
import { User } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Users, ShieldCheck, Search, Filter, CheckCircle2, XCircle, 
  Clock, Award, Phone, Mail, MapPin, Eye, Check, X, FileText, AlertCircle
} from "lucide-react";
import { toast } from "sonner";

export default function AdminUsersPage() {
  const { user } = useAuth();
  const { users: userList, verifyUser, rejectUser } = usePlatformData();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "generator" | "picker" | "admin">("all");
  const [wardFilter, setWardFilter] = useState<string>("all");

  // Document Viewer Modal State
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  
  // Reject Reason Modal State
  const [rejectingUser, setRejectingUser] = useState<User | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  if (!user || user.role !== "admin") {
    return <div className="p-8 text-center text-slate-900 font-bold">Unauthorized. Please log in as an Admin / NGO.</div>;
  }

  const handleApprove = (userId: string) => {
    verifyUser(userId);
    setViewingUser(null);
  };

  const handleRejectConfirm = () => {
    if (!rejectingUser) return;
    if (!rejectReason.trim()) {
      toast.error("Please enter a specific reason for rejection.");
      return;
    }

    rejectUser(rejectingUser.id, rejectReason);
    setRejectingUser(null);
    setRejectReason("");
    setViewingUser(null);
  };

  const filteredUsers = userList.filter(u => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (wardFilter !== "all" && !u.address.toLowerCase().includes(wardFilter.toLowerCase())) return false;
    if (searchTerm && !u.name.toLowerCase().includes(searchTerm.toLowerCase()) && !u.email.toLowerCase().includes(searchTerm.toLowerCase()) && !u.phone.includes(searchTerm)) return false;
    return true;
  });

  const pendingCount = userList.filter(u => u.verificationStatus === "pending").length;
  const verifiedPickers = userList.filter(u => u.role === "picker" && u.verificationStatus === "verified").length;
  const totalGenerators = userList.filter(u => u.role === "generator").length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-purple-600" />
            Users & Verification Management
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">Review municipal ID uploads, verify informal workers, and manage trust scores.</p>
        </div>
        <Badge variant="outline" className="border-purple-300 bg-purple-50 text-purple-800 text-xs py-1.5 px-3 font-bold rounded-xl">
          📋 {pendingCount} Pending Verifications
        </Badge>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-xs border-slate-200 rounded-2xl bg-white">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl shrink-0">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{verifiedPickers}</div>
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Certified Waste-Pickers</div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-slate-200 rounded-2xl bg-white">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-700 rounded-2xl shrink-0">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{totalGenerators}</div>
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Registered Citizens / Orgs</div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-slate-200 rounded-2xl bg-white">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-amber-100 text-amber-700 rounded-2xl shrink-0">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-amber-600">{pendingCount}</div>
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Queue Awaiting Review</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="shadow-xs border-slate-200 rounded-2xl bg-white">
        <CardContent className="p-4 flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="relative w-full md:w-72">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search name, phone, email..."
              className="pl-9 rounded-xl text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Ward Filter */}
            <select
              value={wardFilter}
              onChange={(e) => setWardFilter(e.target.value)}
              className="h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Wards</option>
              <option value="150">Ward 150 (Bellandur)</option>
              <option value="Koramangala">Koramangala</option>
              <option value="Indiranagar">Indiranagar</option>
              <option value="HSR">HSR Layout</option>
            </select>

            {/* Role Filter */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              {(["all", "picker", "generator", "admin"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                    roleFilter === r ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {r === "all" ? "All" : r}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Table */}
      <Card className="shadow-xs border-slate-200 rounded-2xl bg-white overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                <tr>
                  <th className="px-6 py-4 font-bold">User Identity</th>
                  <th className="px-6 py-4 font-bold">Role</th>
                  <th className="px-6 py-4 font-bold">Verification</th>
                  <th className="px-6 py-4 font-bold">Trust Score</th>
                  <th className="px-6 py-4 font-bold">Location / Ward</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400 text-sm">
                      No users match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{u.name}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{u.phone}</span>
                          <span>•</span>
                          <span>{u.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={`text-xs capitalize font-bold ${
                          u.role === 'picker' ? 'bg-green-50 text-green-800 border-green-200' :
                          u.role === 'admin' ? 'bg-purple-50 text-purple-800 border-purple-200' :
                          'bg-blue-50 text-blue-800 border-blue-200'
                        }`}>
                          {u.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                          u.verificationStatus === 'verified' ? 'bg-emerald-100 text-emerald-800' :
                          u.verificationStatus === 'pending' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {u.verificationStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800">
                        ⭐ {u.trustScore.toFixed(1)} / 5.0
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600 max-w-xs truncate">
                        {u.address}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1.5 items-center">
                          {/* Document Viewer Button */}
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => setViewingUser(u)} 
                            className="h-8 px-2.5 rounded-lg text-xs border-slate-200 text-slate-700 hover:bg-slate-100"
                          >
                            <FileText className="h-3.5 w-3.5 mr-1 text-purple-600" /> View ID
                          </Button>

                          {u.verificationStatus === "pending" ? (
                            <>
                              <Button 
                                size="sm" 
                                onClick={() => handleApprove(u.id)} 
                                className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 px-2.5 rounded-lg text-xs font-bold"
                              >
                                <Check className="h-3.5 w-3.5 mr-1" /> Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => {
                                  setRejectingUser(u);
                                  setRejectReason("");
                                }} 
                                className="text-rose-600 hover:bg-rose-50 h-8 px-2 rounded-lg text-xs border-rose-200"
                                title="Reject verification"
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          ) : u.verificationStatus === "verified" ? (
                            <span className="text-xs text-emerald-700 font-bold px-1 flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Certified
                            </span>
                          ) : (
                            <span className="text-xs text-rose-600 font-bold px-1">Rejected</span>
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

      {/* ID Document Viewer Modal */}
      {viewingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <span className="text-[11px] uppercase font-bold text-purple-600 tracking-wider">Government & Municipal Credentials</span>
                <h3 className="text-lg font-bold text-slate-900">{viewingUser.name} - Verification Dossier</h3>
              </div>
              <button onClick={() => setViewingUser(null)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Document Card Mockup */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 text-white space-y-3 border border-slate-700 shadow-md">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/30">
                    BBMP
                  </div>
                  <div>
                    <div className="font-bold text-xs">MUNICIPAL CORP. WASTE PICKER ID</div>
                    <div className="text-[10px] text-slate-400">Bangalore Urban Waste Collective #KA-8831</div>
                  </div>
                </div>
                <Badge variant="outline" className="border-emerald-400 text-emerald-400 text-[10px] uppercase font-bold">
                  {viewingUser.verificationStatus}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs border-t border-slate-800">
                <div>
                  <span className="text-slate-400 text-[10px] block">Aadhaar (Last 4)</span>
                  <span className="font-mono font-bold text-white">XXXX-XXXX-8921</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Mobile Verified</span>
                  <span className="font-bold text-emerald-400 font-mono">{viewingUser.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Operational Ward</span>
                  <span className="font-bold text-white">{viewingUser.address}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Safety Gear Certification</span>
                  <span className="font-bold text-emerald-400">Level 1 (Gloves & Boots)</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-blue-600" /> NGO Verification Protocol
              </div>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                Physical biometric check and anti-monopoly registration confirmed by Green Ward Alliance field team.
              </p>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t">
              <Button variant="outline" onClick={() => setViewingUser(null)} className="rounded-xl text-xs">
                Close
              </Button>
              {viewingUser.verificationStatus === "pending" && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setRejectingUser(viewingUser);
                      setRejectReason("");
                    }}
                    className="border-rose-300 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-bold"
                  >
                    Reject with Reason
                  </Button>
                  <Button
                    onClick={() => handleApprove(viewingUser.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                  >
                    Approve & Issue Badge
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-start border-b pb-3">
              <div className="flex items-center gap-2 text-rose-600 font-bold">
                <AlertCircle className="h-5 w-5" />
                <span>Reject ID Verification</span>
              </div>
              <button onClick={() => setRejectingUser(null)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-600">
                Provide a reason for rejecting verification for <strong>{rejectingUser.name}</strong>. An automated SMS update will be dispatched.
              </p>
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Rejection Reason *</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g., Unclear Aadhaar photo / Ward jurisdiction mismatch / Missing safety gloves confirmation"
                  className="w-full min-h-[90px] rounded-xl border border-slate-300 p-3 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex flex-wrap gap-1.5">
                {["Blurry ID Document", "Ward Jurisdiction Mismatch", "Duplicate Phone Number", "Incomplete Aadhaar"].map((quick) => (
                  <button
                    key={quick}
                    type="button"
                    onClick={() => setRejectReason(quick)}
                    className="text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-md"
                  >
                    + {quick}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t">
              <Button variant="outline" onClick={() => setRejectingUser(null)} className="rounded-xl text-xs">
                Cancel
              </Button>
              <Button
                onClick={handleRejectConfirm}
                className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold"
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}