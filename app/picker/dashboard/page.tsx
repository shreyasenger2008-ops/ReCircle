"use client";

import { useAuth } from "@/lib/auth-context";
import { MOCK_REQUESTS, MOCK_PICKERS, MOCK_PAYMENTS } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, Banknote, CalendarCheck, Clock, MapPin, Map, CheckCircle2, Navigation, IndianRupee, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PickerDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user || user.role !== "picker") {
    return <div className="p-8">Unauthorized. Please log in as a Waste-Picker.</div>;
  }

  // Get specific picker profile
  const pickerProfile = MOCK_PICKERS.find(p => p.userId === user.id);
  
  if (!pickerProfile) {
    return <div className="p-8">Picker profile not found.</div>;
  }

  // Pending Payments Calculation (Completed jobs not yet in a 'completed' payment state, or just a mock)
  const myCompletedRequests = MOCK_REQUESTS.filter(r => r.matchedPickerId === user.id && r.status === "completed");
  const myCompletedPaymentsTotal = MOCK_PAYMENTS
    .filter(p => p.receiverId === user.id && p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);
  
  const totalEarnedFromPickups = myCompletedRequests.reduce((sum, r) => sum + (r.finalPrice || r.payoutAmount), 0);
  const pendingPaymentsAmount = Math.max(0, totalEarnedFromPickups - myCompletedPaymentsTotal);

  // Active Data
  const acceptedPickups = MOCK_REQUESTS.filter(r => r.matchedPickerId === user.id && r.status === "accepted");
  const nearbyRequests = MOCK_REQUESTS.filter(r => r.status === "pending");

  const markCompleted = (id: string) => {
    // In a real app, this would be an API call
    const req = MOCK_REQUESTS.find(r => r.id === id);
    if (req) {
      req.status = "completed";
      alert("Pickup marked as completed! Income added to pending payments.");
      // Trigger a re-render by doing a hard reload for simplicity in this demo without global state mutators
      window.location.reload();
    }
  };

  const acceptPickup = (id: string) => {
    const req = MOCK_REQUESTS.find(r => r.id === id);
    if (req) {
      req.status = "accepted";
      req.matchedPickerId = user.id;
      req.pickerName = user.name;
      alert("Pickup Accepted! It has been added to your route.");
      window.location.reload();
    }
  };

  return (
    <div className="space-y-8 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            Hello, {user.name.split(' ')[0]}
            {user.verificationStatus === 'verified' && (
              <ShieldCheck className="h-5 w-5 text-blue-500" title="Verified Worker" />
            )}
          </h2>
          <p className="text-slate-500">Here is your daily income and route summary.</p>
        </div>
        <div className="flex gap-2">
          <Badge variant={pickerProfile.availability === 'online' ? 'success' : 'warning'} className="px-3 py-1 text-sm">
            {pickerProfile.availability === 'online' ? 'Online & Accepting' : 'Busy'}
          </Badge>
        </div>
      </div>

      {/* Primary Income Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="bg-slate-900 text-white shadow-md border-0">
          <CardContent className="p-5 sm:p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-400 mb-1">Today's Earnings</p>
                <h3 className="text-2xl sm:text-3xl font-bold text-green-400">₹{pickerProfile.dailyEarnings}</h3>
              </div>
              <div className="p-2 sm:p-3 bg-slate-800 text-green-400 rounded-full">
                <Banknote className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>
            <div className="mt-4 text-xs text-slate-400">Goal: ₹800</div>
            <div className="mt-1 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-green-500" style={{ width: `${Math.min(100, (pickerProfile.dailyEarnings / 800) * 100)}%` }}></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-blue-500">
          <CardContent className="p-5 sm:p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-500 mb-1">Weekly Earnings</p>
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">₹{pickerProfile.weeklyEarnings}</h3>
              </div>
              <div className="p-2 sm:p-3 bg-blue-50 text-blue-600 rounded-full hidden sm:block">
                <Wallet className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-orange-500">
          <CardContent className="p-5 sm:p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-500 mb-1">Pending Payments</p>
                <h3 className="text-2xl sm:text-3xl font-bold text-orange-600">₹{pendingPaymentsAmount}</h3>
              </div>
              <div className="p-2 sm:p-3 bg-orange-50 text-orange-600 rounded-full hidden sm:block">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-purple-500">
          <CardContent className="p-5 sm:p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-500 mb-1">Jobs Completed</p>
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">{pickerProfile.completedJobsToday}</h3>
              </div>
              <div className="p-2 sm:p-3 bg-purple-50 text-purple-600 rounded-full hidden sm:block">
                <CalendarCheck className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Column: Route & Active Pickups */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Suggested Route Summary */}
          {acceptedPickups.length > 0 && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-5">
                <div className="flex gap-4">
                  <div className="mt-1 bg-blue-600 rounded-full p-2 h-10 w-10 flex items-center justify-center flex-shrink-0">
                    <Navigation className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-blue-900 mb-1">Suggested Route Summary</h3>
                    <p className="text-sm text-blue-800 mb-3">Optimize your travel by visiting these locations in order.</p>
                    
                    <div className="space-y-3 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-blue-300 before:to-transparent">
                      {acceptedPickups.map((req, idx) => (
                        <div key={req.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white bg-blue-500 text-white text-xs font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 relative">
                            {idx + 1}
                          </div>
                          <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-3 rounded border border-blue-200 bg-white shadow-sm ml-4 md:ml-0">
                            <div className="font-semibold text-slate-800 text-sm mb-1">{req.generatorName}</div>
                            <div className="text-xs text-slate-500 flex items-center">
                              <MapPin className="h-3 w-3 mr-1" /> {req.address}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Active Pickups */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-900">Your Accepted Pickups</h3>
              <Badge className="bg-slate-200 text-slate-700 hover:bg-slate-300">{acceptedPickups.length} remaining</Badge>
            </div>

            <div className="space-y-4">
              {acceptedPickups.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="p-8 text-center text-slate-500">
                    You have no active pickups. Check the recommended requests to find work!
                  </CardContent>
                </Card>
              ) : (
                acceptedPickups.map(req => (
                  <Card key={req.id} className="overflow-hidden border-l-4 border-l-blue-500">
                    <CardContent className="p-0">
                      <div className="p-5 flex flex-col sm:flex-row justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-bold text-lg">{req.generatorName}</h4>
                            <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">En Route</Badge>
                          </div>
                          <div className="space-y-1 mb-4">
                            <div className="text-sm flex items-center text-slate-600">
                              <MapPin className="h-4 w-4 mr-2 text-slate-400" /> {req.address}
                            </div>
                            <div className="text-sm flex items-center text-slate-600">
                              <Clock className="h-4 w-4 mr-2 text-slate-400" /> {req.preferredTime}
                            </div>
                          </div>
                          <div className="bg-slate-50 p-2 rounded inline-block">
                            <span className="text-xs font-semibold text-slate-500 uppercase">Items:</span>
                            <span className="text-sm font-medium ml-2">{req.wasteType} ({req.estimatedWeight} kg)</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-start sm:items-end justify-between border-t sm:border-t-0 pt-4 sm:pt-0">
                          <div className="text-left sm:text-right mb-4">
                            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Expected Payout</div>
                            <div className="text-2xl font-bold text-green-600 flex items-center justify-start sm:justify-end">
                              ₹{req.estimatedPrice.toFixed(0)}
                            </div>
                          </div>
                          <Button onClick={() => markCompleted(req.id)} className="w-full sm:w-auto bg-green-600 hover:bg-green-700">
                            <CheckCircle2 className="mr-2 h-4 w-4" /> Mark as Completed
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Opportunity Score & Nearby Requests */}
        <div className="space-y-6">
          
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <StarIcon className="h-32 w-32" />
            </div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <StarIcon className="h-5 w-5 text-yellow-400 fill-yellow-400" /> 
                  Fair Opportunity Score
                </h3>
                <span className="text-2xl font-black text-yellow-400">{pickerProfile.fairnessPriorityScore}</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Because your earnings are currently below the daily target, the ReCircle algorithm is prioritizing you for incoming high-value requests in your area!
              </p>
            </CardContent>
          </Card>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">Recommended Nearby</h3>
              <Link href="/picker/nearby-requests" className="text-sm text-blue-600 font-medium hover:underline">View map</Link>
            </div>
            
            <div className="space-y-4">
              {nearbyRequests.length === 0 ? (
                <div className="text-sm text-slate-500 p-4 border rounded-lg text-center bg-slate-50">
                  No pending requests in your area right now.
                </div>
              ) : (
                nearbyRequests.map(req => (
                  <Card key={req.id} className="hover:border-slate-400 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-semibold">{req.wasteType}</div>
                        <div className="font-bold text-green-600">₹{req.estimatedPrice.toFixed(0)}</div>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center mb-1">
                        <MapPin className="h-3 w-3 mr-1" /> {req.address}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center mb-3">
                        <Clock className="h-3 w-3 mr-1" /> {req.preferredTime}
                      </div>
                      <Button variant="outline" size="sm" className="w-full" onClick={() => acceptPickup(req.id)}>
                        Accept Request
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function StarIcon(props: any) {
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
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
