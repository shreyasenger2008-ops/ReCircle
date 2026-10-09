import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Leaf, ShieldCheck, Banknote, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center px-4 -mt-10">
      
      <div className="mb-8 flex justify-center">
        <div className="bg-green-100 p-4 rounded-full shadow-inner">
          <Leaf className="h-16 w-16 text-green-600" />
        </div>
      </div>

      <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-slate-900 mb-6">
        ReCircle <span className="text-green-600">Fair</span>
      </h1>
      
      <p className="text-xl sm:text-2xl text-slate-600 mb-12 max-w-3xl leading-relaxed">
        Connecting recyclable waste generators with informal waste-pickers to ensure ethical compensation, data-driven fairness, and a cleaner environment.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl w-full text-left">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
          <Banknote className="h-8 w-8 text-green-500 mb-3" />
          <h3 className="font-bold text-slate-900 text-lg mb-2">100% Fair Wage</h3>
          <p className="text-slate-500 text-sm">Algorithmic pricing guarantees informal workers receive above-market rates with 0% platform commission.</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
          <ShieldCheck className="h-8 w-8 text-blue-500 mb-3" />
          <h3 className="font-bold text-slate-900 text-lg mb-2">Anti-Monopoly</h3>
          <p className="text-slate-500 text-sm">Our Fair Match algorithm distributes high-value jobs equitably to prevent route monopolization.</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
          <Leaf className="h-8 w-8 text-emerald-500 mb-3" />
          <h3 className="font-bold text-slate-900 text-lg mb-2">Eco Impact</h3>
          <p className="text-slate-500 text-sm">Generate verifiable digital receipts tracking exact CO₂ saved and fair income routed to the streets.</p>
        </div>
      </div>

      <div className="flex gap-4">
        <Link href="/login">
          <Button size="lg" className="text-lg px-8 h-14 bg-slate-900 hover:bg-slate-800 rounded-full shadow-lg hover:shadow-xl transition-all">
            Enter Platform Demo <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>

    </div>
  );
}
