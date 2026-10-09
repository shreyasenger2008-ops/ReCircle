"use client";

import { useAuth } from "@/lib/auth-context";
import { MOCK_REQUESTS } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Leaf, Wind, Trash2, Banknote, Users, CheckCircle2 } from "lucide-react";
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
  Line,
  Legend
} from "recharts";

export default function ImpactDashboard() {
  const { user } = useAuth();

  if (!user || user.role !== "generator") {
    return <div className="p-8">Unauthorized.</div>;
  }

  // Calculate Real Metrics
  const myCompleted = MOCK_REQUESTS.filter(r => r.generatorId === user.id && r.status === "completed");
  
  const baseWaste = myCompleted.reduce((sum, r) => sum + (r.finalWeight || r.estimatedWeight), 0);
  const totalWaste = baseWaste + 450; // Add mock historical baseline for UI fullness
  
  const co2Saved = totalWaste * 1.8;
  const landfillAvoided = totalWaste;
  
  const baseIncome = myCompleted.reduce((sum, r) => sum + (r.finalPrice || r.estimatedPrice), 0);
  const fairIncomeGenerated = baseIncome + 8450; // Mock historical baseline
  
  const uniquePickers = new Set(myCompleted.map(r => r.matchedPickerId));
  const pickersSupported = uniquePickers.size + 4; // Mock baseline
  
  const pickupsCompleted = myCompleted.length + 18; // Mock baseline

  // Mock Chart Data
  const monthlyData = [
    { month: "Jan", waste: 45, income: 750 },
    { month: "Feb", waste: 52, income: 820 },
    { month: "Mar", waste: 48, income: 780 },
    { month: "Apr", waste: 70, income: 1100 },
    { month: "May", waste: 65, income: 950 },
    { month: "Jun", waste: 85, income: 1400 },
    { month: "Jul", waste: Math.round(85 + baseWaste), income: Math.round(1400 + baseIncome) },
  ];

  const wasteDistribution = [
    { name: "Plastic", value: 45, color: "#3b82f6" },
    { name: "Cardboard", value: 25, color: "#eab308" },
    { name: "Glass", value: 15, color: "#10b981" },
    { name: "Metal", value: 10, color: "#64748b" },
    { name: "E-Waste", value: 5, color: "#8b5cf6" },
  ];

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">My Impact Report</h2>
        <p className="text-slate-500">Track your environmental contribution and social footprint.</p>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-md">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-100 mb-1">Total Waste Recycled</p>
              <h3 className="text-3xl font-black">{totalWaste.toFixed(1)} <span className="text-xl">kg</span></h3>
            </div>
            <div className="bg-white/20 p-3 rounded-full hidden sm:block">
              <Leaf className="h-6 w-6 text-white" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-md">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-100 mb-1">CO₂ Emissions Saved</p>
              <h3 className="text-3xl font-black">{co2Saved.toFixed(1)} <span className="text-xl">kg</span></h3>
            </div>
            <div className="bg-white/20 p-3 rounded-full hidden sm:block">
              <Wind className="h-6 w-6 text-white" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-md col-span-2 lg:col-span-1">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-100 mb-1">Fair Income Generated</p>
              <h3 className="text-3xl font-black">₹{fairIncomeGenerated.toFixed(0)}</h3>
            </div>
            <div className="bg-white/20 p-3 rounded-full hidden sm:block">
              <Banknote className="h-6 w-6 text-white" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-orange-100 p-3 rounded-full shrink-0">
              <Trash2 className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{landfillAvoided.toFixed(1)} kg</div>
              <div className="text-xs text-slate-500 font-medium">Landfill Avoided</div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-indigo-100 p-3 rounded-full shrink-0">
              <Users className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{pickersSupported}</div>
              <div className="text-xs text-slate-500 font-medium">Waste-Pickers Supported</div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-teal-100 p-3 rounded-full shrink-0">
              <CheckCircle2 className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{pickupsCompleted}</div>
              <div className="text-xs text-slate-500 font-medium">Pickups Completed</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* Waste Recycled Over Time (Line Chart) */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Waste Recycled Over Time</CardTitle>
            <CardDescription>Monthly breakdown of recycling volume (kg)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [`${value} kg`, "Waste"]}
                  />
                  <Line type="monotone" dataKey="waste" stroke="#22c55e" strokeWidth={3} dot={{r: 4, fill: '#22c55e'}} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Waste Type Distribution (Pie Chart) */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Material Distribution</CardTitle>
            <CardDescription>Breakdown by material type (%)</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={wasteDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {wasteDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [`${value}%`, "Share"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 mt-2 w-full">
              {wasteDistribution.map((entry) => (
                <div key={entry.name} className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                  {entry.name}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Income Generated for Pickers (Bar Chart) */}
        <Card className="shadow-sm lg:col-span-2 border-t-4 border-t-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Fair Income Generated for Workers</CardTitle>
            <CardDescription>Total wages directed to verified waste-pickers every month (₹)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [`₹${value}`, "Income"]}
                  />
                  <Bar dataKey="income" fill="#a855f7" radius={[4, 4, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}