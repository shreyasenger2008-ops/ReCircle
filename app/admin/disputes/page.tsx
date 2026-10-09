"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { MOCK_DISPUTES, MOCK_REQUESTS, MOCK_USERS, Dispute } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, User as UserIcon, Calendar, MessageSquare, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminDisputes() {
  const { user } = useAuth();
  const [refresh, setRefresh] = useState(0);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});

  if (!user || user.role !== "admin") {
    return <div className="p-8">Unauthorized. Please log in as an Admin/NGO.</div>;
  }

  const resolveDispute = (disputeId: string) => {
    const dispute = MOCK_DISPUTES.find(d => d.id === disputeId);
    if (dispute) {
      dispute.status = "resolved";
      
      // Also revert pickup status to completed for demo purposes
      const req = MOCK_REQUESTS.find(r => r.id === dispute.pickupId);
      if (req) {
        req.status = "completed";
      }

      toast.success("Dispute officially resolved.");
      setRefresh(prev => prev + 1);
    }
  };

  const handleNoteChange = (id: string, note: string) => {
    setAdminNotes(prev => ({ ...prev, [id]: note }));
  };

  const openDisputes = MOCK_DISPUTES.filter(d => d.status === "open").sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const resolvedDisputes = MOCK_DISPUTES.filter(d => d.status === "resolved").sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-8 pb-20 max-w-6xl mx-auto">
      
      <div>
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-red-600" />
          Dispute Management
        </h2>
        <p className="text-slate-500">Review user complaints, investigate pickups, and resolve issues.</p>
      </div>

      <div className="space-y-6">
        <h3 className="text-lg font-bold text-slate-900 border-b pb-2">Action Required ({openDisputes.length})</h3>
        
        {openDisputes.length === 0 ? (
          <Card className="border-dashed bg-transparent shadow-none">
            <CardContent className="p-12 text-center text-slate-500">
              No active disputes! Platform is running smoothly.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {openDisputes.map(dispute => {
              const req = MOCK_REQUESTS.find(r => r.id === dispute.pickupId);
              const raisedByUser = MOCK_USERS.find(u => u.id === dispute.raisedBy);
              
              return (
                <Card key={dispute.id} className="border-red-200 shadow-md overflow-hidden flex flex-col md:flex-row">
                  {/* Left Column: Dispute & Statement */}
                  <div className="flex-1 p-6 border-b md:border-b-0 md:border-r border-slate-100">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive" className="uppercase tracking-wider">Action Needed</Badge>
                        <span className="text-sm font-semibold text-slate-500">#{dispute.id}</span>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(dispute.createdAt).toLocaleString()}
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{dispute.reason}</h3>
                    
                    <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 mb-2 text-sm font-bold text-red-900">
                        <MessageSquare className="h-4 w-4" /> User Statement ({raisedByUser?.name || "Unknown"})
                      </div>
                      <p className="text-slate-700 italic text-sm">"{dispute.description}"</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Internal Admin Notes</label>
                      <textarea 
                        className="flex min-h-[80px] w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                        placeholder="Log investigation details here..."
                        value={adminNotes[dispute.id] || ""}
                        onChange={(e) => handleNoteChange(dispute.id, e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Right Column: Pickup Context & Actions */}
                  <div className="w-full md:w-80 bg-slate-50 flex flex-col justify-between">
                    <div className="p-6 space-y-4">
                      <h4 className="font-bold text-slate-900 border-b pb-2">Pickup Context</h4>
                      
                      {!req ? (
                        <p className="text-sm text-slate-500">Pickup details not found.</p>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-xs text-slate-500 uppercase tracking-wider">Pickup ID</span>
                            <span className="text-sm font-medium">#{req.id.replace('req','')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-slate-500 uppercase tracking-wider">Generator</span>
                            <span className="text-sm font-medium">{req.generatorName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-slate-500 uppercase tracking-wider">Picker</span>
                            <span className="text-sm font-medium">{req.pickerName || "N/A"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-slate-500 uppercase tracking-wider">Waste</span>
                            <span className="text-sm font-medium">{req.wasteType} ({req.finalWeight || req.estimatedWeight}kg)</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-slate-500 uppercase tracking-wider">Final Payment</span>
                            <span className="text-sm font-bold text-green-600">₹{req.finalPrice || req.estimatedPrice} ({req.paymentMode || 'upi'})</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6 border-t border-slate-200">
                      <Button className="w-full bg-slate-900 hover:bg-slate-800" onClick={() => resolveDispute(dispute.id)}>
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Mark as Resolved
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {resolvedDisputes.length > 0 && (
        <div className="space-y-4 pt-8">
          <h3 className="text-lg font-bold text-slate-900 border-b pb-2">Recently Resolved</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {resolvedDisputes.map(dispute => (
              <Card key={dispute.id} className="opacity-75">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800">{dispute.reason}</h4>
                    <p className="text-xs text-slate-500">Pickup #{dispute.pickupId.replace('req','')} • Resolved</p>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle2 className="mr-1 h-3 w-3" /> Resolved
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}