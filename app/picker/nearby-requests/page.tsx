"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { MOCK_REQUESTS, MOCK_PICKERS } from "@/lib/mock-data";
import { getDistance } from "@/lib/fair-match";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MapPin, Clock, Banknote, AlertTriangle, Scale, Filter, CheckCircle2, Navigation } from "lucide-react";
import { toast } from "sonner";

export default function NearbyRequests() {
  const { user } = useAuth();

  const [wasteTypeFilter, setWasteTypeFilter] = useState("all");
  const [distanceFilter, setDistanceFilter] = useState<number>(15); // Max km
  const [paymentFilter, setPaymentFilter] = useState<number>(0); // Min payment
  const [urgencyFilter, setUrgencyFilter] = useState("all");

  const [refreshKey, setRefreshKey] = useState(0);

  if (!user || user.role !== "picker") {
    return <div className="p-8">Unauthorized. Please log in as a Waste-Picker.</div>;
  }

  const pickerProfile = MOCK_PICKERS.find(p => p.userId === user.id);
  const pickerLoc = pickerProfile?.currentLocation || { lat: 12.9716, lng: 77.5946 };

  const pendingRequests = MOCK_REQUESTS.filter(r => r.status === "pending").map(req => {
    const dist = getDistance(pickerLoc.lat, pickerLoc.lng, req.location.lat, req.location.lng);
    return { ...req, distanceKm: dist };
  });

  const filteredRequests = pendingRequests.filter(req => {
    if (wasteTypeFilter !== "all" && !req.wasteType.toLowerCase().includes(wasteTypeFilter.toLowerCase())) return false;
    if (req.distanceKm > distanceFilter) return false;
    if (req.estimatedPrice < paymentFilter) return false;
    if (urgencyFilter !== "all" && req.urgency !== urgencyFilter) return false;
    return true;
  }).sort((a, b) => a.distanceKm - b.distanceKm); // Sort by closest first

  const acceptPickup = (id: string) => {
    const req = MOCK_REQUESTS.find(r => r.id === id);
    if (req) {
      req.status = "accepted";
      req.matchedPickerId = user.id;
      req.pickerName = user.name;
      toast.success("Pickup Accepted! It has been added to your route.");
      setRefreshKey(prev => prev + 1); // Trigger re-render
    }
  };

  return (
    <div className="space-y-6 pb-20">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Nearby Requests</h2>
          <p className="text-slate-500">Find and accept new pickups in your area.</p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center border border-blue-100">
          <Navigation className="mr-2 h-4 w-4" />
          Location Active: {pickerProfile?.serviceAreas.join(", ") || "Unknown Area"}
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-white">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-slate-500" />
            <h3 className="font-semibold text-slate-700">Filter Requests</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block uppercase tracking-wider">Waste Type</label>
              <select 
                className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                value={wasteTypeFilter}
                onChange={(e) => setWasteTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="Plastic">Plastic</option>
                <option value="Cardboard">Cardboard</option>
                <option value="Metal">Metal</option>
                <option value="E-Waste">E-Waste</option>
                <option value="Mixed">Mixed</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block uppercase tracking-wider">Max Distance (km): {distanceFilter}</label>
              <input 
                type="range" 
                min="1" 
                max="30" 
                value={distanceFilter} 
                onChange={(e) => setDistanceFilter(parseInt(e.target.value))}
                className="w-full h-10"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block uppercase tracking-wider">Min Payment (₹)</label>
              <Input 
                type="number" 
                min="0" 
                step="50" 
                value={paymentFilter || ""}
                onChange={(e) => setPaymentFilter(parseInt(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block uppercase tracking-wider">Urgency</label>
              <select 
                className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
              >
                <option value="all">Any Urgency</option>
                <option value="normal">Normal</option>
                <option value="medium">Medium</option>
                <option value="high">High / Urgent</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        <div className="text-sm font-medium text-slate-500">
          Showing {filteredRequests.length} available {filteredRequests.length === 1 ? 'request' : 'requests'}
        </div>

        {filteredRequests.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center flex flex-col items-center">
              <MapPin className="h-12 w-12 text-slate-300 mb-3" />
              <h3 className="text-lg font-bold text-slate-700">No requests found</h3>
              <p className="text-slate-500 mt-1">Try adjusting your filters or checking back later.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-2 gap-4">
            {filteredRequests.map(req => (
              <Card key={req.id} className="hover:border-slate-400 transition-colors overflow-hidden flex flex-col">
                {req.urgency === "high" || req.urgency === "urgent" ? (
                  <div className="bg-red-500 text-white text-xs font-bold uppercase tracking-widest text-center py-1">
                    Urgent Pickup
                  </div>
                ) : null}
                <CardContent className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-bold text-lg text-slate-900">{req.wasteType}</div>
                        <div className="text-sm text-slate-500">{req.generatorName}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black text-green-600">₹{req.estimatedPrice.toFixed(0)}</div>
                        <Badge variant="outline" className="mt-1 border-green-200 text-green-700 bg-green-50">Fair Match</Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                        <div>
                          <div className="text-xs uppercase text-slate-500 font-semibold tracking-wider">Distance</div>
                          <div className="text-sm font-medium text-slate-700">{req.distanceKm.toFixed(1)} km away</div>
                          <div className="text-xs text-slate-500 mt-0.5">{req.address}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <Scale className="h-4 w-4 text-slate-400 mt-0.5" />
                        <div>
                          <div className="text-xs uppercase text-slate-500 font-semibold tracking-wider">Weight</div>
                          <div className="text-sm font-medium text-slate-700">~{req.estimatedWeight} kg</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2 col-span-2">
                        <Clock className="h-4 w-4 text-slate-400 mt-0.5" />
                        <div>
                          <div className="text-xs uppercase text-slate-500 font-semibold tracking-wider">Time Slot</div>
                          <div className="text-sm font-medium text-slate-700">{req.preferredTime || "Anytime"}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t mt-auto flex gap-3">
                    <Button className="flex-1 bg-slate-900 hover:bg-slate-800" onClick={() => acceptPickup(req.id)}>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Accept Request
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}