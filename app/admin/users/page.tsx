"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { MOCK_USERS, User } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Users, ShieldCheck, Search, Filter, CheckCircle2, XCircle, 
  Clock, Award, Phone, Mail, MapPin, Eye, Check, X
} from "lucide-react";
import { toast } from "sonner";

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [userList, setUserList] = useState<User[]>(MOCK_USERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "generator" | "picker" | "admin">("all");

  if (!user || user.role !== "admin") {
    return <div className="p-8">Unauthorized. Please log in as an Admin / NGO.</div>;
  }

  const handleApprove = (userId: string) => {
    setUserList(prev => prev.map(u => u.id === userId ? { ...u, verificationStatus: "verified" as const } : u));
    toast.success("User identity verified and certified on the platform!");
  };

  const handleReject = (userId: string) => {
    setUserList(prev => prev.map(u => u.id === userId ? { ...u, verificationStatus: "rejected" as const } : u));
    toast.error("User verification rejected.");
  };

  const filteredUsers = userList.filter(u => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (searchTerm && !u.name.toLowerCase().includes(searchTerm.toLowerCase()) && !u.email.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const pendingCount = userList.filter(u => u.verificationStatus === "pending").length;
  const verifiedPickers = userList.filter(u => u.role === "picker" && u.verificationStatus === "verified").length;
  const totalGenerators = userList.filter(u => u.role === "generator").length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-purple-600" />
            Users & Verification Management
          </h2>
          <p className="text-slate-500">Review municipal ID uploads, verify informal workers, and manage trust scores.</p>
        </div>
        <Badge variant="outline" className="border-purple-300 bg-purple-50 text-purple-800 text-sm py-1.5 px-3">
          📋 {pendingCount} Pending Verifications
        </Badge>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-sm border-slate-200">
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

        <Card className="shadow-sm border-slate-200">
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

        <Card className="shadow-sm border-slate-200">
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
      <Card className="shadow-sm border-slate-200">
        <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email..."
              className="pl-9 rounded-xl text-sm"
            />
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 w-full sm:w-auto">
            {(["all", "picker", "generator", "admin"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                  roleFilter === r ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {r === "all" ? "All Roles" : r}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Table */}
      <Card className="shadow-sm border-slate-200 overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                <tr>
                  <th className="px-6 py-4 font-bold">User Identity</th>
                  <th className="px-6 py-4 font-bold">Role</th>
                  <th className="px-6 py-4 font-bold">Verification</th>
                  <th className="px-6 py-4 font-bold">Trust Score</th>
                  <th className="px-6 py-4 font-bold">Location</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
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
                      <Badge variant="outline" className={`text-xs capitalize ${
                        u.role === 'picker' ? 'bg-green-50 text-green-800 border-green-200' :
                        u.role === 'admin' ? 'bg-purple-50 text-purple-800 border-purple-200' :
                        'bg-blue-50 text-blue-800 border-blue-200'
                      }`}>
                        {u.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
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
                    <td className="px-6 py-4 text-xs text-slate-500 max-w-xs truncate">
                      {u.address}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {u.verificationStatus === "pending" ? (
                        <div className="flex justify-end gap-1.5">
                          <Button size="sm" onClick={() => handleApprove(u.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 px-2.5 rounded-lg text-xs">
                            <Check className="h-3.5 w-3.5 mr-1" /> Approve ID
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleReject(u.id)} className="text-rose-600 hover:bg-rose-50 h-8 px-2 rounded-lg text-xs border-rose-200">
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-mono">ID Verified ✅</span>
                      )}
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