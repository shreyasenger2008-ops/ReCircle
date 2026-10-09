"use client";

import { useAuth } from "@/lib/auth-context";
import { MOCK_USERS, MOCK_PICKERS, MOCK_REQUESTS, MOCK_DISPUTES } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, ShieldCheck, Truck, Leaf, Banknote, AlertTriangle, Scale, Activity, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const { user } = useAuth();

  if (!user || user.role !== "admin") {
    return <div className="p-8">Unauthorized. Please log in as an Admin/NGO.</div>;
  }

  // Calculate System-Wide Metrics
  const totalUsers = MOCK_USERS.length + 1250; // Add mock baseline
  
  const verifiedPickers = MOCK_USERS.filter(u => u.role === "picker" && u.verificationStatus === "verified").length + 342;
  
  const totalPickups = MOCK_REQUESTS.length + 8450;
  
  const completedPickups = MOCK_REQUESTS.filter(r => r.status === "completed");
  const wasteRecycled = completedPickups.reduce((sum, r) => sum + (r.finalWeight || r.estimatedWeight), 0) + 125000; // kg
  
  const fairIncomeGenerated = completedPickups.reduce((sum, r) => sum + (r.finalPrice || r.estimatedPrice), 0) + 4200000; // ₹
  
  const activeDisputes = MOCK_DISPUTES.filter(d => d.status === "open").length;

  const avgFairnessScore = MOCK_PICKERS.reduce((sum, p) => sum + p.fairnessPriorityScore, 0) / (MOCK_PICKERS.length || 1);

  // Generate Activity Feed
  const recentActivity = [
    { id: 1, type: 'pickup', title: "Pickup Completed", desc: "Rajesh (Generator) & Ramesh (Picker) completed a 15kg plastic pickup.", time: "10 mins ago", icon: Truck, color: "text-green-500", bg: "bg-green-100" },
    { id: 2, type: 'payment', title: "Fair Wage Disbursed", desc: "₹367 routed to Ramesh securely via UPI.", time: "12 mins ago", icon: Banknote, color: "text-purple-500", bg: "bg-purple-100" },
    { id: 3, type: 'user', title: "New Picker Verified", desc: "Suresh's background check passed. Status updated to Verified.", time: "1 hour ago", icon: ShieldCheck, color: "text-blue-500", bg: "bg-blue-100" },
    { id: 4, type: 'dispute', title: "Dispute Raised", desc: "Priya raised a dispute for delayed pickup #req2.", time: "3 hours ago", icon: AlertTriangle, color: "text-red-500", bg: "bg-red-100" },
    { id: 5, type: 'impact', title: "Milestone Reached", desc: "Platform crossed 125,000 kg of total recycled waste!", time: "5 hours ago", icon: Leaf, color: "text-emerald-500", bg: "bg-emerald-100" },
  ];

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Admin Overview</h2>
          <p className="text-slate-500">Platform health, social impact, and real-time operations.</p>
        </div>
      </div>

      {/* Top Priority Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <Card className="bg-slate-900 text-white shadow-md border-0">
          <CardContent className="p-5 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-slate-400 mb-1">Fair Income Generated</p>
              <h3 className="text-2xl font-bold text-green-400">₹{(fairIncomeGenerated / 100000).toFixed(2)}L</h3>
            </div>
            <div className="bg-slate-800 p-3 rounded-full hidden sm:block">
              <Banknote className="h-6 w-6 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-t-4 border-t-emerald-500">
          <CardContent className="p-5 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Waste Recycled</p>
              <h3 className="text-2xl font-bold text-slate-900">{(wasteRecycled / 1000).toFixed(1)}k <span className="text-lg">kg</span></h3>
            </div>
            <div className="bg-emerald-50 p-3 rounded-full hidden sm:block">
              <Leaf className="h-6 w-6 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-t-4 border-t-blue-500">
          <CardContent className="p-5 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Verified Pickers</p>
              <h3 className="text-2xl font-bold text-slate-900">{verifiedPickers}</h3>
            </div>
            <div className="bg-blue-50 p-3 rounded-full hidden sm:block">
              <ShieldCheck className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-t-4 border-t-red-500">
          <CardContent className="p-5 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Active Disputes</p>
              <h3 className="text-2xl font-bold text-slate-900">{activeDisputes}</h3>
            </div>
            <div className="bg-red-50 p-3 rounded-full hidden sm:block">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-1 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-slate-100 p-2 rounded-full shrink-0"><Users className="h-5 w-5 text-slate-600" /></div>
            <div>
              <div className="text-xl font-bold text-slate-900">{totalUsers}</div>
              <div className="text-xs text-slate-500 font-medium">Total Platform Users</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-slate-100 p-2 rounded-full shrink-0"><Truck className="h-5 w-5 text-slate-600" /></div>
            <div>
              <div className="text-xl font-bold text-slate-900">{totalPickups}</div>
              <div className="text-xs text-slate-500 font-medium">Total Pickups Handled</div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-yellow-100 p-2 rounded-full shrink-0"><Scale className="h-5 w-5 text-yellow-600" /></div>
            <div>
              <div className="text-xl font-bold text-slate-900">{avgFairnessScore.toFixed(0)}/100</div>
              <div className="text-xs text-slate-500 font-medium">Avg Fairness Score</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Main Feed */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-slate-500" />
                <CardTitle className="text-lg">Recent Platform Activity</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {recentActivity.map(event => (
                  <div key={event.id} className="p-5 flex gap-4 hover:bg-slate-50 transition-colors">
                    <div className={`${event.bg} ${event.color} p-3 rounded-full h-12 w-12 flex items-center justify-center shrink-0`}>
                      <event.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-slate-900 text-sm">{event.title}</h4>
                        <span className="text-xs text-slate-400">• {event.time}</span>
                      </div>
                      <p className="text-sm text-slate-600">{event.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t bg-slate-50 text-center">
                <Button variant="ghost" className="text-blue-600 text-sm">
                  View Full Audit Log <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions / Shortcuts */}
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-800 text-lg">Admin Shortcuts</h3>
          
          <Link href="/admin/disputes" className="block">
            <Card className="hover:border-red-400 hover:shadow-md transition-all cursor-pointer">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-red-100 p-2 rounded"><AlertTriangle className="h-5 w-5 text-red-600" /></div>
                  <div className="font-medium text-slate-900">Resolve Disputes</div>
                </div>
                {activeDisputes > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">{activeDisputes}</span>}
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/users" className="block">
            <Card className="hover:border-blue-400 hover:shadow-md transition-all cursor-pointer">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded"><ShieldCheck className="h-5 w-5 text-blue-600" /></div>
                  <div className="font-medium text-slate-900">Verify New Pickers</div>
                </div>
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">New</span>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/fairness-analytics" className="block">
            <Card className="hover:border-purple-400 hover:shadow-md transition-all cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded"><Scale className="h-5 w-5 text-purple-600" /></div>
                <div className="font-medium text-slate-900">Fairness Analytics</div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/price-board" className="block">
            <Card className="hover:border-green-400 hover:shadow-md transition-all cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded"><Banknote className="h-5 w-5 text-green-600" /></div>
                <div className="font-medium text-slate-900">Adjust Price Board</div>
              </CardContent>
            </Card>
          </Link>
        </div>

      </div>
    </div>
  );
}
