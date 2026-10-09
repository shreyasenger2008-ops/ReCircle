"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { MOCK_RATES, RecyclableRate } from "@/lib/mock-rates";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Banknote, TrendingUp, TrendingDown, Scale, Edit2, CheckCircle2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function AdminPriceBoard() {
  const { user } = useAuth();
  
  const [rates, setRates] = useState<RecyclableRate[]>(MOCK_RATES);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<RecyclableRate>>({});

  if (!user || user.role !== "admin") {
    return <div className="p-8">Unauthorized. Please log in as an Admin/NGO.</div>;
  }

  const handleEditClick = (rate: RecyclableRate) => {
    setEditingId(rate.id);
    setEditForm(rate);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSave = () => {
    if (!editingId) return;
    
    setRates(prev => prev.map(r => {
      if (r.id === editingId) {
        // Find original in MOCK_RATES to update it (for mock persistence across navigation)
        const original = MOCK_RATES.find(mr => mr.id === editingId);
        if (original) {
          Object.assign(original, { ...editForm, lastUpdated: new Date().toISOString().split('T')[0] });
          return { ...original };
        }
      }
      return r;
    }));
    
    toast.success("Fair Rate settings updated successfully.");
    setEditingId(null);
    setEditForm({});
  };

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto">
      
      <div>
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Banknote className="h-6 w-6 text-green-600" />
          Fair Price Board Management
        </h2>
        <p className="text-slate-500">Regulate base pricing to ensure fair wages against market volatility.</p>
      </div>

      <Card className="shadow-md">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-slate-900">Active Material Rates</CardTitle>
          <CardDescription>
            These rates instantly affect the Fair Match Algorithm and all new pickup requests.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                <tr>
                  <th className="px-6 py-4 font-semibold">Material</th>
                  <th className="px-6 py-4 font-semibold">Market Rate / kg</th>
                  <th className="px-6 py-4 font-semibold text-green-700">Fair Rate / kg</th>
                  <th className="px-6 py-4 font-semibold">Sorting Diff.</th>
                  <th className="px-6 py-4 font-semibold">Demand</th>
                  <th className="px-6 py-4 font-semibold">Last Updated</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rates.map(rate => (
                  <tr key={rate.id} className="hover:bg-slate-50">
                    
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {rate.material}
                    </td>

                    <td className="px-6 py-4 text-slate-500">
                      {editingId === rate.id ? (
                        <Input 
                          type="number" 
                          className="w-20 h-8"
                          value={editForm.marketRate || ""}
                          onChange={e => setEditForm({ ...editForm, marketRate: Number(e.target.value) })}
                        />
                      ) : (
                        `₹${rate.marketRate}`
                      )}
                    </td>

                    <td className="px-6 py-4 font-bold text-green-600 bg-green-50/50">
                      {editingId === rate.id ? (
                        <Input 
                          type="number" 
                          className="w-20 h-8 border-green-300 focus:ring-green-500"
                          value={editForm.fairRate || ""}
                          onChange={e => setEditForm({ ...editForm, fairRate: Number(e.target.value) })}
                        />
                      ) : (
                        <div className="flex items-center gap-1">
                          ₹{rate.fairRate}
                          {rate.fairRate > rate.marketRate && <TrendingUp className="h-3 w-3 text-green-500" />}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {editingId === rate.id ? (
                        <select 
                          className="h-8 rounded border-slate-300 text-sm"
                          value={editForm.sortingDifficulty}
                          onChange={e => setEditForm({ ...editForm, sortingDifficulty: e.target.value as any })}
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      ) : (
                        <Badge variant="outline" className={`
                          ${rate.sortingDifficulty === 'high' ? 'border-red-200 text-red-700 bg-red-50' : 
                            rate.sortingDifficulty === 'medium' ? 'border-orange-200 text-orange-700 bg-orange-50' : 
                            'border-blue-200 text-blue-700 bg-blue-50'}
                        `}>
                          {rate.sortingDifficulty}
                        </Badge>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {editingId === rate.id ? (
                        <select 
                          className="h-8 rounded border-slate-300 text-sm"
                          value={editForm.demandLevel}
                          onChange={e => setEditForm({ ...editForm, demandLevel: e.target.value as any })}
                        >
                          <option value="low">Low</option>
                          <option value="normal">Normal</option>
                          <option value="high">High</option>
                        </select>
                      ) : (
                        <Badge variant="outline" className={`
                          ${rate.demandLevel === 'high' ? 'border-green-200 text-green-700 bg-green-50' : 
                            rate.demandLevel === 'low' ? 'border-slate-200 text-slate-500 bg-slate-50' : 
                            'border-slate-200 text-slate-700'}
                        `}>
                          {rate.demandLevel}
                        </Badge>
                      )}
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-400">
                      {rate.lastUpdated}
                    </td>

                    <td className="px-6 py-4 text-right">
                      {editingId === rate.id ? (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:text-red-700" onClick={handleCancelEdit}>
                            <X className="h-4 w-4" />
                          </Button>
                          <Button size="sm" className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700" onClick={handleSave}>
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600" onClick={() => handleEditClick(rate)}>
                          <Edit2 className="h-4 w-4" />
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
      
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-5 flex items-start gap-3">
        <Scale className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-blue-900">How Fair Rates Impact Pickers</h4>
          <p className="text-sm text-blue-800 mt-1">
            The platform calculates final payouts by using your specified <strong>Fair Rate</strong>, plus additional dynamic compensation based on travel distance, urgency, and the logged sorting difficulty. Always ensure the Fair Rate remains above the local Market Rate to protect worker livelihoods.
          </p>
        </div>
      </div>

    </div>
  );
}