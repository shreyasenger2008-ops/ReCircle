"use client";

import { useAuth } from "@/lib/auth-context";
import { MOCK_RATES } from "@/lib/mock-rates";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Banknote, TrendingUp, Scale, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function GeneratorPriceBoard() {
  const { user } = useAuth();
  
  if (!user || user.role !== "generator") {
    return <div className="p-8">Unauthorized. Please log in as a Generator.</div>;
  }

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto">
      
      <div>
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Banknote className="h-6 w-6 text-green-600" />
          Platform Fair Price Board
        </h2>
        <p className="text-slate-500">Transparent pricing. See exactly how your payments empower waste-pickers.</p>
      </div>

      <Card className="shadow-md">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-slate-900">Live Material Rates</CardTitle>
          <CardDescription>
            We ensure waste-pickers are paid above standard market rates for their essential work.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                <tr>
                  <th className="px-6 py-4 font-semibold">Material</th>
                  <th className="px-6 py-4 font-semibold">Market Rate / kg</th>
                  <th className="px-6 py-4 font-semibold text-green-700 flex items-center gap-1"><ShieldCheck className="h-4 w-4"/> ReCircle Fair Rate</th>
                  <th className="px-6 py-4 font-semibold">Sorting Diff.</th>
                  <th className="px-6 py-4 font-semibold">Demand</th>
                  <th className="px-6 py-4 font-semibold">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {MOCK_RATES.map(rate => (
                  <tr key={rate.id} className="hover:bg-slate-50">
                    
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {rate.material}
                    </td>

                    <td className="px-6 py-4 text-slate-500">
                      ₹{rate.marketRate}
                    </td>

                    <td className="px-6 py-4 font-bold text-green-600 bg-green-50/50">
                      <div className="flex items-center gap-1">
                        ₹{rate.fairRate}
                        {rate.fairRate > rate.marketRate && <TrendingUp className="h-3 w-3 text-green-500" title="Above Market Rate" />}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <Badge variant="outline" className={`
                        ${rate.sortingDifficulty === 'high' ? 'border-red-200 text-red-700 bg-red-50' : 
                          rate.sortingDifficulty === 'medium' ? 'border-orange-200 text-orange-700 bg-orange-50' : 
                          'border-blue-200 text-blue-700 bg-blue-50'}
                      `}>
                        {rate.sortingDifficulty}
                      </Badge>
                    </td>

                    <td className="px-6 py-4">
                      <Badge variant="outline" className={`
                        ${rate.demandLevel === 'high' ? 'border-green-200 text-green-700 bg-green-50' : 
                          rate.demandLevel === 'low' ? 'border-slate-200 text-slate-500 bg-slate-50' : 
                          'border-slate-200 text-slate-700'}
                      `}>
                        {rate.demandLevel}
                      </Badge>
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-400">
                      {rate.lastUpdated}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      <div className="bg-green-50 border border-green-100 rounded-lg p-5 flex items-start gap-3">
        <Scale className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-green-900">The Fair Price Guarantee</h4>
          <p className="text-sm text-green-800 mt-1">
            When you schedule a pickup, the algorithm uses these rates to calculate the base payout. We also automatically add compensation for the picker's travel distance and sorting time. 100% of your payment goes directly to the worker.
          </p>
        </div>
      </div>

    </div>
  );
}