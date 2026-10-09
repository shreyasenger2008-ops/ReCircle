"use client";

import { useAuth } from "@/lib/auth-context";
import { MOCK_REQUESTS, MOCK_IMPACTS } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Recycle, Leaf, DollarSign, CalendarCheck, ArrowRight, Activity, MapPin } from "lucide-react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function GeneratorDashboard() {
  const { user } = useAuth();

  if (!user || user.role !== "generator") {
    return <div className="p-8">Unauthorized. Please log in as a Waste Generator.</div>;
  }

  // Get user's requests
  const userRequests = MOCK_REQUESTS.filter(r => r.generatorId === user.id);
  const completedRequests = userRequests.filter(r => r.status === "completed");
  const activeRequests = userRequests.filter(r => r.status !== "completed");

  // Calculate Metrics
  const totalPickups = completedRequests.length;
  const totalWaste = completedRequests.reduce((acc, req) => acc + (req.finalWeight || req.estimatedWeight || 0), 0);
  
  // Try to find matching impact records, fallback to an estimate
  const totalCo2Saved = completedRequests.reduce((acc, req) => {
    const impact = MOCK_IMPACTS.find(i => i.pickupId === req.id);
    return acc + (impact ? impact.co2Saved : (req.estimatedWeight * 2));
  }, 0);

  const fairIncomeGenerated = completedRequests.reduce((acc, req) => {
    const impact = MOCK_IMPACTS.find(i => i.pickupId === req.id);
    return acc + (impact ? impact.incomeGenerated : req.payoutAmount);
  }, 0);

  // Mock data for impact chart
  const impactData = [
    { name: 'Week 1', waste: 4, co2: 8 },
    { name: 'Week 2', waste: 7, co2: 14 },
    { name: 'Week 3', waste: 3, co2: 6 },
    { name: 'Week 4', waste: totalWaste > 0 ? totalWaste : 10, co2: totalCo2Saved > 0 ? totalCo2Saved : 20 },
  ];

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Welcome back, {user.name.split(' ')[0]}</h2>
          <p className="text-slate-500">Here is your recycling impact and pickup status.</p>
        </div>
        <Link href="/generator/schedule-pickup">
          <Button size="lg" className="bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl transition-all">
            <CalendarCheck className="mr-2 h-5 w-5" />
            Schedule Pickup
          </Button>
        </Link>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-t-4 border-t-blue-500">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Pickups Completed</p>
                <h3 className="text-3xl font-bold text-slate-900">{totalPickups}</h3>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                <CalendarCheck className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-green-500">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Waste Recycled</p>
                <h3 className="text-3xl font-bold text-slate-900">{totalWaste.toFixed(1)} <span className="text-lg text-slate-500 font-normal">kg</span></h3>
              </div>
              <div className="p-3 bg-green-50 text-green-600 rounded-full">
                <Recycle className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-teal-500">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">CO₂ Emissions Saved</p>
                <h3 className="text-3xl font-bold text-slate-900">{totalCo2Saved.toFixed(1)} <span className="text-lg text-slate-500 font-normal">kg</span></h3>
              </div>
              <div className="p-3 bg-teal-50 text-teal-600 rounded-full">
                <Leaf className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-yellow-500">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Fair Income Generated</p>
                <h3 className="text-3xl font-bold text-slate-900">₹{fairIncomeGenerated.toFixed(0)}</h3>
              </div>
              <div className="p-3 bg-yellow-50 text-yellow-600 rounded-full">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Main Left Column (Impact Chart + Recent Pickups) */}
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Your Environmental Impact</CardTitle>
              <CardDescription>Waste recycled and CO₂ emissions saved over the last 4 weeks</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={impactData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: '#f1f5f9'}} />
                  <Bar dataKey="waste" name="Waste (kg)" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="co2" name="CO₂ Saved (kg)" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">Recent Pickups</h3>
              <Link href="/generator/my-pickups" className="text-sm font-medium text-green-600 hover:text-green-700 flex items-center">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            
            <div className="space-y-4">
              {completedRequests.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="p-8 text-center text-slate-500">
                    You haven't completed any pickups yet. Schedule one today!
                  </CardContent>
                </Card>
              ) : (
                completedRequests.slice(0, 3).map(req => (
                  <Card key={req.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-5 flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                          <CheckIcon />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{req.wasteType}</div>
                          <div className="text-sm text-slate-500">
                            {new Date(req.createdAt).toLocaleDateString()} • {req.finalWeight || req.estimatedWeight} kg
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">₹{req.finalPrice || req.payoutAmount}</div>
                        <div className="text-xs text-slate-500 mt-1">Paid to Picker</div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar (Active Pickups) */}
        <div className="space-y-6">
          <Card className="bg-slate-900 text-white overflow-hidden relative">
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-slate-800 opacity-50 blur-xl"></div>
            
            <CardHeader className="relative z-10 pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-400" />
                Active Pickups
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 pt-2">
              {activeRequests.length === 0 ? (
                <div className="text-slate-400 text-sm py-4">
                  No active pickups at the moment.
                </div>
              ) : (
                <div className="space-y-4">
                  {activeRequests.map(req => (
                    <div key={req.id} className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
                      <div className="flex justify-between items-start mb-3">
                        <Badge variant={req.status === "accepted" ? "success" : "warning"} className="bg-opacity-20">
                          {req.status === "accepted" ? "En Route" : "Looking for picker"}
                        </Badge>
                        <span className="text-xs text-slate-400">{req.preferredTime}</span>
                      </div>
                      <div className="font-medium text-slate-100 mb-1">{req.wasteType}</div>
                      <div className="text-sm text-slate-400 flex items-center mb-3">
                        <MapPin className="h-3 w-3 mr-1" /> {req.address}
                      </div>
                      
                      {req.matchedPickerId && req.pickerName ? (
                        <div className="pt-3 border-t border-slate-700 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-slate-700 flex items-center justify-center text-xs">
                              {req.pickerName.charAt(0)}
                            </div>
                            <span className="text-sm text-slate-300">{req.pickerName}</span>
                          </div>
                          <span className="text-xs text-slate-400 hover:text-white cursor-pointer transition-colors">Contact</span>
                        </div>
                      ) : (
                        <div className="pt-3 border-t border-slate-700 text-xs text-slate-400 text-center animate-pulse">
                          Matching with nearby workers...
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Eco Tip Card */}
          <Card className="bg-green-50 border-green-100">
            <CardContent className="p-5">
              <div className="flex gap-3">
                <Leaf className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-green-800 mb-1">Eco Tip</h4>
                  <p className="text-sm text-green-700 leading-relaxed">
                    Rinsing plastic containers before recycling increases their material value by up to 20%, ensuring better pay for waste-pickers.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}

function CheckIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
