"use client";

import { useAuth } from "@/lib/auth-context";
import { MOCK_REQUESTS, MOCK_PICKERS, PickupRequest } from "@/lib/mock-data";
import { getDistance } from "@/lib/fair-match";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Map as MapIcon, ArrowDown, Banknote, Clock, Truck } from "lucide-react";
import Link from "next/link";

export default function RoutePlanner() {
  const { user } = useAuth();

  if (!user || user.role !== "picker") {
    return <div className="p-8">Unauthorized.</div>;
  }

  const pickerProfile = MOCK_PICKERS.find(p => p.userId === user.id);
  const startLoc = pickerProfile?.currentLocation || { lat: 12.9716, lng: 77.5946 };

  // Get active route requests
  const activeRequests = MOCK_REQUESTS.filter(r => 
    r.matchedPickerId === user.id && 
    (r.status === "accepted" || r.status === "on_the_way")
  );

  // TSP Nearest Neighbor Sorting
  let currentLoc = startLoc;
  let remainingReqs = [...activeRequests];
  const sortedRoute: (PickupRequest & { distanceFromLast: number })[] = [];
  let totalDistance = 0;

  while (remainingReqs.length > 0) {
    // Find closest
    let closestIdx = 0;
    let minDistance = Infinity;

    for (let i = 0; i < remainingReqs.length; i++) {
      const dist = getDistance(currentLoc.lat, currentLoc.lng, remainingReqs[i].location.lat, remainingReqs[i].location.lng);
      if (dist < minDistance) {
        minDistance = dist;
        closestIdx = i;
      }
    }

    const nextStop = remainingReqs.splice(closestIdx, 1)[0];
    sortedRoute.push({ ...nextStop, distanceFromLast: minDistance });
    totalDistance += minDistance;
    currentLoc = nextStop.location;
  }

  const totalEarnings = sortedRoute.reduce((sum, req) => sum + (req.finalPrice || req.estimatedPrice), 0);

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Navigation className="h-6 w-6 text-blue-600" />
            Smart Route Planner
          </h2>
          <p className="text-slate-500">Optimized pickup path to maximize earnings and minimize travel.</p>
        </div>
      </div>

      {activeRequests.length === 0 ? (
        <Card className="border-dashed bg-transparent shadow-none">
          <CardContent className="p-12 text-center text-slate-500 flex flex-col items-center">
            <MapIcon className="h-12 w-12 text-slate-300 mb-3" />
            <h3 className="text-lg font-bold text-slate-700">No active pickups</h3>
            <p className="text-slate-500 mt-1 mb-4">Accept requests from the Nearby Requests page to build your route.</p>
            <Link href="/picker/nearby-requests">
              <Button className="bg-slate-900 hover:bg-slate-800">Find Nearby Requests</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          
          {/* Left Column: Route List */}
          <div className="space-y-4">
            
            <div className="bg-slate-900 text-white rounded-xl p-5 flex justify-between shadow-md">
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Expected Route Earnings</p>
                <div className="text-3xl font-bold text-green-400">₹{totalEarnings.toFixed(0)}</div>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Total Distance</p>
                <div className="text-xl font-bold">{totalDistance.toFixed(1)} km</div>
              </div>
            </div>

            <div className="relative pl-6 space-y-4 mt-8">
              {/* Route Line connecting nodes */}
              <div className="absolute top-2 bottom-2 left-[11px] w-0.5 bg-slate-200" />

              {/* Start Point */}
              <div className="relative">
                <div className="absolute -left-6 top-1 h-5 w-5 rounded-full bg-slate-900 border-4 border-white shadow-sm z-10 flex items-center justify-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-white" />
                </div>
                <div className="pl-4">
                  <h4 className="font-bold text-slate-900">Current Location</h4>
                  <p className="text-xs text-slate-500">Starting Point</p>
                </div>
              </div>

              {/* Stops */}
              {sortedRoute.map((req, idx) => (
                <div key={req.id} className="relative pt-4">
                  {/* Distance indicator between nodes */}
                  <div className="absolute -left-8 -top-2 bg-white px-1 text-[10px] font-bold text-slate-400 z-10 flex items-center flex-col">
                    <ArrowDown className="h-3 w-3 mb-0.5" />
                    {req.distanceFromLast.toFixed(1)} km
                  </div>

                  <div className="absolute -left-6 top-5 h-5 w-5 rounded-full bg-blue-500 border-4 border-white shadow-sm z-10 flex items-center justify-center text-[10px] font-black text-white">
                    {idx + 1}
                  </div>
                  
                  <Card className={`ml-4 ${req.status === 'on_the_way' ? 'border-blue-400 shadow-md ring-1 ring-blue-400' : 'shadow-sm'}`}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{req.address}</h4>
                          <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Clock className="h-3 w-3" /> {req.preferredTime || "Anytime"}
                          </div>
                        </div>
                        <Badge variant="outline" className={req.status === 'on_the_way' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}>
                          {req.status === 'on_the_way' ? 'Next Stop' : `Stop ${idx + 1}`}
                        </Badge>
                      </div>

                      <div className="bg-slate-50 rounded p-3 flex justify-between items-center mt-3">
                        <div>
                          <div className="text-xs font-semibold text-slate-700">{req.wasteType}</div>
                          <div className="text-xs text-slate-500">~{req.estimatedWeight} kg</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-green-600 flex items-center gap-1 justify-end">
                            <Banknote className="h-3 w-3" /> ₹{(req.finalPrice || req.estimatedPrice).toFixed(0)}
                          </div>
                          {req.urgency === 'high' && <div className="text-[10px] uppercase font-bold text-red-500 mt-0.5">Urgent</div>}
                        </div>
                      </div>

                    </CardContent>
                  </Card>
                </div>
              ))}
              
            </div>
          </div>

          {/* Right Column: Map Mock */}
          <div className="h-[600px] bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 relative overflow-hidden flex flex-col items-center justify-center sticky top-6">
            <MapIcon className="h-24 w-24 text-slate-300 absolute opacity-20" />
            
            {/* Fake SVG Map Lines */}
            <svg className="absolute inset-0 h-full w-full opacity-50" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M 20 80 Q 40 50 60 70 T 80 20" fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="2,2" />
              <circle cx="20" cy="80" r="1.5" fill="#0f172a" />
              <circle cx="60" cy="70" r="1.5" fill="#3b82f6" />
              <circle cx="80" cy="20" r="1.5" fill="#3b82f6" />
            </svg>

            <div className="bg-white/90 backdrop-blur p-4 rounded-lg shadow-lg text-center relative z-10 max-w-[80%]">
              <Truck className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-bold text-slate-900">Live Navigation Mock</h4>
              <p className="text-xs text-slate-500 mt-1">In a production environment, this area would render a Google Maps or Mapbox integration showing live turn-by-turn directions connecting the stops.</p>
              
              <Link href="/picker/my-pickups">
                <Button size="sm" className="mt-4 w-full bg-blue-600 hover:bg-blue-700">Open Active Job Details</Button>
              </Link>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}